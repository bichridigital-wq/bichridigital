"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { ARTICLE_CATEGORIES, ARTICLE_CATEGORY_LABELS, ARTICLE_IMAGE_MAX_BYTES, ARTICLE_IMAGE_MIME_TYPES, ARTICLE_MEDIA_BUCKET, type BichridigitalArticle } from "../../../types/bichridigital-article";
import { createArticleAction, deleteArticleCoverAction, registerArticleCoverAction, setArticlePublishedAction, updateArticleAction } from "./article-actions";

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}
function cleanName(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+/, "").slice(-100) || "couverture.webp"; }

export default function ArticleForm({ article }: { article?: BichridigitalArticle }) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [seoDescription, setSeoDescription] = useState(article?.seo_description ?? "");
  const [cover, setCover] = useState<File | null>(null);
  const [preview, setPreview] = useState(article?.cover_url ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const formData = new FormData(event.currentTarget);
    try {
      const result = article ? await updateArticleAction(article.id, formData) : await createArticleAction(formData);
      if (!result.success || !result.articleId) throw new Error(result.message);
      const shouldPublish = formData.get("is_published") === "on";
      if (cover) {
        if (!ARTICLE_IMAGE_MIME_TYPES.includes(cover.type as (typeof ARTICLE_IMAGE_MIME_TYPES)[number]) || cover.size > ARTICLE_IMAGE_MAX_BYTES) throw new Error("La couverture doit être une image JPEG, PNG ou WebP de 8 Mo maximum.");
        const path = `articles/${result.articleId}/${crypto.randomUUID()}-${cleanName(cover.name)}`;
        const supabase = createClient();
        const { error } = await supabase.storage.from(ARTICLE_MEDIA_BUCKET).upload(path, cover, { contentType: cover.type, upsert: false });
        if (error) throw new Error("Le téléversement de la couverture a échoué.");
        const coverResult = await registerArticleCoverAction(result.articleId, path);
        if (!coverResult.success) throw new Error(coverResult.message);
      }
      if (!article && shouldPublish) {
        const publishResult = await setArticlePublishedAction(result.articleId, true);
        if (!publishResult.success) throw new Error(publishResult.message);
      }
      setMessage(result.message); router.push("/admin/conseils"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Une erreur est survenue."); }
    finally { setBusy(false); }
  }

  async function removeCover() {
    if (!article || !confirm("Supprimer définitivement cette couverture ?")) return;
    setBusy(true); const result = await deleteArticleCoverAction(article.id); setMessage(result.message);
    if (result.success) { setPreview(""); router.refresh(); } setBusy(false);
  }

  const field = "mt-2 w-full rounded-2xl border border-white/10 bg-[#08143D] px-4 py-3 text-white outline-none focus:border-[#FCCD12]";
  return <form onSubmit={submit} className="mt-8 space-y-6 rounded-[30px] border border-white/10 bg-white/5 p-6 md:p-9">
    <div className="grid gap-6 md:grid-cols-2"><label className="font-bold">Titre<input name="title" minLength={10} maxLength={120} required value={title} onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }} className={field} /></label><label className="font-bold">Slug<input name="slug" minLength={3} maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required value={slug} onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase()); }} className={field} /></label></div>
    <label className="block font-bold">Résumé <span className="float-right text-sm text-white/50">{excerpt.length}/300</span><textarea name="excerpt" minLength={80} maxLength={300} required rows={4} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={field} /></label>
    <div className="grid gap-6 md:grid-cols-2"><label className="font-bold">Catégorie<select name="category" defaultValue={article?.category ?? ARTICLE_CATEGORIES[0]} className={field}>{ARTICLE_CATEGORIES.map((category) => <option key={category} value={category}>{ARTICLE_CATEGORY_LABELS[category]}</option>)}</select></label><label className="font-bold">Auteur<input name="author_name" maxLength={120} defaultValue={article?.author_name ?? "Bichridigital Agency"} className={field} /></label></div>
    <label className="block font-bold">Contenu Markdown <span className="float-right text-sm text-white/50">minimum 600 caractères</span><textarea name="content" minLength={600} required rows={22} defaultValue={article?.content} className={`${field} font-mono text-sm leading-7`} /></label>
    <div className="grid gap-6 md:grid-cols-2"><label className="font-bold">Titre SEO<input name="seo_title" maxLength={60} defaultValue={article?.seo_title ?? ""} className={field} /></label><label className="font-bold">Description SEO <span className="float-right text-sm text-white/50">{seoDescription.length}/160</span><textarea name="seo_description" minLength={120} maxLength={160} rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className={field} /></label></div>
    <div className="grid gap-6 md:grid-cols-[1fr_280px]"><label className="font-bold">Couverture JPEG, PNG ou WebP (8 Mo max.)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0] ?? null; if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setCover(file); setPreview(file ? URL.createObjectURL(file) : article?.cover_url ?? ""); }} className={`${field} file:mr-4 file:rounded-full file:border-0 file:bg-[#FCCD12] file:px-4 file:py-2 file:font-black`} /></label>{preview && <div><Image src={preview} alt="Aperçu de la couverture" width={560} height={315} unoptimized={preview.startsWith("blob:")} className="aspect-video w-full rounded-2xl object-cover" />{article?.cover_url && !cover && <button type="button" disabled={busy} onClick={removeCover} className="mt-2 text-sm font-bold text-red-300">Supprimer la couverture</button>}</div>}</div>
    <div className="flex flex-wrap gap-6"><label className="flex items-center gap-3 font-bold"><input type="checkbox" name="is_featured" defaultChecked={article?.is_featured} className="h-5 w-5" /> Mettre en avant</label><label className="flex items-center gap-3 font-bold"><input type="checkbox" name="is_published" defaultChecked={article?.is_published} className="h-5 w-5" /> Publier</label></div>
    {message && <p role="status" className="rounded-2xl bg-white/10 px-4 py-3 text-sm">{message}</p>}
    <button disabled={busy} className="rounded-full bg-[#FCCD12] px-7 py-3 font-black text-[#020B2E] disabled:opacity-50">{busy ? "Enregistrement…" : article ? "Enregistrer les modifications" : "Créer l’article"}</button>
  </form>;
}
