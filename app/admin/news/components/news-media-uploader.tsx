"use client";

import { useRef, useState } from "react";
import { Upload } from "tus-js-client";
import { createClient } from "../../../../lib/supabase/client";
import { registerUploadedMediaAction, addYoutubeMediaAction } from "../news-actions";
import {
  TV_NEWS_MEDIA_BUCKET, TV_NEWS_MEDIA_MAX_COUNT, TV_NEWS_TUS_THRESHOLD,
  hasAllowedFileSignature, sanitizeMediaFileName, validateMediaFileMetadata,
} from "../../../../types/tv-news-media";
import NewsMediaPreview from "./news-media-preview";

type Pending = { file: File; progress: number };

export default function NewsMediaUploader({ newsId, currentCount, onChanged }: { newsId: string; currentCount: number; onChanged: () => void }) {
  const supabase = useRef(createClient()).current;
  const [pending, setPending] = useState<Pending[]>([]);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [youtube, setYoutube] = useState("");
  const updateProgress = (file: File, progress: number) => setPending((items) => items.map((item) => item.file === file ? { file, progress } : item));

  const tusUpload = async (file: File, path: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Session administrateur expirée.");
    const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
    await new Promise<void>((resolve, reject) => {
      new Upload(file, {
        endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000], chunkSize: 6 * 1024 * 1024,
        headers: { authorization: `Bearer ${data.session.access_token}` },
        metadata: { bucketName: TV_NEWS_MEDIA_BUCKET, objectName: path, contentType: file.type, cacheControl: "3600" },
        uploadDataDuringCreation: true, removeFingerprintOnSuccess: true,
        onProgress: (sent, total) => updateProgress(file, Math.round(sent / total * 100)),
        onError: reject, onSuccess: () => resolve(),
      }).start();
    });
  };

  const addFiles = async (files: File[]) => {
    setMessage("");
    if (currentCount + files.length > TV_NEWS_MEDIA_MAX_COUNT) return setMessage("Maximum 10 médias par actualité.");
    setPending(files.map((file) => ({ file, progress: 0 })));
    for (const file of files) {
      let path = "";
      try {
        validateMediaFileMetadata(file);
        if (!(await hasAllowedFileSignature(file, file.type))) throw new Error(`Signature de fichier invalide : ${file.name}`);
        path = `news/${newsId}/${crypto.randomUUID()}-${sanitizeMediaFileName(file.name)}`;
        if (file.size <= TV_NEWS_TUS_THRESHOLD) {
          const { error } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
          if (error) throw error; updateProgress(file, 100);
        } else await tusUpload(file, path);
        const result = await registerUploadedMediaAction({ newsId, storagePath: path, fileName: file.name, mimeType: file.type, expectedSize: file.size });
        if (!result.success) throw new Error(result.message);
      } catch (error) {
        if (path) await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).remove([path]);
        setMessage(error instanceof Error ? error.message : "Téléversement impossible.");
        break;
      }
    }
    setPending([]); onChanged();
  };

  return (
    <section className="mt-6 rounded-2xl border border-white/10 p-5">
      <h3 className="font-black">Médias et fichiers joints</h3>
      <label onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); setDragging(false); void addFiles(Array.from(e.dataTransfer.files)); }} className={`mt-4 block cursor-pointer rounded-2xl border border-dashed p-8 text-center ${dragging ? "border-[#FCCD12] bg-[#FCCD12]/10" : "border-white/20"}`}>
        Glissez vos fichiers ici ou cliquez pour les sélectionner
        <input type="file" multiple className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4,video/webm" onChange={(e) => void addFiles(Array.from(e.target.files ?? []))} />
      </label>
      {pending.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-2">{pending.map((item) => <NewsMediaPreview key={item.file.name} {...item} />)}</div>}
      <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(e) => { e.preventDefault(); void (async () => { const result = await addYoutubeMediaAction(newsId, youtube); setMessage(result.message); if (result.success) { setYoutube(""); onChanged(); } })(); }}>
        <input type="url" required value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="URL YouTube" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#020B2E] px-4 py-3" />
        <button className="rounded-full bg-red-600 px-5 py-3 font-bold">Ajouter YouTube</button>
      </form>
      {message && <p role="status" className="mt-4 text-sm text-[#FCCD12]">{message}</p>}
    </section>
  );
}
