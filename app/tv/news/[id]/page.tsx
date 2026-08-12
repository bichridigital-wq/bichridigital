import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Actualité indisponible",
  robots: { index: false, follow: false },
};

export default function TvNewsPage() {
  notFound();
}
