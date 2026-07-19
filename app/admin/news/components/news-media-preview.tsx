"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  file: File;
  progress: number;
  error: string;
  isCover: boolean;
  disabled: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onRemove: () => void;
  onCover: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export default function NewsMediaPreview({
  file, progress, error, isCover, disabled, canMoveUp, canMoveDown,
  onRemove, onCover, onMoveUp, onMoveDown,
}: Props) {
  const [preview] = useState(() => file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <article className="rounded-2xl border border-white/10 bg-[#020B2E] p-4">
      {preview && <div className="relative mb-3 h-32 w-full"><Image src={preview} alt={`Aperçu de ${file.name}`} fill unoptimized className="rounded-xl object-contain" /></div>}
      <p className="truncate font-bold">{file.name}</p>
      <p className="mt-1 text-xs text-gray-400">{file.type} · {(file.size / 1024 / 1024).toFixed(2)} Mo</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#FCCD12] transition-all" style={{ width: `${progress}%` }} /></div>
      {file.type.startsWith("image/") && <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm"><input type="radio" name="queued-cover" checked={isCover} disabled={disabled} onChange={onCover} className="accent-[#FCCD12]" />Image de couverture</label>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onMoveUp} disabled={disabled || !canMoveUp} aria-label={`Monter ${file.name}`} className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30">↑</button>
        <button type="button" onClick={onMoveDown} disabled={disabled || !canMoveDown} aria-label={`Descendre ${file.name}`} className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-30">↓</button>
        <button type="button" onClick={onRemove} disabled={disabled} className="ml-auto rounded-lg border border-red-400/30 px-3 py-1.5 text-red-300 disabled:opacity-30">Retirer</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
    </article>
  );
}
