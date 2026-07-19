"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Upload } from "tus-js-client";
import { createClient } from "../../../../lib/supabase/client";
import { addYoutubeMediaAction, registerUploadedMediaAction } from "../news-actions";
import {
  TV_NEWS_MEDIA_BUCKET,
  TV_NEWS_MEDIA_MAX_COUNT,
  TV_NEWS_TUS_THRESHOLD,
  hasAllowedFileSignature,
  sanitizeMediaFileName,
  validateMediaFileMetadata,
} from "../../../../types/tv-news-media";
import NewsMediaPreview from "./news-media-preview";

type PendingFile = {
  id: string;
  file: File;
  progress: number;
  isCover: boolean;
  error: string;
};

export type NewsMediaUploadResult = { success: boolean; message: string };
export type NewsMediaUploaderHandle = {
  uploadQueued: (newsId?: string) => Promise<NewsMediaUploadResult>;
  hasQueuedMedia: () => boolean;
};

type Props = {
  newsId?: string;
  currentCount: number;
  onChanged: () => void;
  creationMode?: boolean;
};

const NewsMediaUploader = forwardRef<NewsMediaUploaderHandle, Props>(function NewsMediaUploader(
  { newsId, currentCount, onChanged, creationMode = false },
  ref
) {
  const supabase = useRef(createClient()).current;
  const knownCount = useRef(currentCount);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [youtube, setYoutube] = useState("");
  const [uploading, setUploading] = useState(false);

  const updateFile = (id: string, values: Partial<PendingFile>) => {
    setPending((items) => items.map((item) => item.id === id ? { ...item, ...values } : item));
  };

  const addFiles = async (files: File[]) => {
    setMessage("");
    if (knownCount.current + pending.length + files.length + (youtube.trim() ? 1 : 0) > TV_NEWS_MEDIA_MAX_COUNT) {
      setMessage("Maximum 10 médias par actualité.");
      return;
    }
    const accepted: PendingFile[] = [];
    for (const file of files) {
      try {
        const mediaType = validateMediaFileMetadata(file);
        if (!(await hasAllowedFileSignature(file, file.type))) {
          throw new Error(`Signature de fichier invalide : ${file.name}`);
        }
        accepted.push({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          isCover: mediaType === "image" && !pending.some((item) => item.isCover) && !accepted.some((item) => item.isCover),
          error: "",
        });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : `Fichier refusé : ${file.name}`);
        return;
      }
    }
    setPending((items) => [...items, ...accepted]);
  };

  const tusUpload = async (item: PendingFile, path: string) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw new Error("Session administrateur expirée.");
    const projectId = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
    await new Promise<void>((resolve, reject) => {
      new Upload(item.file, {
        endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000],
        chunkSize: 6 * 1024 * 1024,
        headers: { authorization: `Bearer ${data.session.access_token}` },
        metadata: { bucketName: TV_NEWS_MEDIA_BUCKET, objectName: path, contentType: item.file.type, cacheControl: "3600" },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        onProgress: (sent, total) => updateFile(item.id, { progress: Math.round(sent / total * 100) }),
        onError: reject,
        onSuccess: () => resolve(),
      }).start();
    });
  };

  const uploadQueued = async (overrideNewsId?: string): Promise<NewsMediaUploadResult> => {
    const targetNewsId = overrideNewsId ?? newsId;
    if (!targetNewsId) return { success: false, message: "L’actualité doit d’abord être enregistrée comme brouillon." };
    if (knownCount.current + pending.length + (youtube.trim() ? 1 : 0) > TV_NEWS_MEDIA_MAX_COUNT) {
      return { success: false, message: "Maximum 10 médias par actualité." };
    }
    setUploading(true);
    setMessage("");
    for (const item of pending) {
      let path = "";
      try {
        updateFile(item.id, { error: "", progress: 0 });
        path = `news/${targetNewsId}/${crypto.randomUUID()}-${sanitizeMediaFileName(item.file.name)}`;
        if (item.file.size <= TV_NEWS_TUS_THRESHOLD) {
          const { error } = await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).upload(path, item.file, { contentType: item.file.type, upsert: false });
          if (error) throw new Error("Le téléversement standard a échoué.");
          updateFile(item.id, { progress: 100 });
        } else {
          await tusUpload(item, path);
        }
        const result = await registerUploadedMediaAction({
          newsId: targetNewsId,
          storagePath: path,
          fileName: item.file.name,
          mimeType: item.file.type,
          expectedSize: item.file.size,
          isCover: item.isCover,
        });
        if (!result.success) throw new Error(result.message);
        knownCount.current += 1;
        setPending((items) => items.filter((candidate) => candidate.id !== item.id));
      } catch (error) {
        if (path) await supabase.storage.from(TV_NEWS_MEDIA_BUCKET).remove([path]);
        const detail = error instanceof Error ? error.message : "Téléversement impossible.";
        const failure = `${item.file.name} : ${detail}`;
        updateFile(item.id, { error: failure });
        setMessage(failure);
        setUploading(false);
        onChanged();
        return { success: false, message: failure };
      }
    }
    if (youtube.trim()) {
      const result = await addYoutubeMediaAction(targetNewsId, youtube.trim());
      if (!result.success) {
        setMessage(result.message);
        setUploading(false);
        onChanged();
        return result;
      }
      knownCount.current += 1;
      setYoutube("");
    }
    setUploading(false);
    onChanged();
    const success = { success: true, message: "Tous les médias ont été enregistrés." };
    setMessage(success.message);
    return success;
  };

  useImperativeHandle(ref, () => ({
    uploadQueued,
    hasQueuedMedia: () => pending.length > 0 || Boolean(youtube.trim()),
  }));

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= pending.length) return;
    setPending((items) => {
      const ordered = [...items];
      [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
      return ordered;
    });
  };

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <h3 className="text-xl font-black">Ajouter des images, vidéos, audios ou documents</h3>
      <p className="mt-2 text-sm leading-6 text-gray-400">
        JPG, PNG ou WebP (8 Mo), PDF (20 Mo), MP3 ou M4A (20 Mo), MP4 ou WebM (50 Mo). Maximum 10 médias.
      </p>
      <label
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void addFiles(Array.from(event.dataTransfer.files)); }}
        className={`mt-4 block cursor-pointer rounded-2xl border border-dashed p-8 text-center transition ${dragging ? "border-[#FCCD12] bg-[#FCCD12]/10" : "border-white/20"}`}
      >
        <span className="block font-bold">Glissez-déposez vos fichiers ici</span>
        <span className="mt-3 inline-block rounded-full bg-[#FCCD12] px-5 py-2.5 font-black text-[#020B2E]">Choisir des fichiers</span>
        <input type="file" multiple className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf,audio/mpeg,audio/mp4,video/mp4,video/webm" onChange={(event) => { void addFiles(Array.from(event.target.files ?? [])); event.currentTarget.value = ""; }} />
      </label>

      {pending.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {pending.map((item, index) => (
            <NewsMediaPreview
              key={item.id}
              file={item.file}
              progress={item.progress}
              error={item.error}
              isCover={item.isCover}
              disabled={uploading}
              canMoveUp={index > 0}
              canMoveDown={index < pending.length - 1}
              onRemove={() => setPending((items) => items.filter((candidate) => candidate.id !== item.id))}
              onCover={() => setPending((items) => items.map((candidate) => ({ ...candidate, isCover: candidate.id === item.id })))}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
            />
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input type="url" value={youtube} onChange={(event) => setYoutube(event.target.value)} placeholder="URL YouTube facultative" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#020B2E] px-4 py-3" />
      </div>

      {!creationMode && (
        <button type="button" disabled={uploading || (pending.length === 0 && !youtube.trim())} onClick={() => void uploadQueued()} className="mt-4 rounded-full bg-[#FCCD12] px-6 py-3 font-black text-[#020B2E] disabled:opacity-50">
          {uploading ? "Téléversement…" : "Téléverser les médias sélectionnés"}
        </button>
      )}
      {message && <p role="status" className="mt-4 text-sm text-[#FCCD12]">{message}</p>}
    </section>
  );
});

export default NewsMediaUploader;
