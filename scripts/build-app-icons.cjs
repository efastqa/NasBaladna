const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Create the exact SVG matching the attached NasBaladna Green Market Logo
function createLogoSvg({ width = 512, height = 512, isAppIconTile = true, includeText = true }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${width}" height="${height}" fill="none">
  <defs>
    <!-- Background subtle gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F9FBF9" />
    </linearGradient>

    <!-- 3D Ribbon N Top / Left Gradient (Fresh bright green to vibrant leaf) -->
    <linearGradient id="nLeftRibbon" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#84CE38" />
      <stop offset="35%" stop-color="#64B930" />
      <stop offset="70%" stop-color="#439A26" />
      <stop offset="100%" stop-color="#2D7C1C" />
    </linearGradient>

    <!-- 3D Ribbon N Diagonal Fold Gradient (Rich vibrant to deep shadow fold) -->
    <linearGradient id="nFoldRibbon" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#84CE38" />
      <stop offset="30%" stop-color="#4FA82A" />
      <stop offset="70%" stop-color="#205E1A" />
      <stop offset="100%" stop-color="#0E3D12" />
    </linearGradient>

    <!-- Speed Lines Gradient -->
    <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#86D43B" />
      <stop offset="100%" stop-color="#55A92B" />
    </linearGradient>

    <!-- Sprouting Leaf Gradient -->
    <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#236E1D" />
      <stop offset="40%" stop-color="#3FA828" />
      <stop offset="85%" stop-color="#68C332" />
      <stop offset="100%" stop-color="#8CE042" />
    </linearGradient>

    <!-- Shadow filter for 3D depth -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0E3812" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background tile -->
  ${
    isAppIconTile
      ? `<rect width="512" height="512" rx="108" fill="url(#bgGrad)" />
         <rect width="510" height="510" x="1" y="1" rx="107" stroke="#E6EFE6" stroke-width="2" />`
      : `<rect width="512" height="512" fill="none" />`
  }

  <!-- ================= LOGO ICON GROUP ================= -->
  <g id="logo-mark" transform="translate(0, ${includeText ? -20 : 15})">
    <!-- 3 Speed Lines on Left -->
    <rect x="98" y="182" width="46" height="11" rx="5.5" fill="url(#speedGrad)" />
    <rect x="76" y="206" width="68" height="11" rx="5.5" fill="url(#speedGrad)" />
    <rect x="104" y="230" width="40" height="11" rx="5.5" fill="url(#speedGrad)" />

    <!-- 3D Ribbon 'N' Shape -->
    <!-- Left vertical curve and pillar -->
    <path
      d="M 194 135 
         C 165 135, 146 155, 146 186
         L 146 250
         C 146 276, 166 295, 192 295
         C 218 295, 238 276, 238 250
         L 238 186
         C 238 155, 219 135, 194 135 Z"
      fill="url(#nLeftRibbon)"
    />

    <!-- Diagonal Fold of 'N' crossing down to right with 3D tubular curvature -->
    <path
      d="M 160 148
         C 180 135, 208 140, 226 160
         L 298 255
         C 318 280, 312 306, 286 312
         C 260 316, 236 296, 224 274
         L 160 178
         C 150 165, 152 153, 160 148 Z"
      fill="url(#nFoldRibbon)"
      filter="url(#softShadow)"
    />

    <!-- Shopping Cart Frame (Dark forest green #0F381E) -->
    <!-- Cart handle and body -->
    <path
      d="M 268 184
         L 294 184
         L 310 248
         L 366 248
         C 374 248, 381 242, 384 234
         L 396 198
         C 399 188, 391 180, 381 180
         L 302 180"
      stroke="#124021"
      stroke-width="17"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
    />

    <!-- Cart dual wheels -->
    <circle cx="316" cy="280" r="14" fill="#124021" />
    <circle cx="366" cy="280" r="14" fill="#124021" />

    <!-- Sprouting Fresh Green Leaf -->
    <g transform="translate(308, 110)">
      <!-- Leaf blade -->
      <path
        d="M 12 78
           C 2 40, 32 10, 84 2
           C 86 48, 62 82, 12 78 Z"
        fill="url(#leafGrad)"
        filter="url(#softShadow)"
      />
      <!-- Leaf central vein -->
      <path
        d="M 18 72
           C 36 54, 56 36, 78 8"
        stroke="#A5EB60"
        stroke-width="4.5"
        stroke-linecap="round"
        fill="none"
        opacity="0.85"
      />
    </g>
  </g>

  ${
    includeText
      ? `
  <!-- ================= WORDMARK & TAGLINE ================= -->
  <!-- "Nas" (Deep Forest Green #114424) -->
  <text
    x="180"
    y="374"
    font-family="'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    font-size="64"
    font-weight="900"
    fill="#114424"
    text-anchor="end"
    letter-spacing="-1.5"
  >Nas</text>

  <!-- "Baladna" (Fresh Harvest Green #4BA635) -->
  <text
    x="184"
    y="374"
    font-family="'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    font-size="64"
    font-weight="900"
    fill="#4BA635"
    text-anchor="start"
    letter-spacing="-1.5"
  >Baladna</text>

  <!-- Tagline: "Shop  🍃  Order  🍃  Get It" -->
  <g transform="translate(256, 416)" text-anchor="middle">
    <!-- "Shop" -->
    <text
      x="-114"
      y="0"
      font-family="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
      font-size="18.5"
      font-weight="700"
      fill="#1C4B26"
      letter-spacing="1.2"
    >Shop</text>

    <!-- First Leaf Icon 🍃 -->
    <path
      d="M -72 -12 C -65 -15 -58 -10 -57 -4 C -58 2 -65 4 -72 -2 C -73 -6 -73 -9 -72 -12 Z"
      fill="#4BA635"
    />
    <path
      d="M -71 -10 C -67 -6 -62 -4 -58 -3"
      stroke="#86D43B"
      stroke-width="1.2"
      fill="none"
    />

    <!-- "Order" -->
    <text
      x="-12"
      y="0"
      font-family="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
      font-size="18.5"
      font-weight="700"
      fill="#1C4B26"
      letter-spacing="1.2"
    >Order</text>

    <!-- Second Leaf Icon 🍃 -->
    <path
      d="M 32 -12 C 39 -15 46 -10 47 -4 C 46 2 39 4 32 -2 C 31 -6 31 -9 32 -12 Z"
      fill="#4BA635"
    />
    <path
      d="M 33 -10 C 37 -6 42 -4 46 -3"
      stroke="#86D43B"
      stroke-width="1.2"
      fill="none"
    />

    <!-- "Get It" -->
    <text
      x="96"
      y="0"
      font-family="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
      font-size="18.5"
      font-weight="700"
      fill="#1C4B26"
      letter-spacing="1.2"
    >Get It</text>
  </g>
  `
      : ''
  }
</svg>
  `.trim();
}

// Generate files
const publicDir = path.join(__dirname, '..', 'public');
const distDir = path.join(__dirname, '..', 'dist');

// 1. Full Official Logo SVG
const fullLogoSvg = createLogoSvg({ width: 512, height: 512, isAppIconTile: false, includeText: true });
fs.writeFileSync(path.join(publicDir, 'nasbaladna-logo.svg'), fullLogoSvg);
console.log('Saved public/nasbaladna-logo.svg');

// 2. Favicon SVG (Tile based for clean contrast in light/dark browser tabs)
const faviconSvg = createLogoSvg({ width: 256, height: 256, isAppIconTile: true, includeText: true });
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);
console.log('Saved public/favicon.svg');

// Helper to render SVG to PNG buffer
function renderPng(svgString, targetSize) {
  const resvg = new Resvg(svgString, {
    fitTo: {
      mode: 'width',
      value: targetSize,
    },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// 3. App Icons Generation (192, 512, apple-touch-icon 180, and maskable)
const appIconSvg = createLogoSvg({ width: 512, height: 512, isAppIconTile: true, includeText: true });
const maskableSvg = createLogoSvg({ width: 512, height: 512, isAppIconTile: true, includeText: true });

const targets = [
  { file: 'pwa-192x192.png', size: 192, svg: appIconSvg },
  { file: 'pwa-512x512.png', size: 512, svg: appIconSvg },
  { file: 'apple-touch-icon.png', size: 180, svg: appIconSvg },
  { file: 'pwa-maskable-512x512.png', size: 512, svg: maskableSvg },
  { file: 'app-icon.png', size: 512, svg: appIconSvg },
];

for (const t of targets) {
  const pngBuffer = renderPng(t.svg, t.size);
  const outPath = path.join(publicDir, t.file);
  fs.writeFileSync(outPath, pngBuffer);
  console.log(`Rendered PNG: ${t.file} (${t.size}x${t.size}, ${pngBuffer.length} bytes)`);

  // Also sync to dist if dist exists
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, t.file), pngBuffer);
  }
}

console.log('All app icons generated successfully!');
