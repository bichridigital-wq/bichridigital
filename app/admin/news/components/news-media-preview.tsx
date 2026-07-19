"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NewsMediaPreview({ file, progress }: { file: File; progress: number }) {
  const [preview] = useState(() => file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#020B2E] p-4">
      {preview && <div className="relative mb-3 h-28 w-full"><Image src={preview} alt="Aperçu avant téléversement" fill unoptimized className="rounded-xl object-contain" /></div>}
      <p className="truncate font-bold">{file.name}</p>
      <p className="mt-1 text-xs text-gray-400">{file.type} · {(file.size / 1024 / 1024).toFixed(2)} Mo</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#FCCD12] transition-all" style={{ width: `${progress}%` }} /></div>
    </div>
  );
}
