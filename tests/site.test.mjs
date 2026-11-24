import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let temp;
let output;
let pages;
const attributes = node => Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const elements = (document, tag) => walk(document).filter(n => n.tagName === tag);
const load = file => parse(readFileSync(file, 'utf8'));
const text = node => (node.childNodes || []).map(n => n.value || text(n)).join('');
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? files(file) : [file];
});
function build(destination, extra = [], env = {}) {
  const result = spawnSync('hugo', ['--source', root, '--destination', destination,
    '--cacheDir', path.join(temp, 'cache'), '--environment', 'production', ...extra], {
    encoding: 'utf8', env: { ...process.env, HUGO_RESOURCEDIR: path.join(temp, 'resources'), ...env }
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.doesNotMatch(result.stderr, /deprecated:/i, 'Production build must not use deprecated Hugo APIs.');
}
before(() => {
  temp = mkdtempSync(path.join(os.tmpdir(), 'melted-site-tests-'));
  output = path.join(temp, 'public');
  build(output);
  pages = files(output).filter(f => f.endsWith('.html')).map(file => ({ file, document: load(file) }));
});
after(() => { if (temp) rmSync(temp, { recursive: true, force: true }); });

test('all generated internal links, fragments and images resolve', () => {
  const origin = 'https://meltedinhex.com';
  const techniqueIds = new Set(JSON.parse(readFileSync(path.join(root, 'data', 'extension_attack', 'matrix.json'), 'utf8')).techniques.map(t => t.id));
  const wireSlugs = new Set(JSON.parse(readFileSync(path.join(root, 'static', 'wire', 'wire.json'), 'utf8')).reports.map(r => r.slug));
  const errors = [];
  for (const { file, document } of pages) {
    const url = new URL(path.relative(output, file).split(path.sep).join('/').replace(/index\.html$/, ''), `${origin}/`);
    for (const node of walk(document).filter(n => n.tagName === 'a' || n.tagName === 'img')) {
      const attrs = attributes(node);
      const raw = node.tagName === 'img' ? attrs.src : attrs.href;
      if (!raw) continue;
      const target = new URL(raw, url);
      if (target.origin !== origin) continue;
      let destination = path.join(output, ...decodeURIComponent(target.pathname).split('/').filter(Boolean));
      if (target.pathname.endsWith('/')) destination = path.join(destination, 'index.html');
      if (!existsSync(destination)) {
        errors.push(`${path.relative(output, file)} -> ${raw}`);
        continue;
      }
      if (target.hash && destination.endsWith('.html')) {
        const id = decodeURIComponent(target.hash.slice(1));
        if (target.pathname === '/extension-attack/' && techniqueIds.has(id)) continue;
        if (target.pathname === '/wire/' && wireSlugs.has(id)) continue;
        if (!walk(load(destination)).some(n => attributes(n).id === id || (n.tagName === 'a' && attributes(n).name === id)))
          errors.push(`${path.relative(output, file)} -> missing fragment ${raw}`);
      }
    }
  }
  assert.deepEqual(errors, []);
});

test('every image has an alt attribute and every page has unique IDs', () => {
  for (const { file, document } of pages) {
    const ids = walk(document).map(n => attributes(n).id).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length, `Duplicate IDs in ${file}`);
    for (const image of elements(document, 'img'))
      assert.ok(Object.hasOwn(attributes(image), 'alt'), `Missing alt in ${file}: ${attributes(image).src}`);
  }
});

test('analytics is included once and a skip link reaches main content', () => {
  let primary = 0;
  for (const { file, document } of pages) {
    const redirect = elements(document, 'meta').some(n => attributes(n)['http-equiv']?.toLowerCase() === 'refresh');
    if (redirect) continue;
    primary++;
    assert.equal(elements(document, 'script').filter(n => attributes(n).src?.includes('googletagmanager.com/gtag/js')).length, 1, file);
    assert.ok(elements(document, 'a').some(n => attributes(n).href === '#main-content'), file);
    assert.ok(elements(document, 'main').some(n => attributes(n).id === 'main-content'), file);
  }
  assert.ok(primary > 20);
});

test('schema distinguishes site, publisher, author, About and interactive pages', () => {
  const schemas = route => elements(load(path.join(output, ...route.split('/').filter(Boolean), 'index.html')), 'script')
    .filter(n => attributes(n).type === 'application/ld+json').map(n => JSON.parse(text(n)));
  const home = schemas('').find(s => s['@type'] === 'WebSite');
  assert.equal(home.name, 'Melted in Hex');
  assert.equal(home.publisher['@type'], 'Organization');
  const about = schemas('about').find(s => s['@type'] === 'AboutPage');
  assert.equal(about.mainEntity['@type'], 'Person');
  assert.equal(about.mainEntity.name, 'Mohd Sadique');
  const article = schemas('posts/extension-attack').find(s => s['@type'] === 'BlogPosting');
  assert.equal(article.author[0].name, 'Mohd Sadique');
  assert.equal(article.publisher.name, 'Melted in Hex');
  assert.equal(typeof article.wordCount, 'number');
  for (const route of ['wire', 'tracker', 'extension-attack'])
    assert.ok(schemas(route).some(s => s['@type'] === 'WebPage'), route);
  for (const { document } of pages)
    for (const node of elements(document, 'script').filter(n => attributes(n).type === 'application/ld+json'))
      assert.doesNotThrow(() => JSON.parse(text(node)));
  assert.match(readFileSync(path.join(output, 'index.xml'), 'utf8'), /<language>en-US<\/language>/);
  assert.match(readFileSync(path.join(output, 'index.xml'), 'utf8'), /posts\/extension-attack\//);
});

test('draft tracker targets stay unpublished and are omitted from the tracker', () => {
  const tracker = readFileSync(path.join(output, 'tracker', 'index.html'), 'utf8');
  assert.doesNotMatch(tracker, /href=["']?\/posts\/etherhiding-explained\//);
  assert.equal(existsSync(path.join(output, 'posts', 'etherhiding-explained', 'index.html')), false);
  assert.match(readFileSync(path.join(root, 'content', 'posts', 'etherhiding-explained.md'), 'utf8'), /draft: true/);
});

test('share settings respect global defaults, explicit overrides and legacy disableShare; zero disables Wire polling', () => {
  const content = path.join(temp, 'fixtures');
  mkdirSync(path.join(content, 'posts'), { recursive: true });
  const fixtures = {
    inherit: '',
    explicit: 'ShowShareButtons: true',
    hidden: 'ShowShareButtons: false',
    legacy: 'ShowShareButtons: true\ndisableShare: true',
    byline: 'author: "Guest analyst"'
  };
  for (const [name, settings] of Object.entries(fixtures))
    writeFileSync(path.join(content, 'posts', `${name}.md`), `---\ntitle: "${name}"\ndate: 2020-01-01\n${settings}\n---\nFixture.\n`);
  writeFileSync(path.join(content, 'wire.md'), '---\ntitle: Wire\nlayout: wire\n---\n');
  for (const global of [true, false]) {
    const destination = path.join(temp, `settings-${global}`);
    build(destination, ['--contentDir', content], {
      HUGO_PARAMS_SHOWSHAREBUTTONS: String(global), HUGO_PARAMS_WIREREFRESHSECONDS: '0'
    });
    for (const [name, expected] of Object.entries({ inherit: global, explicit: true, hidden: false, legacy: false, byline: global })) {
      const html = readFileSync(path.join(destination, 'posts', name, 'index.html'), 'utf8');
      assert.equal(html.includes('class=share-buttons') || html.includes('class="share-buttons"'), expected, `${global}/${name}`);
    }
    const wire = elements(load(path.join(destination, 'wire', 'index.html')), 'div').find(n => attributes(n).id === 'wireGrid');
    assert.equal(attributes(wire)['data-refresh'], '0');
    const byline = elements(load(path.join(destination, 'posts', 'byline', 'index.html')), 'script')
      .filter(n => attributes(n).type === 'application/ld+json').map(n => JSON.parse(text(n))).find(s => s['@type'] === 'BlogPosting');
    assert.equal(byline.author[0].name, 'Guest analyst');
  }
});
