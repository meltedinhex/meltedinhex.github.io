# Melted in Hex — Hugo site

Source for **[meltedinhex.com](https://meltedinhex.com/)** — a malware analysis,
reverse-engineering, threat-hunting, and AI-security notebook. Built with
[Hugo](https://gohugo.io/) and the
[PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, deployed free on
**GitHub Pages** with a free Let's Encrypt certificate.

## Structure

```
.
├── hugo.toml                  # site config (title, menu, params, SEO)
├── content/
│   ├── posts/                 # blog posts (Markdown)
│   ├── about.md               # About page
│   ├── archives.md            # /archives/ listing
│   └── search.md              # /search/ (client-side fuzzy search)
├── assets/css/extended/
│   └── theme-melted.css       # custom "Molten Terminal" theme
├── layouts/
│   ├── _partials/home_info.html   # custom hero terminal
│   ├── _partials/footer.html      # footer override
│   └── partials/extend_head.html  # custom fonts
├── static/                    # served at site root
│   ├── favicon*.png           # favicons
│   ├── CNAME                  # custom domain (meltedinhex.com)
│   └── images/
│       ├── melted-in-hex.png  # brand mark / apple-touch icon
│       └── og-social.png      # social share card
├── themes/PaperMod/           # theme (git submodule)
└── .github/workflows/hugo.yml # auto-deploy to GitHub Pages
```

## Run locally

Hugo Extended is required.

```powershell
hugo server
```

Open http://localhost:1313/ . The server live-reloads on edits.

Build the static site into `public/`:

```powershell
hugo --gc --minify
```

## Writing a new post

```powershell
hugo new posts/my-new-post.md
```

Edit the frontmatter, set `draft: false`, then publish:

```powershell
git add -A
git commit -m "Add new post"
git push
```

Every push to `main` runs `.github/workflows/hugo.yml`, which builds with Hugo and
publishes to GitHub Pages automatically.

## Regression checks

Use Hugo Extended 0.163.1 and Node.js 24:

```powershell
npm ci
npx playwright install chromium
npm test
```

`npm run test:static` builds into a temporary directory, checks generated local
links and fragments, images and alt attributes, duplicate IDs, analytics,
structured data, draft exclusions, share settings and the zero-refresh setting.
Temporary fixture content never changes the real posts.

`npm run test:browser` starts and stops its own Hugo server on port 4178. It checks
mobile/desktop layout, light/dark article contrast (at least 4.5:1), sticky-header
anchor offsets, reduced motion, skip navigation, search loading/retry, clipboard
failures, Wire pagination, modal focus, hash/history, refresh failures and ETags,
and the Extension ATT&CK viewer. External fonts and analytics are blocked in
these browser tests. Use `SITE_TEST_PORT` if that port is occupied; an existing
server is never reused. On Windows, an installed Edge can be used instead:

```powershell
$env:PLAYWRIGHT_CHANNEL = "msedge"
npm run test:browser
```

CI runs both suites before producing the deployment artifact. Site overrides
live outside the PaperMod submodule, including search, structured data, Open
Graph and RSS templates. Keep these overrides in mind when updating the theme.

## Threat Wire behaviour

The board initially renders 24 threats; **Show more threats** adds another 24.
Search, filters, statistics and direct dossier links still use the full feed.
Dossier HTML is created only when opened. Source links remain ordinary links.
The native dialog contains focus, closes with Escape or a backdrop click, and
tracks hash changes and browser history.

`params.wireRefreshSeconds = 0` disables automatic polling, including focus
refreshes. A configured live endpoint still receives its initial request after
the committed snapshot is loaded. Polling pauses in hidden tabs and backs off
after failures. Same-origin feeds use ETag revalidation when available; the
browser handles normal cache revalidation for cross-origin feeds without adding
custom headers that could require CORS preflights. Failed refreshes keep the last
valid feed visible, label it as saved data and offer a retry. Invalid feeds are
rejected before replacing current data. The time counters and filters describe
**updated** reports, not newly discovered reports.

The global author is Mohd Sadique; Melted in Hex remains the site and publisher.
Per-post author overrides are preserved. About uses `AboutPage`/`Person`
structured data, while interactive pages use `WebPage`, not `BlogPosting`.
Tracker entries are shown only when their referenced article is published.

## Extension ATT&CK viewer

The permanent `/extension-attack/` page renders a fixed taxonomy snapshot inside
the site layout. Search, status filters and technique details run locally in the
browser; no iframe or backend is required. Technique URLs use `#EXT-...` fragments.
An exact technique-ID search returns only that entry (case-insensitive), subject
to the status filter. Other searches include the full record. The tactic selector
jumps to a matching column without clearing filters; tactics with no matches are
disabled. Details include installation paths and named related techniques.

The source of truth remains
[meltedinhex/extension-attack](https://github.com/meltedinhex/extension-attack).
Do not edit the imported JSON by hand. To refresh it from a local checkout:

```powershell
git clone https://github.com/meltedinhex/extension-attack.git 'D:\Projects\Extensions\extension-attack'
.\scripts\sync-extension-attack.ps1 -RepositoryPath 'D:\Projects\Extensions\extension-attack'
```

The source project's Python requirements must already be installed. If needed,
pass `-PythonExecutable 'C:\path\to\venv\Scripts\python.exe'`. The importer builds
a temporary export of the source repository's committed `HEAD`, leaving any
working-tree changes untouched, and records its Git revision and build date in
`data/extension_attack/snapshot.json`, alongside the generated `matrix.json`.
Review and commit both files together to publish a new snapshot. The page shows
the snapshot date, source revision, attribution and CC BY 4.0 license.
Use the public checkout; the former `Extension_Att&ck` checkout points to the
private archive and is rejected by the importer. Fetch and fast-forward the
public checkout before importing a newer release.

The blog's Pages deployment owns `/extension-attack/`. The taxonomy repository
retains its build/validation workflow but must not enable its own Pages service,
which would shadow the blog route. Its generated standalone viewer remains
available for local use.

## Deployment

- **Repo:** `meltedinhex/meltedinhex.github.io` (must stay public for free Pages).
- **Pages source:** GitHub Actions (`Settings → Pages → Build and deployment`).
- **Custom domain:** `meltedinhex.com`, pinned via [`static/CNAME`](static/CNAME) so
  it survives every deploy. DNS apex `A` records point to GitHub's Pages IPs
  (`185.199.108–111.153`); `www` is a `CNAME` to `meltedinhex.github.io`.
- **HTTPS:** Enforced, with a GitHub-managed certificate.

> The theme is a git submodule; the deploy workflow checks out submodules
> automatically (`actions/checkout` with `submodules: recursive`).
