# ReadVaultDeploy

Static website for [readvaulthq.com](https://readvaulthq.com) — deployed via GitHub Pages.

## Structure

```
ReadVaultDeploy/
├── index.html        # Homepage
├── books.html        # Browse books (with category filters)
├── about.html        # About page + social links
├── privacy.html      # Privacy policy
├── terms.html        # Terms of service
├── index.css         # Full design system
├── app.js            # Interactivity (nav, filters, scroll reveal)
├── CNAME             # readvaulthq.com
└── .github/
    └── workflows/
        └── pages.yml # Auto-deploy on push to main
```

## Deploy

1. Push to `main` branch
2. GitHub Pages auto-deploys via the `pages.yml` workflow
3. Custom domain: `readvaulthq.com` (set CNAME in repo Settings → Pages)

## Affiliate Tag

All Amazon links use tag: `louisamazonaf-20`
