# aikido-web

Showcase website for the [AI-KIDO](https://github.com/lcalmejane/aikido) method, published with GitHub Pages.

URL: https://lcalmejane.github.io/aikido-web/

## Languages

| Language | Path | File |
|---|---|---|
| **EN** (default) | `/` | `index.html` |
| FR | `/fr/` | `fr/index.html` |

| Page | EN | FR |
|---|---|---|
| Home | `index.html` | `fr/index.html` |
| Story (project timeline) | `history.html` | `fr/history.html` |

Each page has a language switcher (`EN` / `FR`) and `hreflang` tags (`x-default` = EN).
When adding a page, create both versions: `page.html` (EN) and `fr/page.html` (FR), and keep both switchers pointing to each other.

## Structure

```
aikido-web/
├── index.html          # home (EN, default)
├── history.html        # history and timeline (EN)
├── fr/index.html       # home (FR)
├── fr/history.html     # history and timeline (FR)
├── 404.html            # bilingual error page
├── .nojekyll           # disables Jekyll: static site served as is
├── assets/css/         # shared styles
└── workspace/          # IGNORED by Git: documentation and working material
```

The site is static HTML/CSS, with no build step.

## Working directory

`workspace/` is listed in `.gitignore`. It is never committed nor published.
It holds documentation and raw material used to build the site.

## Local development

```bash
python3 -m http.server 8000
# EN: http://localhost:8000/   FR: http://localhost:8000/fr/
```

## Publishing

Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`.
Every push to `main` republishes the site.
