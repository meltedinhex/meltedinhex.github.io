import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.SITE_TEST_PORT || 4178);
const root = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `hugo server --bind 127.0.0.1 --port ${port} --environment production --disableLiveReload --disableFastRender --watch=false --renderToMemory --cacheDir "${path.join(root, '.test-cache')}"`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    env: { HUGO_RESOURCEDIR: path.join(root, '.test-resources'), HUGO_PARAMS_ENV: 'production' }
  }
});
