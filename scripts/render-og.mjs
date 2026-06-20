#!/usr/bin/env node
// Render every og/*.html template to a sibling og/*.png at 1200×630.
// Usage: npm run og   (or: node scripts/render-og.mjs)

import { chromium } from 'playwright';
import { readdir, mkdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const OG_DIR = join(REPO_ROOT, 'og');

const SIZE = { width: 1200, height: 630 };

async function main() {
  await mkdir(OG_DIR, { recursive: true });

  const entries = await readdir(OG_DIR);
  const templates = entries.filter(
    f => f.endsWith('.html') && !f.startsWith('_'),
  );

  if (templates.length === 0) {
    console.log('no templates found in og/');
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 2,
  });

  for (const file of templates) {
    const slug = basename(file, '.html');
    const url = 'file://' + join(OG_DIR, file);
    const out = join(OG_DIR, `${slug}.png`);

    process.stdout.write(`  ${slug} … `);
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    // Give the Google Fonts a beat to settle.
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: out,
      type: 'png',
      clip: { x: 0, y: 0, ...SIZE },
    });
    await page.close();
    console.log('ok');
  }

  await browser.close();
  console.log(`\nrendered ${templates.length} image(s) to og/`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
