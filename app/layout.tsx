import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bichridigital Agency",
  description:
    "Agence de communication digitale, audiovisuelle, photographie, streaming live et développement web au Sénégal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}