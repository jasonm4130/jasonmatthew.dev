import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'apps/web/public');
const signatureSvg = readFileSync(resolve(publicDir, 'signature.svg'), 'utf-8');
const lettermarkSvg = readFileSync(resolve(publicDir, 'jm-lettermark.svg'), 'utf-8');

async function generateOGImage(browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      background: #121212;
      color: #f0f0f0;
      font-family: 'Sora', sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px 100px;
      position: relative;
      overflow: hidden;
    }

    .accent-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: #e8553d;
    }

    .signature {
      width: 360px;
      height: auto;
      margin-bottom: 48px;
    }

    .signature svg {
      width: 100%;
      height: auto;
      fill: #f0f0f0;
    }

    .subtitle {
      font-size: 28px;
      font-weight: 400;
      color: #9a9a9a;
      margin-bottom: 16px;
    }

    .url {
      font-size: 20px;
      color: #e8553d;
      margin-top: auto;
    }

    .dots {
      position: absolute;
      bottom: 60px;
      right: 80px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2a2a2a;
    }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="signature">${signatureSvg}</div>
  <div class="subtitle">Engineering Manager & Builder</div>
  <div class="url">jasonmatthew.dev</div>
  <div class="dots">
    ${Array(15).fill('<div class="dot"></div>').join('')}
  </div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: resolve(publicDir, 'og-default.jpg'),
    type: 'jpeg',
    quality: 90,
  });
  await page.close();
  console.log('Generated og-default.jpg');
}

async function generateFavicon(browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 512, height: 512 });

  // Use the handwritten JM lettermark SVG, recolored to white
  const whiteMark = lettermarkSvg.replace(/fill="#000000"/g, 'fill="#f0f0f0"');

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 512px;
      height: 512px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    .mark {
      width: 420px;
      height: auto;
    }
    .mark svg {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="mark">${whiteMark}</div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: resolve(publicDir, 'favicon-512.png'),
    type: 'png',
    omitBackground: true,
  });
  await page.close();
  console.log('Generated favicon-512.png');

  // Create SVG favicon with prefers-color-scheme support
  const faviconSvg = lettermarkSvg
    .replace(/fill="#000000"/g, 'fill="#111111"')
    .replace(/width="800"/, 'width="512"')
    .replace(/height="200"/, 'height="512"')
    .replace(
      '<defs>',
      `<style>
    g { fill: #111111; }
    @media (prefers-color-scheme: dark) {
      g { fill: #f0f0f0; }
    }
  </style>
  <defs>`,
    );
  writeFileSync(resolve(publicDir, 'favicon.svg'), faviconSvg);
  console.log('Generated favicon.svg');
}

async function generateAppleTouchIcon(browser) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 180, height: 180 });

  const whiteMark = lettermarkSvg.replace(/fill="#000000"/g, 'fill="#f0f0f0"');

  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 180px;
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #121212;
    }
    .mark {
      width: 140px;
      height: auto;
    }
    .mark svg {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="mark">${whiteMark}</div>
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: resolve(publicDir, 'apple-touch-icon.png'),
    type: 'png',
  });
  await page.close();
  console.log('Generated apple-touch-icon.png');
}

async function main() {
  const browser = await chromium.launch();
  await generateOGImage(browser);
  await generateFavicon(browser);
  await generateAppleTouchIcon(browser);
  await browser.close();
  console.log('\nAll assets generated in apps/web/public/');
}

main().catch(console.error);
