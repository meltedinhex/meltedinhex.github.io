# Melted in Hex — Hugo site

Malware analysis & reverse-engineering blog, built with [Hugo](https://gohugo.io/)
and the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme,
deployed free on **GitHub Pages**.

## Structure

```
site/
├── hugo.toml                 # site config (title, menu, params, SEO)
├── content/
│   ├── posts/                # the 10 migrated blog posts (Markdown)
│   ├── about.md              # About page
│   ├── archives.md           # /archives/ listing
│   └── search.md             # /search/ (client-side fuzzy search)
├── static/                   # served at site root
│   ├── logo-light.png        # header logo
│   ├── favicon*.png          # favicons
│   └── images/og-social.png  # social share card
├── themes/PaperMod/          # theme (git submodule)
└── .github/workflows/hugo.yml# auto-deploy to GitHub Pages
```

## Run locally

Hugo Extended is required (already installed via winget: `Hugo.Hugo.Extended`).

```powershell
cd site
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

Then edit the frontmatter and set `draft: false` to publish.

## Deploy to GitHub Pages (free, with free HTTPS)

1. **Create a GitHub repo.** For a user site, name it `sdkhere.github.io`
   (replace with your username). Any public repo works for a project site too.

2. **Push this `site/` folder** as the repo root:

   ```powershell
   cd site
   git add .
   git commit -m "Initial Melted in Hex site"
   git remote add origin https://github.com/sdkhere/sdkhere.github.io.git
   git push -u origin main
   ```

   > The theme is a submodule; the workflow checks out submodules automatically.

3. **Enable Pages:** GitHub repo → **Settings → Pages → Build and deployment →
   Source = GitHub Actions**.

4. Every push to `main` runs `.github/workflows/hugo.yml`, builds with Hugo, and
   publishes. Your site goes live at `https://sdkhere.github.io/`.

## Custom domain (free)

1. Buy a domain (Cloudflare / Namecheap / Porkbun, ~$8–15/yr).
2. At your DNS provider:
   - `CNAME`  `www`  →  `sdkhere.github.io`
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
3. GitHub repo → **Settings → Pages → Custom domain** → enter your domain →
   **Save**, then tick **Enforce HTTPS** (free cert auto-issued).
4. Update `baseURL` in `hugo.toml` to `https://yourdomain.com/`.
5. (Recommended) add a `static/CNAME` file containing just `yourdomain.com` so
   the domain survives every deploy.

## Re-generating content from source

The posts were generated from the Blogger export by `../make_hugo.py`:

```powershell
cd ..
.venv\Scripts\python.exe make_hugo.py
```

This reads `../posts/*.md` and rewrites `content/posts/`.
