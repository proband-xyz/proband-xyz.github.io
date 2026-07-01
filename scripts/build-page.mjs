#!/usr/bin/env node
// Build the proband.xyz longform pages from their markdown sources.
//
// Each entry pairs an editable markdown source with a chrome template that
// carries a `<!-- {{ content }} -->` marker. The markdown's leading HTML
// comment (an editor note) is stripped, the body is run through marked, and
// the result is injected into the template.
//
//   npm run build
//
// To add a page: create content/<slug>.md + templates/<slug>.template.html and
// append an entry to PAGES below.

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const PAGES = [
  {
    content:  'content/postcondition-only-prompting.md',
    template: 'templates/postcondition-only-prompting.template.html',
    output:   'labs/postcondition-only-prompting.html',
  },
  {
    content:  'content/train-a-model-to-catch-malicious-pdfs.md',
    template: 'templates/train-a-model-to-catch-malicious-pdfs.template.html',
    output:   'labs/train-a-model-to-catch-malicious-pdfs.html',
  },
];

marked.setOptions({
  // Leave inline HTML alone; don't sanitize.
  gfm: true,
  breaks: false,
  pedantic: false,
});

const MARKER = '<!-- {{ content }} -->';

for (const page of PAGES) {
  const [markdown, template] = await Promise.all([
    readFile(join(REPO_ROOT, page.content), 'utf8'),
    readFile(join(REPO_ROOT, page.template), 'utf8'),
  ]);

  // Strip the leading HTML comment header (build-time note for the editor).
  const content = markdown.replace(/^<!--[\s\S]*?-->\s*/, '');
  const rendered = marked.parse(content);

  if (!template.includes(MARKER)) {
    throw new Error(`${page.template} is missing the '${MARKER}' marker`);
  }

  const outPath = join(REPO_ROOT, page.output);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, template.replace(MARKER, rendered));
  console.log(`wrote ${page.output}`);
}
