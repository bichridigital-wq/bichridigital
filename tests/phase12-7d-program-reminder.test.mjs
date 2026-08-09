import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { hasValidCronAuthorization } from "../lib/push/cron-auth.ts";
import {
  PROGRAM_REMINDER_FALLBACK_BODY,
  PROGRAM_REMINDER_TIMEZONE,
  isWithinProgramReminderWindow,
  programReminderNotification,
  runProgramReminderCheck,
} from "../lib/push/program-reminder-automation.ts";

const SCHEDULE_ID = "10000000-0000-4000-8000-000000000001";
const PROGRAM_ID = "20000000-0000-4000-8000-000000000002";
const DEVICE = {
  id: "30000000-0000-4000-8000-000000000003",
  expoPushToken: "ExponentPushToken[fixture]",
  tokenLastFour: "ture",
};
const schedule = (start = "2026-08-10T21:30:00.000Z", devices = [DEVICE]) => ({
  scheduleId: SCHEDULE_ID,
  programId: PROGRAM_ID,
  programName: "Li Ci Biir Ndiagne",
  emissionSlug: "li-ci-biir-ndiagne",
  scheduledStartTime: start,
  devices,
});

test("auth cron refuse absence et erreur, puis accepte le bon secret", () => {
  const previous = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  assert.equal(hasValidCronAuthorization(new Request("https://example.test")), false);
  process.env.CRON_SECRET = "fixture-secret";
  assert.equal(hasValidCronAuthorization(new Request("https://example.test", { headers: { authorization: "Bearer wrong" } })), false);
  assert.equal(hasValidCronAuthorization(new Request("https://example.test", { headers: { authorization: "Bearer fixture-secret" } })), true);
  if (previous === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = previous;
});

for (const enabled of [false, undefined]) {
  test(`gate ${String(enabled)} interdit lecture, batch et Expo`, async () => {
    let reads = 0;
    let claims = 0;
    let sends = 0;
    const result = await runProgramReminderCheck({
      enabled: enabled === true,
      getEligibleSchedules: async () => { reads += 1; return [schedule()]; },
      claim: async () => { claims += 1; return "batch"; },
      send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
    });
    assert.deepEqual(result, { outcome: "disabled" });
    assert.equal(reads + claims + sends, 0);
  });
}

test("fenêtre future exacte de quinze minutes", () => {
  const now = new Date("2026-08-10T21:00:00.000Z");
  assert.equal(isWithinProgramReminderWindow("2026-08-10T21:16:00.000Z", now), false);
  assert.equal(isWithinProgramReminderWindow("2026-08-10T21:15:00.000Z", now), true);
  assert.equal(isWithinProgramReminderWindow("2026-08-10T21:10:00.000Z", now), true);
  assert.equal(isWithinProgramReminderWindow("2026-08-10T21:01:00.000Z", now), true);
  assert.equal(isWithinProgramReminderWindow("2026-08-10T20:59:00.000Z", now), false);
});

test("contenu canonique, Dakar, request key et payload mobile", () => {
  const notification = programReminderNotification(schedule());
  assert.equal(PROGRAM_REMINDER_TIMEZONE, "Africa/Dakar");
  assert.equal(PROGRAM_REMINDER_FALLBACK_BODY, "Votre émission suivie commence bientôt sur Bichridigital.");
  assert.deepEqual(notification, {
    requestKey: `program-reminder:${SCHEDULE_ID}:2026-08-10T21:30:00.000Z`,
    title: "Li Ci Biir Ndiagne commence bientôt ⏰",
    body: "Rendez-vous à 21h30 sur Bichridigital.",
    data: { type: "emission", emissionSlug: "li-ci-biir-ndiagne", programId: PROGRAM_ID, scheduleId: SCHEDULE_ID },
  });
});

test("aucun follower ne réserve aucun batch", async () => {
  let claims = 0;
  const result = await runProgramReminderCheck({
    enabled: true,
    getEligibleSchedules: async () => [schedule(undefined, [])],
    claim: async () => { claims += 1; return "batch"; },
    send: async () => ({ requested: 0, accepted: 0, failed: 0 }),
  });
  assert.equal(result.outcome, "no_eligible_devices");
  assert.equal(claims, 0);
});

test("répétitions concurrentes restent idempotentes", async () => {
  const claimed = new Set();
  let sends = 0;
  const run = () => runProgramReminderCheck({
    enabled: true,
    getEligibleSchedules: async () => [schedule()],
    claim: async (notification) => {
      if (claimed.has(notification.requestKey)) return null;
      claimed.add(notification.requestKey);
      return "batch";
    },
    send: async () => { sends += 1; return { requested: 1, accepted: 1, failed: 0 }; },
  });
  const results = await Promise.all([run(), run()]);
  assert.equal(claimed.size, 1);
  assert.equal(sends, 1);
  assert.deepEqual(results.map((result) => result.outcome).sort(), ["duplicate", "processed"]);
});

test("une reprogrammation produit une nouvelle clé seulement si l'heure change", () => {
  const first = programReminderNotification(schedule("2026-08-10T21:30:00.000Z"));
  const same = programReminderNotification(schedule("2026-08-10T21:30:00Z"));
  const moved = programReminderNotification(schedule("2026-08-10T22:00:00.000Z"));
  assert.equal(first?.requestKey, same?.requestKey);
  assert.notEqual(first?.requestKey, moved?.requestKey);
});

test("SQL groupé porte tous les filtres d'audience sans legacy", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260809191230_add_program_reminder_push_automation.sql", import.meta.url), "utf8");
  for (const criterion of ["is_published = true", "status = 'scheduled'", "program.is_active = true", "device.is_active = true", "device.notifications_enabled = true", "device.notify_followed_emissions = true", "device.expo_push_token is not null"]) {
    assert.match(sql, new RegExp(criterion.replaceAll(".", "\\."), "i"));
  }
  assert.match(sql, /jsonb_agg[\s\S]+push_device_program_subscriptions/i);
  assert.doesNotMatch(sql, /followed_emission_slugs/i);
});

test("route et réponses ne révèlent aucune preuve appareil", async () => {
  const route = await readFile(new URL("../app/api/internal/push/program-reminder-check/route.ts", import.meta.url), "utf8");
  assert.match(route, /outcome: "unauthorized"[\s\S]+status: 401/);
  assert.doesNotMatch(route, /ExpoPushToken|installationId|CRON_SECRET/);
});
