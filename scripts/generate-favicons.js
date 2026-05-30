// Generate circular favicon, PWA, Apple touch, and social preview assets.
// Optimized for transparent PNG/WebP/SVG logo files.
// Usage: node scripts/generate-favicons.js "C:\\path\\to\\transparent-logo.png"

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pngToIco = require("png-to-ico");

const sourcePath = process.argv[2];
const projectRoot = path.resolve(__dirname, "..");

if (!sourcePath) {
  console.error("Please provide the source logo image path.");
  process.exit(1);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Logo file not found: ${sourcePath}`);
  process.exit(1);
}

const publicDir = path.join(projectRoot, "public");
const faviconDir = path.join(publicDir, "favicons");
const iconDir = path.join(publicDir, "icons");

fs.mkdirSync(faviconDir, { recursive: true });
fs.mkdirSync(iconDir, { recursive: true });

const roundMask = (size) =>
  Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
    </svg>`
  );

async function prepareTransparentLogo(size, options = {}) {
  const padding = Math.round(size * (options.paddingRatio ?? 0.04));
  const innerSize = size - padding * 2;

  const fittedLogo = await sharp(sourcePath)
    .rotate()
    .ensureAlpha()
    .trim({ threshold: 8 })
    .resize(innerSize, innerSize, {
      fit: "contain",
      position: "center",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true, quality: 100 })
    .toBuffer();

  let canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: fittedLogo, left: padding, top: padding }]);

  if (options.circleClip !== false) {
    canvas = canvas.composite([{ input: roundMask(size), blend: "dest-in" }]);
  }

  return canvas.png({ compressionLevel: 9, adaptiveFiltering: true, quality: 100 }).toBuffer();
}

async function makeRoundedPng(size, outputPath, options = {}) {
  const png = await prepareTransparentLogo(size, options);
  await sharp(png).toFile(outputPath);
}

async function makeOgImage() {
  const width = 1200;
  const height = 630;
  const logoSize = 360;
  const logoBuffer = await prepareTransparentLogo(logoSize, {
    paddingRatio: 0.02,
    circleClip: true,
  });

  const background = Buffer.from(
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f5f7f5"/>
          <stop offset="1" stop-color="#e8f4ec"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="48" fill="url(#bg)"/>
      <text x="520" y="255" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="800" fill="#102015">DiziStore</text>
      <text x="520" y="335" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600" fill="#31533b">Premium Digital Tools in Bangladesh</text>
      <text x="520" y="395" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="500" fill="#5f7566">Fast delivery • Secure support • Online subscriptions</text>
    </svg>`
  );

  await sharp(background)
    .composite([{ input: logoBuffer, left: 96, top: 135 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true, quality: 100 })
    .toFile(path.join(iconDir, "og-image.png"));
}

async function main() {
  const faviconSizes = [16, 32, 48, 60, 128, 192, 256, 512];

  for (const size of faviconSizes) {
    await makeRoundedPng(size, path.join(faviconDir, `favicon-${size}x${size}.png`));
  }

  await makeRoundedPng(180, path.join(iconDir, "apple-touch-icon.png"), {
    paddingRatio: 0.06,
  });
  await makeRoundedPng(192, path.join(iconDir, "icon-192x192.png"), {
    paddingRatio: 0.06,
  });
  await makeRoundedPng(512, path.join(iconDir, "icon-512x512.png"), {
    paddingRatio: 0.06,
  });
  await makeRoundedPng(512, path.join(iconDir, "icon-maskable-512x512.png"), {
    paddingRatio: 0.16,
  });

  const icoBuffer = await pngToIco([
    path.join(faviconDir, "favicon-16x16.png"),
    path.join(faviconDir, "favicon-32x32.png"),
    path.join(faviconDir, "favicon-48x48.png"),
  ]);

  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
  fs.writeFileSync(path.join(faviconDir, "favicon.ico"), icoBuffer);

  await makeOgImage();

  console.log("Generated circular favicon, app icons, Apple icon, and social preview image.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
