#!/usr/bin/env node
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const publicDir = join(root, 'public');

// Source SVG — rounded square + lens on top of lime
const SVG = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="8" fill="#d4ff5e"/>
  <circle cx="13.5" cy="13.5" r="5" stroke="#0a0a0a" stroke-width="2.5" fill="none"/>
  <line x1="17.8" y1="17.8" x2="23" y2="23" stroke="#0a0a0a" stroke-width="2.75" stroke-linecap="round"/>
</svg>`;

// Apple touch icon uses a bigger radius to look better as iOS icon
const SVG_APPLE = `<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#d4ff5e"/>
  <circle cx="76" cy="76" r="28" stroke="#0a0a0a" stroke-width="14" fill="none"/>
  <line x1="100" y1="100" x2="130" y2="130" stroke="#0a0a0a" stroke-width="15" stroke-linecap="round"/>
</svg>`;

// Android chrome — full bleed, no rounding (Android OS applies its own mask)
const SVG_ANDROID = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#d4ff5e"/>
  <circle cx="216" cy="216" r="80" stroke="#0a0a0a" stroke-width="40" fill="none"/>
  <line x1="284" y1="284" x2="372" y2="372" stroke="#0a0a0a" stroke-width="44" stroke-linecap="round"/>
</svg>`;

const outputs = [
    { name: 'favicon-16x16.png', size: 16, svg: SVG },
    { name: 'favicon-32x32.png', size: 32, svg: SVG },
    { name: 'apple-touch-icon.png', size: 180, svg: SVG_APPLE },
    { name: 'android-chrome-192x192.png', size: 192, svg: SVG_ANDROID },
    { name: 'android-chrome-512x512.png', size: 512, svg: SVG_ANDROID },
];

if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

for (const { name, size, svg } of outputs) {
    const buf = Buffer.from(svg);
    await sharp(buf)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(join(publicDir, name));
    console.log(`wrote ${name}`);
}

// Also write favicon.svg (main simple mark)
writeFileSync(join(publicDir, 'favicon.svg'), SVG + '\n');
console.log('wrote favicon.svg');

// Write an OG image at 1200x630 (social share)
const OG = `<svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <!-- logo -->
  <g transform="translate(90,90)">
    <rect width="120" height="120" rx="28" fill="#d4ff5e"/>
    <circle cx="51" cy="51" r="19" stroke="#0a0a0a" stroke-width="9" fill="none"/>
    <line x1="67" y1="67" x2="87" y2="87" stroke="#0a0a0a" stroke-width="10" stroke-linecap="round"/>
  </g>
  <text x="250" y="180" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="96" fill="#ffffff" letter-spacing="-4">Site<tspan fill="#d4ff5e">Lens</tspan></text>
  <text x="90" y="380" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="120" fill="#ffffff" letter-spacing="-6">Visualize your</text>
  <text x="90" y="510" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-style="italic" font-size="120" fill="#d4ff5e" letter-spacing="-6">sitemap instantly.</text>
  <text x="90" y="580" font-family="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="500" font-size="28" fill="#a3a3a3">Enter any URL · Analyze SEO · Uncover hidden pages</text>
</svg>`;
await sharp(Buffer.from(OG)).png().toFile(join(publicDir, 'og-image.png'));
console.log('wrote og-image.png');

// Multi-size favicon.ico (16, 32, 48)
const pngToIco = (await import('png-to-ico')).default;
const icoSizes = [16, 32, 48];
const icoBufs = [];
for (const s of icoSizes) {
    icoBufs.push(
        await sharp(Buffer.from(SVG))
            .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer()
    );
}
const icoBuf = await pngToIco(icoBufs);
writeFileSync(join(publicDir, 'favicon.ico'), icoBuf);
console.log('wrote favicon.ico');
