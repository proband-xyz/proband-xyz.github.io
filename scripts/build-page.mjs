#!/usr/bin/env node
// Build defenses/postcondition-only-prompting.html from its markdown source.
//
// Inputs:
//   content/postcondition-only-prompting.md           — editable source
//   templates/postcondition-only-prompting.template.html — page chrome with
//                                                          a {{ content }}
//                                                          placeholder
//
// Output:
//   defenses/postcondition-only-prompting.html

import { readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const CONTENT  = join(REPO_ROOT, 'content',   'postcondition-only-prompting.md');
const TEMPLATE = join(REPO_ROOT, 'templates', 'postcondition-only-prompting.template.html');
const OUTPUT   = join(REPO_ROOT, 'defenses',  'postcondition-only-prompting.html');

marked.setOptions({
  // Leave inline HTML alone; don't sanitize.
  gfm: true,
  breaks: false,
  pedantic: false,
});

const [markdown, template] = await Promise.all([
  readFile(CONTENT, 'utf8'),
  readFile(TEMPLATE, 'utf8'),
]);

// Strip the leading HTML comment header (build-time note for the editor).
const content = markdown.replace(/^<!--[\s\S]*?-->\s*/, '');

const rendered = marked.parse(content);

if (!template.includes('<!-- {{ content }} -->')) {
  throw new Error(`template is missing the '<!-- {{ content }} -->' marker`);
}

const html = template.replace('<!-- {{ content }} -->', rendered);

await writeFile(OUTPUT, html);
console.log(`wrote ${OUTPUT}`);
