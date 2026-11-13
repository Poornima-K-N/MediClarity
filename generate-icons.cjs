// generate-icons.cjs
// Script to generate valid PWA PNG icons and SVGs without external dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, drawFn) {
  // RGBA buffer: (width * 4 + 1 filter byte) * height
  const rowBytes = width * 4;
  const rawData = Buffer.alloc((rowBytes + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter type: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // Color type: RGBA
  ihdr.writeUInt8(0, 10); // Compression
  ihdr.writeUInt8(0, 11); // Filter
  ihdr.writeUInt8(0, 12); // Interlace: None

  function createChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    
    // CRC32
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Precomputed CRC table
  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c = crcTable[(c ^ buf[n]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const idatChunk = createChunk('IDAT', compressedData);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

// MediClarity Icon drawer: Teal gradient background with crisp white medical cross + heartbeat line
function drawMedicalIcon(x, y, w, h, isMaskable = false) {
  const nx = x / w;
  const ny = y / h;
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background: Rounded teal-cyan gradient
  const grad = nx * 0.4 + ny * 0.6;
  const bgR = Math.round(15 + grad * (14 - 15));
  const bgG = Math.round(118 + grad * (165 - 118));
  const bgB = Math.round(110 + grad * (233 - 110));

  // If not maskable, round corners to a smooth squircle
  if (!isMaskable) {
    const cornerRadius = 0.42;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    // Superellipse / rounded rect approximation
    if (Math.pow(ax / 0.45, 6) + Math.pow(ay / 0.45, 6) > 1.0) {
      return [0, 0, 0, 0]; // Transparent outside
    }
  }

  // Draw Medical Cross (vertical & horizontal bars)
  const barThick = 0.08;
  const barLen = 0.28;
  const inVertBar = Math.abs(dx) <= barThick && Math.abs(dy) <= barLen;
  const inHorizBar = Math.abs(dy) <= barThick && Math.abs(dx) <= barLen;

  // Heartbeat pulse waveform cut into the horizontal bar
  // ECG points: flat -> slight dip -> high spike -> low dip -> recovery
  const px = dx; // -0.28 to +0.28
  let ecgY = 0;
  if (px >= -0.16 && px <= -0.10) {
    ecgY = -0.04 * Math.sin(((px + 0.16) / 0.06) * Math.PI); // slight dip
  } else if (px > -0.10 && px <= 0.0) {
    ecgY = 0.14 * Math.sin(((px + 0.10) / 0.10) * Math.PI); // tall peak
  } else if (px > 0.0 && px <= 0.08) {
    ecgY = -0.09 * Math.sin((px / 0.08) * Math.PI); // deep trough
  } else if (px > 0.08 && px <= 0.14) {
    ecgY = 0.04 * Math.sin(((px - 0.08) / 0.06) * Math.PI); // small wave
  }

  const distToPulse = Math.abs(dy - ecgY);
  const isPulseLine = Math.abs(px) <= 0.22 && distToPulse <= 0.022;

  // Render cross with pulse cutout or glowing contrast
  if (inVertBar || inHorizBar) {
    if (isPulseLine) {
      // Pulse cutout colored in dark teal for contrast
      return [13, 76, 70, 255];
    }
    // Clean bright white medical cross
    return [255, 255, 255, 255];
  }

  // Draw subtle pulse line outside the cross
  if (isPulseLine) {
    return [255, 255, 255, 230];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, 'frontend', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA icons...');

const icon192 = createPNG(192, 192, (x, y, w, h) => drawMedicalIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPNG(512, 512, (x, y, w, h) => drawMedicalIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const maskable512 = createPNG(512, 512, (x, y, w, h) => drawMedicalIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'maskable-icon-512x512.png'), maskable512);

const appleTouch = createPNG(180, 180, (x, y, w, h) => drawMedicalIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Also generate crisp SVG icons for favicon and logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="medGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#medGrad)"/>
  <rect x="42" y="22" width="16" height="56" rx="6" fill="#FFFFFF" filter="url(#shadow)"/>
  <rect x="22" y="42" width="56" height="16" rx="6" fill="#FFFFFF" filter="url(#shadow)"/>
  <path d="M26 50 H36 L41 43 L48 58 L54 38 L60 55 L65 50 H74" stroke="#0F766E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);

console.log('Successfully generated all PWA icons in frontend/public:');
console.log('- pwa-192x192.png');
console.log('- pwa-512x512.png');
console.log('- maskable-icon-512x512.png');
console.log('- apple-touch-icon.png');
console.log('- favicon.svg & logo.svg');
