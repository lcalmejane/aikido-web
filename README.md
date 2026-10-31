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
| Distributions and installation | `install.html` | `fr/install.html` |
| Story (project timeline) | `history.html` | `fr/history.html` |
| Kimono (diagrams and setup tutorial) | `kimono.html` | `fr/kimono.html` |

Each page has a language switcher (`EN` / `FR`) and `hreflang` tags (`x-default` = EN).
When adding a page, create both versions: `page.html` (EN) and `fr/page.html` (FR), and keep both switchers pointing to each other.

The `install.html` / `fr/install.html` page presents the knowledge base content, the nine distributions, the installation steps, updates and `/skill-manage`; keep it aligned with `distribution/catalog.json` and the release tag. The home and harness pages link to it, and it links to the AI-KIDO
[installation guide](https://github.com/lcalmejane/aikido/blob/main/distribution/docs/host-integrations.md)
and [project setup guide](https://github.com/lcalmejane/aikido/blob/main/distribution/README.md).

## Navigation

Every page shares the same header, built without JavaScript: a short main menu (`Method` group, `Install`, `Kimono MCP`, `GitHub`, language switch) and a secondary "On this page" bar listing the sections of the current page. Below 900 px the main menu collapses behind a `Menu` toggle (`#nav-toggle` checkbox) and the section bar scrolls sideways. When adding a page, copy the header of an existing page, add the page to the `Method` group if it belongs there, and list only its own `#section` anchors in the secondary bar.

## Structure

```
aikido-web/
├── index.html          # home (EN, default)
├── harness.html        # creating and evolving harnesses (EN)
├── install.html        # distributions, installation and skills (EN)
├── history.html        # history and timeline (EN)
├── fr/index.html       # home (FR)
├── fr/harness.html     # création et évolution de harnais (FR)
├── fr/install.html     # distributions, installation et skills (FR)
├── fr/history.html     # history and timeline (FR)
├── 404.html            # bilingual error page (noindex)
├── sitemap.xml         # all 10 URLs with hreflang alternates (SEO)
├── manifest.webmanifest # web app manifest (name, theme colour, 192/512 px icons)
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

- EN: the home navigation links directly to `kimono.html`. Its `#kimono` section covers local project RAG, optional AI-KIDO knowledge, shared HTTP access and platform integration. The story keeps the original 16 October 2026 `#kimono-milestone` and adds one consolidated `#kimono-marketplace` entry on 25 October 2026 for current capabilities and ambitions, without intermediate release entries.
- FR : la navigation de l'accueil mène directement à `fr/kimono.html`. Sa section `#kimono` présente le RAG local de projet, les connaissances AI-KIDO optionnelles, l'accès HTTP partagé et l'intégration plateforme. L'historique conserve le jalon initial du 16 octobre 2026 et ajoute un seul état de synthèse `#kimono-marketplace` au 25 octobre 2026, sans détailler les versions intermédiaires.
- Sources: [Kimono MCP Server](https://github.com/lcalmejane/kimono-mcp-server), [English usage guide](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.en.md), [guide français](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.fr.md).
- Keep both languages aligned and reuse the existing theme. Preserve illustrations, historic timeline entries and existing section anchors. Each timeline card uses one concise summary paragraph, with links inline rather than separate technical blocks. The Kimono pages are a marketing journey: user problem → benefits → measured evidence → product screenshots → first use. Link to official operational guides instead of duplicating shell commands, runtime dependencies or MCP JSON.
- Dedicated pages: `kimono.html` / `fr/kimono.html`, with Marketplace-first installation (`ai-kido.kimono-rag-mcp`, VS Code 1.106+), plain-language RAG and AI-KIDO use cases, document retrieval, screenshots and a three-step onboarding. Docker and native alternatives link to the upstream guides. No diagram library or JavaScript runtime is required.
- `#performance` presents the two measured research/planning tasks in an accessible, horizontally scrollable table. Preserve exact counts and elapsed times from the [benchmark](https://github.com/lcalmejane/kimono-mcp-server/blob/main/benchmarks/results/current.md): Gemini 3.8 Flash, Copilot CLI 1.0.103, local lexical RAG, 51 identical files, one run per method/task. Cumulative input includes cache reads. Do not equate token reductions to invoice savings, claim a measured full TCO reduction or generalize two trials to every project.
- Both home pages introduce practical efficiency, token FinOps and TCO considerations, linking to the Kimono measurements and screenshots. Attribute measured gains to Kimono, not to the AI-KIDO method as a whole; distinguish expected organizational benefits from measured results.
- Marketplace: [Kimono RAG MCP by AI-KIDO](https://marketplace.visualstudio.com/items?itemName=ai-kido.kimono-rag-mcp). Office/PDF and metadata retrieval require the 0.6.6 document features; screenshots show the locally installed 0.6.5 panel, not those newer document features. Direct LLM CLI integrations are explicitly planned, not shipped.
- AI-KIDO 1.5 is published (`aikido-dist-v1.5.2`): the site reflects the meta-harness positioning, the nine distributions and the install guide on `main`.
- Shared Kimono visuals: `assets/images/K1.webp` (header), `K2.webp` (shared practice), `K3.webp` (connected knowledge), `K4.webp` (local setup), `K5.webp` (separate workspaces). Originals stay in the ignored `assets/images/generated/` folder. K3–K5 retain their full aspect ratio without cropping. K2 keeps its scoped saturation/brightness adjustment.
- Product screenshots: `assets/images/kimono-panel-{en,fr}.png` (1120×820) and `kimono-search-{en,fr}.png` (1120×980). Captured on 25 October 2026 from the installed `ai-kido.kimono-rag-mcp-0.6.5-darwin-arm64` panel, rendered locally with its unchanged HTML/JS/CSS and VS Code dark theme variables. The demonstration uses the installed bundled server and native engines against public `kimono-mcp-server/docs`: 10 indexed documents, 183 embedded chunks, query `local RAG search`, text/semantic modes, five results. Index counts, search locations, response sizes and timings come from actual MCP responses, not invented fixtures. The browser bridge replays that real captured state for FR/EN screenshots; these are not full IDE-window captures. The displayed ROOT is made project-relative; no private files, tokens or user settings are shown. Captions disclose the demo and version; do not present screenshot latencies as the Copilot benchmark above.

## SEO and indexing / Référencement

- Every indexable page carries: `<title>`, `meta description`, `meta robots` (`index, follow, max-image-preview:large`), `<link rel="canonical">` (absolute URL, no `index.html`, no `?v=`), `og:url`, `og:site_name`, `og:image`, `twitter:image` and reciprocal `hreflang` (`en`, `fr`, `x-default` = EN). The two home pages also embed JSON-LD (`WebSite` + `SoftwareSourceCode`).
- `404.html` is `noindex, follow`.
- Icons: every page (including `404.html`) uses the same block: `favicon.ico` (16 + 32 px), PNG 32, 96 and 192 px, `apple-touch-icon` (180 px), `manifest.webmanifest` and `theme-color` (`#0f1220`, the site background). Icon URLs carry a `?v=3` cache-buster; bump it on every page when an icon file changes. Source artwork: `assets/images/logo-512.png`.
- `sitemap.xml` lists the 10 pages with their `xhtml:link` alternates. When adding or renaming a page, update the sitemap, the `canonical`/`og:url`/`hreflang` tags of both versions, and bump `<lastmod>` on pages whose content changed.
- `robots.txt` is **not** placed here: on a GitHub Pages project site, crawlers only read `https://lcalmejane.github.io/robots.txt` (root of the user domain, i.e. a `lcalmejane.github.io` repository). Without it everything is crawlable. If created there, add `Sitemap: https://lcalmejane.github.io/aikido-web/sitemap.xml`.
- Search engines: add the property `https://lcalmejane.github.io/aikido-web/` (URL prefix) in Google Search Console, submit `sitemap.xml`, then request indexing of the home pages; import it into Bing Webmaster Tools. For ownership verification, add a `google-site-verification` meta tag (or an HTML verification file at the site root) only once the token is known.

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
