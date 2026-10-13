const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function createIcon(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const radius = size * 0.46;

  // Background: Forest Emerald Green (#064E3B -> #047857)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      const gradT = (x + y) / (2 * size);
      const r = Math.round(6 + (4 - 6) * gradT);
      const g = Math.round(78 + (120 - 78) * gradT);
      const b = Math.round(59 + (87 - 59) * gradT);

      // If maskable, full bleed; if regular, rounded squircle/circle or full with rounded border
      if (isMaskable) {
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = 255;
      } else {
        const dx = Math.abs(x - center);
        const dy = Math.abs(y - center);
        const cornerR = size * 0.22;
        const inCorner = dx > (center - cornerR) && dy > (center - cornerR);
        let alpha = 255;
        if (inCorner) {
          const cdx = dx - (center - cornerR);
          const cdy = dy - (center - cornerR);
          const dist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (dist > cornerR) {
            alpha = 0;
          } else if (dist > cornerR - 1.5) {
            alpha = Math.round((cornerR - dist) / 1.5 * 255);
          }
        }
        png.data[idx] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = alpha;
      }
    }
  }

  // Draw white rounded container card in center for the logo
  const cardPad = size * 0.16;
  const cardW = size - cardPad * 2;
  const cardH = size - cardPad * 2;
  const cardCorner = size * 0.08;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x >= cardPad && x <= size - cardPad && y >= cardPad && y <= size - cardPad) {
        const idx = (size * y + x) << 2;
        const dx = Math.min(x - cardPad, size - cardPad - x);
        const dy = Math.min(y - cardPad, size - cardPad - y);
        let inCard = true;
        if (dx < cardCorner && dy < cardCorner) {
          const cornerDist = Math.sqrt((cardCorner - dx) ** 2 + (cardCorner - dy) ** 2);
          if (cornerDist > cardCorner) inCard = false;
        }

        if (inCard) {
          // Soft warm white background (#FFFFFF)
          png.data[idx] = 255;
          png.data[idx + 1] = 255;
          png.data[idx + 2] = 255;
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  // Draw stylized N logo + Leaf in vibrant emerald (#164E24, #3FA636, #22C55E)
  // Scale coordinates from 0..100 to size
  const toX = (val) => Math.round(cardPad + (val / 100) * cardW);
  const toY = (val) => Math.round(cardPad + (val / 100) * cardH);

  // Left vertical pillar of N (x: 20..36, y: 22..78)
  for (let y = toY(22); y <= toY(78); y++) {
    for (let x = toX(20); x <= toX(36); x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 22;
        png.data[idx + 1] = 78;
        png.data[idx + 2] = 36;
        png.data[idx + 3] = 255;
      }
    }
  }

  // Right vertical pillar of N (x: 52..68, y: 22..78)
  for (let y = toY(22); y <= toY(78); y++) {
    for (let x = toX(52); x <= toX(68); x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 45;
        png.data[idx + 1] = 135;
        png.data[idx + 2] = 55;
        png.data[idx + 3] = 255;
      }
    }
  }

  // Diagonal slash of N (from top of left to bottom of right)
  for (let step = 0; step <= 100; step++) {
    const t = step / 100;
    const cx = toX(20 + t * 44);
    const cy = toY(22 + t * 56);
    const thick = Math.round(size * 0.04);
    for (let dy = -thick; dy <= thick; dy++) {
      for (let dx = -thick; dx <= thick; dx++) {
        const px = cx + dx;
        const py = cy + dy;
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const idx = (size * py + px) << 2;
          png.data[idx] = Math.round(22 + (45 - 22) * t);
          png.data[idx + 1] = Math.round(78 + (135 - 78) * t);
          png.data[idx + 2] = Math.round(36 + (55 - 36) * t);
          png.data[idx + 3] = 255;
        }
      }
    }
  }

  // Leaf sprouting on top right (x: 62..84, y: 14..36)
  for (let y = toY(14); y <= toY(36); y++) {
    for (let x = toX(62); x <= toX(84); x++) {
      const lx = (x - toX(62)) / (toX(84) - toX(62));
      const ly = (y - toY(14)) / (toY(36) - toY(14));
      // Organic leaf curve condition
      if (lx + ly >= 0.4 && lx * lx + (1 - ly) * (1 - ly) <= 0.95 && ly >= 0.1) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 34;
        png.data[idx + 1] = 197;
        png.data[idx + 2] = 94;
        png.data[idx + 3] = 255;
      }
    }
  }

  // Speed lines / shopping cart accent at bottom (x: 20..78, y: 82..88)
  for (let y = toY(82); y <= toY(86); y++) {
    for (let x = toX(20); x <= toX(78); x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = 74;
      png.data[idx + 1] = 166;
      png.data[idx + 2] = 53;
      png.data[idx + 3] = 255;
    }
  }

  return png;
}

const publicDir = path.join(__dirname, '..', 'public');

const sizes = [
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const s of sizes) {
  const p = createIcon(s.size, s.maskable);
  const outPath = path.join(publicDir, s.file);
  p.pack().pipe(fs.createWriteStream(outPath));
  console.log(`Generated ${s.file} (${s.size}x${s.size})`);
}
