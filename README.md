# aikido-web

Showcase website for [AI-KIDO](https://github.com/lcalmejane/aikido), the AI Memory Bank Construction Method by Meta-Harness, published with GitHub Pages.

URL: https://lcalmejane.github.io/aikido-web/

## Languages

| Language | Path | File |
|---|---|---|
| **EN** (default) | `/` | `index.html` |
| FR | `/fr/` | `fr/index.html` |

| Page | EN | FR |
|---|---|---|
| Home | `index.html` | `fr/index.html` |
| Harness creation (tools, example and improvement) | `harness.html` | `fr/harness.html` |
| Story (project timeline) | `history.html` | `fr/history.html` |
| Kimono (diagrams and setup tutorial) | `kimono.html` | `fr/kimono.html` |

Each page has a language switcher (`EN` / `FR`) and `hreflang` tags (`x-default` = EN).
When adding a page, create both versions: `page.html` (EN) and `fr/page.html` (FR), and keep both switchers pointing to each other.

## Structure

```
aikido-web/
├── index.html          # home (EN, default)
├── harness.html        # creating and evolving harnesses (EN)
├── history.html        # history and timeline (EN)
├── fr/index.html       # home (FR)
├── fr/harness.html     # création et évolution de harnais (FR)
├── fr/history.html     # history and timeline (FR)
├── 404.html            # bilingual error page
├── .nojekyll           # disables Jekyll: static site served as is
├── assets/css/         # shared styles
└── workspace/          # IGNORED by Git: documentation and working material
```

The site is static HTML/CSS, with no build step.

## Tailored harnesses / Harnais sur mesure

- The EN and FR home pages introduce AI-KIDO as a method for structured knowledge and lasting collaboration with AI, keeping the “AI Memory Bank Construction Method by Meta-Harness” positioning. A “The meta-harness: AI-KIDO in practice” section (`#meta-harness` / `#meta-harnais`, reachable from the navigation and a hero button) offers six teaser cards linking to each section of the harness page; the method / meta-harness / use-case cards and team / integration cards also link there.
- `harness.html` / `fr/harness.html` open with `#what-is-a-harness` (what a harness is, why it matters, and how its components — context, roles, workflow, capabilities, checks — map to AI-KIDO features), then explain personas and agents (`/create-persona`), commands (`/create-command`), skills (`/create-skill`) and compiled agents (`/compile-agent-from-use`), with links to the canonical command documentation.
- Both pages use matching `#what-is-a-harness`, `#building-blocks`, `#personas`, `#commands`, `#skills`, `#compilation`, `#example`, `#improve` and `#start` anchors, language switchers and links back to the method. They illustrate the create → use → improve loop with a product-publication example and explain command optimization with `/optimize-command-with-aikido-agents`.
- Keep AI-KIDO (the method) distinct from its tools (the meta-harness). Do not promise automatic service connections or arbitrary executable-tool generation: execution depends on the host assistant, available tools/MCP and permissions. Retain the existing knowledge-maintenance capabilities and learning path.

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
