#!/usr/bin/env node
// Generate labs/loss_curve.svg — the training loss curve for the Argus PDF-Lab
// adapter (Mistral-Small-Instruct-2409-bf16 + rank-8 LoRA, 16 layers, lr 5e-5,
// 5000 iters). Train loss is reported every 25 iters and val loss every 200 in
// data/argus_v2/adapters/pdf_lab_small/train.log (on macstudio).
//
// The points below are a faithful downsample that preserves the shape and the
// three transient bumps (~iter 525, 3000, 4000) that recover within ~100 iters.
// Colours are baked to the proband.xyz palette so the figure can be served as a
// plain <img>. Re-run if the training run changes:  node scripts/build-loss-curve.mjs

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'labs', 'loss_curve.svg');

// [iter, loss]
const train = [
  [25, 6.036], [50, 3.421], [75, 3.235], [100, 2.832], [125, 2.936],
  [150, 2.437], [175, 2.445], [200, 2.297], [250, 2.070], [300, 1.836],
  [325, 1.614], [375, 1.511], [425, 1.559], [500, 1.434], [525, 3.105],
  [575, 1.885], [650, 1.868], [775, 1.707], [875, 1.618], [975, 1.454],
  [1100, 1.478], [1200, 1.420], [1400, 1.486], [1600, 1.421], [1800, 1.419],
  [2000, 1.375], [2200, 1.378], [2400, 1.380], [2575, 1.495], [2650, 1.597],
  [2800, 1.370], [3000, 1.706], [3075, 1.422], [3300, 1.388], [3500, 1.379],
  [3700, 1.391], [3975, 1.447], [4000, 1.959], [4075, 3.077], [4150, 1.561],
  [4300, 1.465], [4500, 1.383], [4600, 1.375], [4800, 1.375], [5000, 1.375],
];

// [iter, loss] — reported every 200 iters
const val = [
  [1, 3.976], [200, 2.068], [400, 1.749], [600, 1.997], [800, 1.676],
  [1000, 1.720], [1200, 1.451], [1400, 1.407], [1600, 1.405], [1800, 1.385],
  [2000, 1.393], [2200, 1.396], [2400, 1.381], [2600, 1.426], [2800, 1.414],
  [3000, 1.638], [3200, 1.430], [3400, 1.396], [3600, 1.443], [3800, 1.386],
  [4000, 1.654], [4200, 1.426], [4400, 1.394], [4600, 1.375], [4800, 1.375],
];

const C = {
  ink: '#181513', inkSoft: '#3A3430', warm: '#4A3D32',
  rule: '#C9BFAB', signal: '#B85C3B', boneDeep: '#E5DECE',
};

const W = 720, H = 300, mL = 46, mR = 18, mT = 20, mB = 38;
const pw = W - mL - mR, ph = H - mT - mB;
const ITER = 5000, LMAX = 6.2;

const x = (i) => mL + (i / ITER) * pw;
const y = (l) => mT + (1 - l / LMAX) * ph;
const line = (pts) =>
  pts.map((p, i) => (i ? 'L' : 'M') + x(p[0]).toFixed(1) + ' ' + y(p[1]).toFixed(1)).join(' ');

// horizontal gridlines at loss = 2, 4, 6
const gridY = [2, 4, 6].map((l) => `
  <line x1="${mL}" y1="${y(l).toFixed(1)}" x2="${W - mR}" y2="${y(l).toFixed(1)}"
        stroke="${C.rule}" stroke-width="0.5" stroke-dasharray="2 3" />
  <text x="${mL - 8}" y="${(y(l) + 3.5).toFixed(1)}" text-anchor="end"
        font-family="'IBM Plex Mono', monospace" font-size="10" fill="${C.warm}">${l.toFixed(1)}</text>`).join('');

// x-axis ticks
const ticks = [0, 1250, 2500, 3750, 5000].map((i) => `
  <text x="${x(i).toFixed(1)}" y="${H - 14}" text-anchor="middle"
        font-family="'IBM Plex Mono', monospace" font-size="10" fill="${C.warm}">${i}</text>`).join('');

const valDots = val.map((p) =>
  `<circle cx="${x(p[0]).toFixed(1)}" cy="${y(p[1]).toFixed(1)}" r="2.2" fill="${C.signal}" />`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img"
     aria-label="Training and validation loss falling from 6.0 to about 1.4 over 5000 iterations, then flat.">
  <rect x="${mL}" y="${mT}" width="${pw}" height="${ph}" fill="none" stroke="${C.rule}" stroke-width="0.6" />
  ${gridY}
  ${ticks}
  <text x="${x(2500).toFixed(1)}" y="${H - 2}" text-anchor="middle"
        font-family="'IBM Plex Mono', monospace" font-size="9.5" fill="${C.warm}" letter-spacing="0.12em">ITERATION</text>
  <path d="${line(train)}" fill="none" stroke="${C.inkSoft}" stroke-width="1.1" stroke-linejoin="round" />
  <path d="${line(val)}" fill="none" stroke="${C.signal}" stroke-width="1.4" stroke-linejoin="round" opacity="0.85" />
  ${valDots}
  <!-- legend -->
  <line x1="${W - mR - 150}" y1="${mT + 12}" x2="${W - mR - 132}" y2="${mT + 12}" stroke="${C.inkSoft}" stroke-width="1.1" />
  <text x="${W - mR - 126}" y="${mT + 15.5}" font-family="'IBM Plex Mono', monospace" font-size="10" fill="${C.warm}">train loss</text>
  <line x1="${W - mR - 150}" y1="${mT + 28}" x2="${W - mR - 132}" y2="${mT + 28}" stroke="${C.signal}" stroke-width="1.4" />
  <circle cx="${W - mR - 141}" cy="${mT + 28}" r="2.2" fill="${C.signal}" />
  <text x="${W - mR - 126}" y="${mT + 31.5}" font-family="'IBM Plex Mono', monospace" font-size="10" fill="${C.warm}">val loss</text>
</svg>
`;

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg);
console.log(`wrote ${OUT}`);
