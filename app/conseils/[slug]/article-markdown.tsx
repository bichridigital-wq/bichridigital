import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function nodeText(node: ReactNode): string { if (typeof node === "string" || typeof node === "number") return String(node); if (Array.isArray(node)) return node.map(nodeText).join(""); return ""; }
export function headingSlug(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function extractHeadings(content: string) { return [...content.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({ level: match[1].length, label: match[2].replace(/[*_`]/g, "").trim(), id: headingSlug(match[2].replace(/[*_`]/g, "").trim()) })); }

export default function ArticleMarkdown({ content }: { content: string }) {
  return <div className="space-y-6 text-lg leading-9 text-white/75"><ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{
    h1: ({ children }) => <h2 id={headingSlug(nodeText(children))} className="pt-5 text-4xl font-black text-white">{children}</h2>,
    h2: ({ children }) => <h2 id={headingSlug(nodeText(children))} className="pt-5 text-3xl font-black text-white">{children}</h2>,
    h3: ({ children }) => <h3 id={headingSlug(nodeText(children))} className="pt-4 text-2xl font-black text-white">{children}</h3>,
    p: ({ children }) => <p>{children}</p>, ul: ({ children }) => <ul className="list-disc space-y-2 pl-6">{children}</ul>, ol: ({ children }) => <ol className="list-decimal space-y-2 pl-6">{children}</ol>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-[#FCCD12] bg-white/5 px-6 py-4 italic">{children}</blockquote>, strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
    a: ({ href = "", children }) => { const external = /^https?:\/\//i.test(href); return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="font-bold text-[#FCCD12] underline">{children}</a>; },
  }}>{content}</ReactMarkdown></div>;
}
