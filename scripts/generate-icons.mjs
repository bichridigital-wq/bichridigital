import sharp from "sharp";
import fs from "fs";
import path from "path";

const inputLogo = path.join(process.cwd(), "public", "logo.png");
const outputDir = path.join(process.cwd(), "public", "icons");

if (!fs.existsSync(inputLogo)) {
  console.error("Erreur : public/logo.png introuvable");
  process.exit(1);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function createIcon(size, filename, paddingRatio = 0.18) {
  const padding = Math.round(size * paddingRatio);
  const logoSize = size - padding * 2;

  const resizedLogo = await sharp(inputLogo)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 2, g: 11, b: 46, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 2, g: 11, b: 46, alpha: 1 },
    },
  })
    .composite([
      {
        input: resizedLogo,
        gravity: "center",
      },
    ])
    .png()
    .toFile(path.join(outputDir, filename));

  console.log(`Icône créée : public/icons/${filename}`);
}

await createIcon(192, "icon-192.png", 0.16);
await createIcon(512, "icon-512.png", 0.16);
await createIcon(512, "maskable-512.png", 0.25);

console.log("Toutes les icônes PWA ont été générées avec succès.");