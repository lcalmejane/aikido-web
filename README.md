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
| Kimono (diagrams and setup tutorial) | `kimono.html` | `fr/kimono.html` |

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

## Kimono MCP content / Contenu Kimono MCP

- EN: the home navigation links directly to `kimono.html`. Its `#kimono` section preserves the capabilities previously shown on the home page: standalone use, shared knowledge, local search and platform integration. The story page's `#kimono-milestone` records the 16 October 2026 addition to the ecosystem.
- FR : la navigation de l'accueil mène directement à `fr/kimono.html`. Sa section `#kimono` conserve les fonctionnalités auparavant présentées sur l'accueil : usage autonome, connaissances partagées, recherche locale et intégration plateforme. Le jalon `#kimono-milestone` de l'historique marque l'arrivée dans l'écosystème le 16 octobre 2026.
- Sources: [Kimono MCP Server](https://github.com/lcalmejane/kimono-mcp-server), [English usage guide](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.en.md), [guide français](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.fr.md).
- Keep both languages aligned and reuse the existing theme. These additions do not replace the original content, illustrations or timeline entries.
- Dedicated pages: `kimono.html` / `fr/kimono.html`, with responsive HTML/CSS architecture diagrams, GitHub checkout, Docker Compose and native stdio walkthroughs, VS Code MCP configuration, first read-only calls and troubleshooting. No diagram library or JavaScript runtime is required.
- Shared Kimono visuals: `assets/images/K1.webp` (header), `K2.webp` (shared practice), `K3.webp` (connected knowledge), `K4.webp` (local setup), `K5.webp` (separate workspaces). Originals stay in the ignored `assets/images/generated/` folder. K3–K5 retain their full aspect ratio without cropping; the accessible HTML diagrams remain in place. K2 keeps its scoped saturation/brightness adjustment.

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
