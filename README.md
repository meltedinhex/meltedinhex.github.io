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

## Deployment

- **Repo:** `meltedinhex/meltedinhex.github.io` (must stay public for free Pages).
- **Pages source:** GitHub Actions (`Settings → Pages → Build and deployment`).
- **Custom domain:** `meltedinhex.com`, pinned via [`static/CNAME`](static/CNAME) so
  it survives every deploy. DNS apex `A` records point to GitHub's Pages IPs
  (`185.199.108–111.153`); `www` is a `CNAME` to `meltedinhex.github.io`.
- **HTTPS:** Enforced, with a GitHub-managed certificate.

> The theme is a git submodule; the deploy workflow checks out submodules
> automatically (`actions/checkout` with `submodules: recursive`).
