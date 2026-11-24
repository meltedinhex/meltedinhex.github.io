import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync(new URL('../../static/wire/wire.json', import.meta.url), 'utf8'));
const fixture = () => {
  const data = structuredClone(snapshot);
  data.reports[0].iocs = { domain: ['example.invalid'] };
  return data;
};
const json = data => ({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
const feedRoute = '**/wire/wire.json';
const article = '/posts/extension-attack/';
const routes = ['/', '/about/', article, '/tracker/', '/wire/', '/search/', '/extension-attack/', '/archives/', '/tags/', '/series/'];
const pageErrors = new WeakMap();

test.beforeEach(async ({ page, context }) => {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  pageErrors.set(page, errors);
});
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]); });

for (const width of [390, 1440]) {
  test(`main routes fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });

  test(`article theme contrast and anchor offsets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(article);
    for (const theme of ['dark', 'light']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) await page.locator('#theme-toggle').click();
      const ratios = await page.evaluate(() => {
        const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const luminance = value => rgb(value).map(v => {
          v /= 255;
          return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const background = luminance(getComputedStyle(document.body).backgroundColor);
        return [...document.querySelectorAll('.post-content h2, .post-content strong, .post-content a')]
          .filter(n => n.getBoundingClientRect().height > 0).map(n => {
            const foreground = luminance(getComputedStyle(n).color);
            return { text: n.textContent.slice(0, 30), ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05) };
          });
      });
      expect(ratios.length).toBeGreaterThan(10);
      for (const item of ratios) expect(item.ratio, `${theme}: ${item.text}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(await page.locator('html').evaluate(n => getComputedStyle(n).scrollBehavior)).toBe('auto');
    await page.locator('.toc summary').click();
    const link = page.locator('.toc a').first();
    const href = await link.getAttribute('href');
    await link.click();
    const top = await page.locator(href).evaluate(n => n.getBoundingClientRect().top);
    const bottom = await page.locator('header.header').evaluate(n => n.getBoundingClientRect().bottom);
    expect(top).toBeGreaterThanOrEqual(bottom + 8);
  });
}

test('homepage identity, skip navigation and About share setting remain correct', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mh-byline a')).toHaveText('Mohd Sadique');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.goto('/about/');
  await expect(page.locator('.share-buttons')).toHaveCount(0);
  await page.goto(article);
  await expect(page.locator('.share-buttons')).toHaveCount(1);
});

test('code copy acknowledges success, permission denial and a failed legacy fallback', async ({ page }) => {
  await page.goto(article);
  const button = page.locator('.copy-code').first();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async () => { throw new Error('Permission denied'); } }
  }));
  await button.click();
  await expect(button).toHaveText('copy failed');
  await expect(page.locator('.copy-status').filter({ hasText: 'Could not copy' })).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    document.execCommand = () => false;
  });
  await button.click();
  await expect(button).toHaveText('copy failed');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async text => { window.copiedText = text; } }
  }));
  await button.click();
  await expect(button).toHaveText('copied!');
  expect(await page.evaluate(() => window.copiedText.length)).toBeGreaterThan(0);
});

test('search retries index failures and explains no results', async ({ page }) => {
  let failed = true;
  await page.route('**/index.json', route => failed ? route.abort() : route.continue());
  await page.goto('/search/');
  await expect(page.locator('#searchStatus')).toContainText('could not load');
  await expect(page.locator('#searchRetry')).toBeVisible();
  await page.locator('#searchInput').fill('Extension ATT');
  failed = false;
  await page.locator('#searchRetry').click();
  await expect(page.locator('#searchResults li').first()).toBeVisible();
  await expect(page.locator('#searchStatus')).toContainText('results for');
  await page.locator('#searchInput').fill('zzzz-unmatched-438391');
  await expect(page.locator('#searchStatus')).toContainText('No results');
  await expect(page.locator('#searchResults li')).toHaveCount(0);
  await page.locator('#searchInput').press('Escape');
  await expect(page.locator('#searchInput')).toHaveValue('');
  await expect(page.locator('#searchStatus')).toContainText('Search is ready');
});

test('search replays a query entered before its delayed index arrives', async ({ page }) => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/index.json', async route => { await pending; await route.continue(); });
  await page.goto('/search/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#searchInput')).toBeEnabled();
  await page.locator('#searchInput').fill('Extension ATT');
  await expect(page.locator('#searchStatus')).toContainText('Loading');
  release();
  await expect(page.locator('#searchResults li').first()).toBeVisible();
  await expect(page.locator('#searchInput')).toHaveValue('Extension ATT');
  await page.locator('#searchInput').press('ArrowDown');
  await expect(page.locator('#searchResults .entry-link').first()).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.locator('#searchInput')).toBeFocused();
});

test('Wire paginates without limiting search, filters or deep links', async ({ page }) => {
  await page.route(feedRoute, route => route.fulfill(json(fixture())));
  await page.goto('/wire/');
  await expect(page.locator('.wire-card')).toHaveCount(24);
  await expect(page.locator('#wireCount')).toHaveText(`Showing 24 of ${snapshot.reports.length} threats`);
  await page.locator('#wireMore').click();
  await expect(page.locator('.wire-card')).toHaveCount(48);
  const last = snapshot.reports.at(-1);
  await page.locator('#wireSearch').fill(last.name);
  await expect(page.locator('.wire-card')).toHaveCount(1);
  await expect(page.locator('.wire-card')).toContainText(last.name);
  await page.locator('#wireSearch').fill('zzzz-unmatched-438391');
  await expect(page.locator('#wireEmpty')).toBeVisible();
  await page.goto(`/wire/#${last.slug}`);
  await expect(page.locator('#wireDossierTitle')).toHaveText(last.name);
  await page.locator('#wireDClose').click();
  await page.locator('[data-sev="critical"]').click();
  await expect(page.locator('[data-sev="critical"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.wire-card:not(.sev-critical)').count()).toBe(0);
  await expect(page.locator('#wireStats')).toContainText('updated · 24h');
});

test('Wire modal contains focus, closes with Escape/backdrop and follows hash history', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route(feedRoute, route => route.fulfill(json(fixture())));
  await page.goto('/wire/');
  const dialog = page.locator('#wireDossier');
  await expect(dialog).toBeHidden();
  expect(await dialog.evaluate(n => getComputedStyle(n).display)).toBe('none');
  const opener = page.locator('.wire-card-link').first();
  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#wireDClose')).toBeFocused();
  await dialog.locator('a,button,input').last().focus();
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement === document.body ||
    document.querySelector('#wireDossier').contains(document.activeElement))).toBe(true);
  await page.evaluate(() => document.querySelector('.logo a').focus());
  expect(await page.evaluate(() => document.activeElement !== document.querySelector('.logo a'))).toBe(true);
  const a = snapshot.reports[0];
  const b = snapshot.reports[1];
  await page.evaluate(hash => { location.hash = hash; }, b.slug);
  await expect(page.locator('#wireDossierTitle')).toHaveText(b.name);
  await page.goBack();
  await expect(page.locator('#wireDossierTitle')).toHaveText(a.name);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(new URL(page.url()).hash).toBe('');
  await expect(opener).toBeFocused();
  await opener.click();
  await page.mouse.click(10, 300);
  await expect(dialog).toBeHidden();
  await opener.click();
  await page.locator('#wireDClose').click();
  await opener.click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#wireDossierTitle')).toHaveText(a.name);
});

test('Wire source links retain their normal keyboard behaviour', async ({ page, context }) => {
  await page.route(feedRoute, route => route.fulfill(json(fixture())));
  await page.goto('/wire/');
  const source = page.locator('.wire-src').first();
  await source.focus();
  const popupPromise = context.waitForEvent('page');
  await page.keyboard.press('Enter');
  const popup = await popupPromise;
  await popup.close();
  await expect(page.locator('#wireDossier')).toBeHidden();
});

test('Wire copy failure is not success and defanged copies use the displayed value', async ({ page }) => {
  await page.clock.install();
  await page.route(feedRoute, route => route.fulfill(json(fixture())));
  await page.goto(`/wire/#${snapshot.reports[0].slug}`);
  const button = page.locator('#wireCopyAll');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async () => { throw new Error('Permission denied'); } }
  }));
  await button.click();
  await expect(page.locator('#wireCopyStatus')).toContainText('Could not copy');
  await expect(button).toHaveText('copy all');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {
    configurable: true, value: { writeText: async text => { window.copiedText = text; } }
  }));
  await page.locator('#wireDefang').check();
  await button.click();
  await expect(page.locator('#wireCopyStatus')).toHaveText('Indicators copied.');
  expect(await page.evaluate(() => window.copiedText)).toBe('example[.]invalid');
  await button.click();
  await expect(button).toContainText('copied');
  await page.clock.fastForward(1400);
  await expect(button).toHaveText('copy all');
});

test('Wire exposes initial failure, malformed data and a working retry', async ({ page }) => {
  let mode = 'network';
  await page.route(feedRoute, route => mode === 'network' ? route.abort()
    : route.fulfill(json(mode === 'invalid' ? { reports: 'invalid' } : fixture())));
  await page.goto('/wire/');
  await expect(page.locator('#wireStatus')).toHaveText('Feed unavailable');
  await expect(page.locator('#wireError')).toContainText('Could not load');
  await expect(page.locator('#wireRetry')).toBeEnabled();
  mode = 'invalid';
  await page.locator('#wireRetry').click();
  await expect(page.locator('#wireRetry')).toBeEnabled();
  await expect(page.locator('#wireError')).toBeVisible();
  mode = 'ok';
  await page.locator('#wireRetry').click();
  await expect(page.locator('.wire-card')).toHaveCount(24);
  await expect(page.locator('#wireError')).toBeHidden();
  await expect(page.locator('#wireGrid')).toHaveAttribute('aria-busy', 'false');
});

test('Wire revalidates with ETags, keeps stale data on failure, backs off and updates open reports', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  const headers = [];
  let mode = 'initial';
  await page.route(feedRoute, route => {
    requests++;
    headers.push(route.request().headers()['if-none-match']);
    if (mode === 'fail') return route.abort();
    if (mode === 'unchanged') return route.fulfill({ status: 304, headers: { ETag: '"v1"' } });
    const data = fixture();
    if (mode === 'updated') {
      data.generated_at = '2026-11-24T18:00:00Z';
      data.reports[0].name = 'Updated threat report';
      data.reports[0].category = 'regression-category';
    }
    return route.fulfill({ ...json(data), headers: { ETag: mode === 'updated' ? '"v2"' : '"v1"' } });
  });
  await page.goto('/wire/');
  await expect(page.locator('.wire-card')).toHaveCount(24);
  mode = 'unchanged';
  await page.clock.fastForward(30_000);
  await expect.poll(() => requests).toBe(2);
  await expect(page.locator('#wireGrid')).toHaveAttribute('aria-busy', 'false');
  expect(headers[1]).toBe('"v1"');
  mode = 'fail';
  await page.clock.fastForward(30_000);
  await expect(page.locator('#wireError')).toContainText('saved feed');
  await expect(page.locator('.wire-card')).toHaveCount(24);
  const failedRequests = requests;
  await page.clock.fastForward(30_000);
  expect(requests).toBe(failedRequests);
  mode = 'updated';
  await page.evaluate(slug => { location.hash = slug; }, snapshot.reports[0].slug);
  await expect(page.locator('#wireDossier')).toBeVisible();
  await page.clock.fastForward(30_000);
  await expect(page.locator('#wireDossierTitle')).toHaveText('Updated threat report');
  await expect(page.locator('#wireError')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#wireCategory option[value="regression-category"]')).toHaveCount(1);
});

test('Wire zero refresh setting stops automatic requests', async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  await page.route('**/wire/', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(/data-refresh=(?:"[^"]*"|'[^']*'|[^\s>]+)/, 'data-refresh="0"') });
  });
  await page.route(feedRoute, route => { requests++; return route.fulfill(json(fixture())); });
  await page.goto('/wire/');
  await expect(page.locator('.wire-card')).toHaveCount(24);
  await page.clock.fastForward(180_000);
  expect(requests).toBe(1);
});

test('Wire live feeds fall back to the snapshot and recover without cross-origin conditional headers', async ({ page }) => {
  let liveMode = 'fail';
  const liveHeaders = [];
  await page.route('**/wire/', async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/data-live(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/, 'data-live="https://feed.example.invalid/wire.json"');
    await route.fulfill({ response, body });
  });
  await page.route(feedRoute, route => route.fulfill(json(fixture())));
  await page.route('https://feed.example.invalid/wire.json', route => {
    liveHeaders.push(route.request().headers());
    if (liveMode === 'fail') return route.fulfill({ status: 503, body: 'Temporarily unavailable' });
    const data = fixture();
    data.generated_at = '2026-11-24T18:00:00Z';
    data.reports = [];
    return route.fulfill({ ...json(data), headers: { ETag: '"live-v1"', 'Access-Control-Allow-Origin': '*' } });
  });
  await page.goto('/wire/');
  await expect(page.locator('.wire-card')).toHaveCount(24);
  await expect(page.locator('#wireError')).toContainText('saved feed');
  liveMode = 'ok';
  await page.locator('#wireRetry').click();
  await expect(page.locator('#wireStatus')).toContainText('Live');
  await expect(page.locator('#wireEmpty')).toBeVisible();
  await expect(page.locator('#wireError')).toBeHidden();
  for (const headers of liveHeaders) expect(headers['if-none-match']).toBeUndefined();
});

test('Wire handles unknown deep links and reports removed during a refresh', async ({ page }) => {
  await page.clock.install();
  let removed = false;
  await page.route(feedRoute, route => {
    const data = fixture();
    if (removed) {
      data.generated_at = '2026-11-24T18:00:00Z';
      data.reports = data.reports.filter(r => r.slug !== snapshot.reports[0].slug);
    }
    return route.fulfill(json(data));
  });
  await page.goto(`/wire/#${snapshot.reports[0].slug}`);
  await expect(page.locator('#wireDossier')).toBeVisible();
  removed = true;
  await page.clock.fastForward(30_000);
  await expect(page.locator('#wireDossier')).toBeHidden();
  await expect(page.locator('#wireLinkError')).toContainText('not in the current feed');
  await page.evaluate(hash => { location.hash = hash; }, snapshot.reports[1].slug);
  await expect(page.locator('#wireDossierTitle')).toHaveText(snapshot.reports[1].name);
  await expect(page.locator('#wireLinkError')).toBeHidden();
});

test('native Extension ATT&CK search, filters and deep links still work', async ({ page }) => {
  await page.goto('/extension-attack/');
  await expect(page.locator('.ea-technique')).toHaveCount(80);
  const id = await page.locator('.ea-technique').first().getAttribute('data-open-technique');
  await page.locator('#ea-search').fill(id);
  await expect(page.locator('.ea-technique:visible')).toHaveCount(1);
  await page.locator('.ea-technique:visible').click();
  await expect(page.locator('#ea-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#ea-dialog')).toBeHidden();
  expect(new URL(page.url()).hash).toBe('');
  await page.locator('#ea-search').fill('');
  await page.locator('#ea-status').selectOption('active');
  await expect(page.locator('.ea-technique:visible')).toHaveCount(47);
  await page.goto(`/extension-attack/#${id}`);
  await expect(page.locator('#ea-dialog')).toBeVisible();
});
