import "server-only";

import webpush from "web-push";
import { createAdminClient } from "./supabase/admin";

type PushSummary = { total: number; sent: number; failed: number; expired: number; skipped: number };
type SubscriptionRow = { id: string; endpoint: string; p256dh: string; auth: string; failure_count: number };

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) throw new Error("Configuration VAPID absente.");
  if (!/^https:\/\//.test(subject) && !/^mailto:[^\s@]+@[^\s@]+$/.test(subject)) throw new Error("VAPID_SUBJECT invalide.");
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

const compact = (value: string, maximum: number) => value.replace(/\s+/g, " ").trim().slice(0, maximum);

export async function sendPushNotificationForNews(newsId: string): Promise<PushSummary> {
  configureWebPush();
  const admin = createAdminClient();
  const summary: PushSummary = { total: 0, sent: 0, failed: 0, expired: 0, skipped: 0 };
  const { data: news, error: newsError } = await admin.from("tv_news").select("id,title,summary,is_breaking,is_published,notification_requested,notified_at").eq("id", newsId).maybeSingle();
  if (newsError || !news || !news.is_published || !news.notification_requested || news.notified_at) return summary;
  let query = admin.from("push_subscriptions").select("id,endpoint,p256dh,auth,failure_count").eq("is_active", true);
  if (!news.is_breaking) query = query.eq("notification_scope", "all");
  const { data: subscriptions, error } = await query; if (error) throw new Error("Chargement des abonnements impossible.");
  summary.total = subscriptions?.length ?? 0;
  if (!subscriptions?.length) { await admin.from("tv_news").update({ notified_at: new Date().toISOString() }).eq("id", newsId).is("notified_at", null); return summary; }
  const { error: deliveryError } = await admin.from("tv_news_push_deliveries").upsert(subscriptions.map((subscription) => ({ news_id: newsId, subscription_id: subscription.id })), { onConflict: "news_id,subscription_id", ignoreDuplicates: true });
  if (deliveryError) throw new Error("Préparation des livraisons impossible.");
  const payload = JSON.stringify({ newsId: news.id, title: compact(news.title, 100), summary: compact(news.summary, 180), isBreaking: news.is_breaking, url: `/tv/news/${news.id}` });
  for (let offset = 0; offset < subscriptions.length; offset += 20) {
    const batch = (subscriptions.slice(offset, offset + 20) as SubscriptionRow[]).map(async (subscription) => {
      const { data: delivery } = await admin.from("tv_news_push_deliveries").select("id,status,attempt_count").eq("news_id", newsId).eq("subscription_id", subscription.id).single();
      if (!delivery || delivery.status === "sent" || delivery.status === "expired") { summary.skipped += 1; return; }
      const { data: claimed } = await admin.from("tv_news_push_deliveries").update({ attempt_count: delivery.attempt_count + 1, last_error: null }).eq("id", delivery.id).eq("attempt_count", delivery.attempt_count).eq("status", delivery.status).select("id").maybeSingle();
      if (!claimed) { summary.skipped += 1; return; }
      try {
        await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, payload, { TTL: 60 * 60 });
        const now = new Date().toISOString();
        await Promise.all([admin.from("tv_news_push_deliveries").update({ status: "sent", sent_at: now, last_error: null }).eq("id", delivery.id), admin.from("push_subscriptions").update({ failure_count: 0, last_success_at: now }).eq("id", subscription.id)]);
        summary.sent += 1;
      } catch (cause) {
        const statusCode = typeof cause === "object" && cause && "statusCode" in cause ? Number(cause.statusCode) : 0;
        const expired = statusCode === 404 || statusCode === 410; const now = new Date().toISOString();
        await Promise.all([admin.from("tv_news_push_deliveries").update({ status: expired ? "expired" : "failed", last_error: expired ? "Abonnement expiré" : "Erreur temporaire du service Push" }).eq("id", delivery.id), admin.from("push_subscriptions").update({ is_active: expired ? false : true, failure_count: subscription.failure_count + 1, last_failure_at: now }).eq("id", subscription.id)]);
        if (expired) summary.expired += 1; else summary.failed += 1;
      }
    });
    await Promise.allSettled(batch);
  }
  if (summary.failed === 0) await admin.from("tv_news").update({ notified_at: new Date().toISOString() }).eq("id", newsId).is("notified_at", null);
  return summary;
}
