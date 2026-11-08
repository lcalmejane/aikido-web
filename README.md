# aikido-web

Showcase website for [AI-KIDO](https://github.com/lcalmejane/aikido), the AI Memory Bank Construction Method by Meta-Harness, published with GitHub Pages.

URL: https://www.ai-kido.fr/

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
| Local Designer | `local-designer.html` | `fr/local-designer.html` |
| News | `news.html` | `fr/news.html` |
| Technical friends (footer only) | `technical-friends.html` | `fr/technical-friends.html` |

Each page has a language switcher (`EN` / `FR`) and `hreflang` tags (`x-default` = EN).
When adding a page, create both versions: `page.html` (EN) and `fr/page.html` (FR), and keep both switchers pointing to each other.

The `install.html` / `fr/install.html` page presents the knowledge base content, the nine distributions, the installation steps, updates and `/skill-manage`; keep it aligned with `distribution/catalog.json` and the release tag. The home and harness pages link to it, and it links to the AI-KIDO
[installation guide](https://github.com/lcalmejane/aikido/blob/main/distribution/docs/host-integrations.md)
and [project setup guide](https://github.com/lcalmejane/aikido/blob/main/distribution/README.md).
The primary installation path uses the public npm package `@aikido-method/cli`
(Node.js 24+), pinned to stable 1.5.4 in the examples. Keep both languages, npm
commands, catalog counts and Git distribution tags aligned when updating it.
Home toolbox counters describe the published method catalog (1.5.4: 33 commands,
16 internal agents, 8 system skills, 9 enabled distributions), not local project
personas, optional skills or duplicate host wrappers. Keep EN/FR home, installation
and history aligned with the release catalog; historical entries cite release tags.

## Navigation

Every page shares the same header as the home, built without JavaScript: a short main menu (`Method` group, `Install`, `Tools` group (Kimono MCP, Local Designer), `GitHub`, language switch) and, on inner pages, a secondary "On this page" bar listing the sections of the current page. Below 960 px the main menu collapses behind a `Menu` toggle (`#nav-toggle` checkbox) and the section bar scrolls sideways. When adding a page, copy the header of an existing page, add the page to the `Method` group if it belongs there, and list only its own `#section` anchors in the secondary bar.

The static bilingual footer appears on every page, including the 404. It groups method, tools and public resources, with the method's MIT license and a language switch preserving the current page. Do not link to the website's source repository in the public pages. Keep EN/FR copies aligned when adding links. Its responsive layout and light/dark colours live in `home.css`; no JavaScript is needed.

The bilingual Technical friends page is linked only from the footer, not from the main menu or home-page cards (its own language switch preserves the page). It groups tools/foundations, target assistants/CLIs and upstream inspirations; links go to official sites or public upstream repositories, never private product repositories or this website's source. It explicitly avoids implying a partnership, endorsement or uniform compatibility. Keep both language versions and sitemap entries aligned; preserve the distinction between a distribution target and a tested integration.

Its dedicated Kimono section documents fast-grep, embsearch-core, ONNX Runtime, MinishLab Model2Vec/Potion, Hugging Face, Multilingual E5 small, Rust and Tree-sitter, checked against the component sources rather than inferred from generic RAG stacks. Logos/site icons are local assets with [upstream provenance](assets/images/technical-friends/README.md); no generated substitutes or hotlinks. Plain text identifies projects without an established logo. The page-specific stylesheet `assets/css/technical-friends.css` uses white logo plates without recolouring brand marks.

## Visual identity (November 2026 design refresh)

The whole site follows the charter of the home page (cream `#f6efe0`, ink `#111524`, navy `#0e386e`, terracotta `#b85c38`, gold `#e8c77a`; serif headings, sans body; automatic dark mode). Photography shows people in cream keikogi in a sunlit dojo; icons are the inline SVG sprite, never raster pictograms.

- `assets/css/home.css`: charter variables, header, buttons, hero, bands, closing block. Loaded by every page.
- `assets/css/inner.css`: the same charter applied to inner pages (page header with full-width photo, cards, steps, tables, timeline, belts). Loaded after `home.css`; body class `inner`. Cache-busters: `home.css?v=10`, `inner.css?v=10`; bump them on every page when the file changes.
- Article step-list styles must be scoped to `.article-body .steps`; unscoped overrides break the padding and image alignment of the illustrated `.steps` cards on the harness pages.
- Header menu: **Method** (Home, Harness creation, History) and **Tools** (Kimono MCP, Local Designer) are `<details class="nav-group">` groups; the group holding the current page gets the class `current` so its label takes the accent colour. A new tool page goes into the **Tools** panel of all pages (EN and FR), in `sitemap.xml`, and in the page list of the site check.
- `local-designer.html` / `fr/local-designer.html`: page of the `local-designer` skill (art director for agents). Images: `ph-designer` (header) and `designer-moodboard|charter|uikit|render` in `assets/images/pages/`; the 12 style thumbnails in `assets/images/pages/styles/` are the skill's own (`styles/thumbs/`), not site renders. No link to the `aikido-skills` repository, which is private: installation is described through `/skill-manage` and the public method repository.
- Photo layouts on inner pages (never a lone illustration floating between text blocks): `.duo` = two `.card` side by side, each with a `.card-img` on top, a `.tag`, a title and a short text (Kimono “Local today / shared tomorrow”); `.split-media` = photo on the left (`.media`) and a `.stack` of cards on the right (Kimono “Choose the way you want to work”); `.callout` = text block with an accent rule; `.quote-feature` = photo beside a quote. All collapse to one column below 960 px.
- Theme switch: the round sun/moon button in the header (`[data-theme-toggle]`, every page except `404.html`, which has no header) is driven by `assets/js/theme.js`, loaded synchronously in `<head>` so `data-theme` is set before first paint. Default = system setting (`prefers-color-scheme`); a click stores the choice in `localStorage` (`aikido-theme`) and updates `theme-color`. Without JavaScript the button stays hidden and the theme follows the system. The dark variables live in `home.css` under both `:root:not([data-theme="light"])` (media query) and `:root[data-theme="dark"]`; keep them identical. Cache-buster: `theme.js?v=1`.
- `assets/images/home/`: photos of the home page. `assets/images/pages/`: photos of the inner pages (`ph-*` page headers 1344×512, `harness-*`, `kimono-*`, `history-harmony` illustrations 960×576, `harness-evolve` and `kimono-why` banners 1344×576, `ph-404`). Pictures contain no text, no dimension marks and no recognisable faces to retouch.
- Each page embeds only the SVG symbols it uses (copied from the home sprite): when you add a `<use href="#id">`, copy the matching `<symbol>` into that page.
- The pre-refresh illustrations (`assets/images/*.webp` such as `H5`, `R1`–`R8`, `I1`–`I13`) and `assets/css/style.css` are no longer referenced by any page and can be deleted once the refresh is published.
- Photos are generated locally with Draw Things through the `local-designer` skill (Qwen Image 2512, 16 steps, seed 42, `--charter`); the prompt and parameters of each render are kept in its `.json` sidecar next to the lossless PNG, outside the repository.

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
├── technical-friends.html # technical resources, target assistants and inspirations (EN)
├── fr/technical-friends.html # sites amis techniques (FR)
├── sitemap.xml         # all 14 URLs with hreflang alternates (SEO)
├── robots.txt          # crawler access and canonical sitemap URL
├── CNAME               # GitHub Pages custom domain: www.ai-kido.fr
├── manifest.webmanifest # web app manifest (name, theme colour, 192/512 px icons)
├── .nojekyll           # disables Jekyll: static site served as is
├── assets/css/         # home.css (charter) + inner.css (inner pages)
├── assets/images/home/ # photos of the home page
├── assets/images/pages/ # photos of the inner pages
└── workspace/          # IGNORED by Git: documentation and working material
```

The site is static HTML/CSS, with no build step.

## Tailored harnesses / Harnais sur mesure

- The EN and FR home pages introduce AI-KIDO as a method for structured knowledge and lasting collaboration with AI, keeping the “AI Memory Bank Construction Method by Meta-Harness” positioning. A “The meta-harness: AI-KIDO in practice” section (`#meta-harness` / `#meta-harnais`, reachable from the navigation and a hero button) offers six teaser cards linking to each section of the harness page; the method / meta-harness / use-case cards and team / integration cards also link there.
- `harness.html` / `fr/harness.html` open with `#what-is-a-harness` (what a harness is, why it matters, and how its components — context, roles, workflow, capabilities, checks — map to AI-KIDO features), then explain personas and agents (`/create-persona`), commands (`/create-command`), skills (`/create-skill`) and compiled agents (`/compile-agent-from-use`), with links to the canonical command documentation.
- Both pages use matching `#what-is-a-harness`, `#building-blocks`, `#personas`, `#commands`, `#skills`, `#compilation`, `#example`, `#improve`, `#deterministic` and `#start` anchors, language switchers and links back to the method. They illustrate the create → use → improve loop with a product-publication example and explain command optimization with `/optimize-command-with-aikido-agents`.
- `#deterministic` (added 7 November 2026, reworked the same day) states the AI-KIDO philosophy: the model talks and decides, deterministic tools execute. Its third card explains that creating a command or compiling an agent analyses the request and, per the tooling standard, asks for the exact part to be written as a reusable Node.js script packaged in the skill (never claim that a script is generated for every request). It covers reliability, token cost (TCO) and auditability; the four rules (Node.js 24+ `.mjs` tooling standard of `prompts/hard_points/system/Skills.md`); a table of what AI-KIDO already hands to scripts (`/create-skill` and `/skill-manage`, `/create-persona` and `/compile-agent-from-use` with host-sync, `/validate-search-plan`, `/download-site`, the orchestrator JSON contract); and the refactoring agent (four routes, temporary scripts, wide batches, short JSON reports). Token and TCO benefits are presented as expected, never measured: the only measured figures are the Kimono benchmark, which the section links to. Every command, route and number named there must match `agent-aikido-refactoring.md`, the refactoring skill and `Skills.md`; re-check it when they change.
- The three illustrations of `#deterministic` (`det-by-hand`, `det-script-runs`, `det-toolbox`, Kido 512 × 512, style `kido-mascot-photo`, Qwen, `Euler A Trailing`, 16 steps, seed 42) were generated locally with Local Designer on 7 November 2026. Working files, sidecars and discarded variants are in `~/local-designer-lab/aikido-web-det/`. A small dark badge on the belt of `det-script-runs` and `det-toolbox` is the known recurring artifact; replace the seed if it matters.
- Keep AI-KIDO (the method) distinct from its tools (the meta-harness). Do not promise automatic service connections or arbitrary executable-tool generation: execution depends on the host assistant, available tools/MCP and permissions. Retain the existing knowledge-maintenance capabilities and learning path.

## Kimono MCP content / Contenu Kimono MCP

- EN: the home navigation links directly to `kimono.html`. Its `#kimono` section covers local project RAG, optional AI-KIDO knowledge, shared HTTP access and platform integration. The story keeps the original 16 October 2026 `#kimono-milestone` and adds one consolidated `#kimono-marketplace` entry on 25 October 2026 for current capabilities and ambitions, without intermediate release entries.
- FR : la navigation de l'accueil mène directement à `fr/kimono.html`. Sa section `#kimono` présente le RAG local de projet, les connaissances AI-KIDO optionnelles, l'accès HTTP partagé et l'intégration plateforme. L'historique conserve le jalon initial du 16 octobre 2026 et ajoute un seul état de synthèse `#kimono-marketplace` au 25 octobre 2026, sans détailler les versions intermédiaires.
- Sources: [Kimono MCP Server](https://github.com/lcalmejane/kimono-mcp-server), [English usage guide](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.en.md), [guide français](https://github.com/lcalmejane/kimono-mcp-server/blob/main/docs/usage.fr.md).
- Keep both languages aligned and reuse the existing theme. Preserve illustrations, historic timeline entries and existing section anchors. Each timeline card uses one concise summary paragraph, with links inline rather than separate technical blocks. The Kimono pages are a marketing journey: user problem → benefits → measured evidence → product screenshots → first use. Link to official operational guides instead of duplicating shell commands, runtime dependencies or MCP JSON.
- Dedicated pages: `kimono.html` / `fr/kimono.html`, with Marketplace-first installation (`ai-kido.kimono-rag-mcp`, VS Code 1.106+), plain-language RAG and AI-KIDO use cases, document retrieval, screenshots and a three-step onboarding. Docker and native alternatives link to the upstream guides. No diagram library or JavaScript runtime is required.
- `#performance` presents the two measured research/planning tasks in an accessible, horizontally scrollable table. Preserve exact counts and elapsed times from the [benchmark](https://github.com/lcalmejane/kimono-mcp-server/blob/main/benchmarks/results/current.md): Gemini 3.8 Flash, Copilot CLI 1.0.103, local lexical RAG, 51 identical files, one run per method/task. Cumulative input includes cache reads. Do not equate token reductions to invoice savings, claim a measured full TCO reduction or generalize two trials to every project.
- Both home pages introduce practical efficiency, token FinOps and TCO considerations, linking to the Kimono measurements and screenshots. Attribute measured gains to Kimono, not to the AI-KIDO method as a whole; distinguish expected organizational benefits from measured results.
- Marketplace: [Kimono RAG MCP by AI-KIDO](https://marketplace.visualstudio.com/items?itemName=ai-kido.kimono-rag-mcp). Office/PDF and metadata retrieval require the 0.6.6 document features; screenshots show the locally installed 0.6.5 panel, not those newer document features. Direct LLM CLI integrations are listed on the roadmap.
- AI-KIDO 1.5.3 is published (`aikido-dist-v1.5.3`): the site reflects the meta-harness positioning, the nine distributions and the install guide on `main`.
- Shared Kimono visuals: `assets/images/K1.webp` (header), `K2.webp` (shared practice), `K3.webp` (connected knowledge), `K4.webp` (local setup), `K5.webp` (separate workspaces). Originals stay in the ignored `assets/images/generated/` folder. K3–K5 retain their full aspect ratio without cropping. K2 keeps its scoped saturation/brightness adjustment.
- Harness page header: `assets/images/H5.webp` (1664×832, 34 KB) is the background of `.page-head` on `harness.html` and `fr/harness.html` only (body class `harness-page`, so `install.html` is unaffected). Generated locally with Draw Things through the `drawthing` skill of `aikido-skills` (Qwen Image 2512, 16 steps, seed 20261031); the prompt and parameters are in `assets/images/generated/H5.json` next to the lossless PNG. The artwork keeps its centre dark for the headline. A WebP preload is declared in both pages; bump `style.css?v=` when the CSS changes.
- Harness page illustrations: `R1`–`R3` (the Without / With a harness / With the meta-harness cards), `R4`–`R7` (persona, command, skill and composition cards) are 192×192 icons in the style of `C1`–`C8`; `S4`–`S6` (create / use / improve steps) are 832×512 like `S1`–`S3`; `R8` (1200×400) is the banner of `#improve`. Icons must keep transparent rounded corners like `C1.webp` (flood-fill the PNG corners before `cwebp`), otherwise white corners show on the cards. Pictures must not contain text, dimension marks or faces; regenerate any that do. Originals stay in the ignored `assets/images/generated/`.
- Install page illustrations: `I1.webp` (1664×832) is the `.page-head` background of `install.html` / `fr/install.html` only (body class `install-page`, with a radial veil so the headline stays readable over the side artwork). `I2`–`I13` are 192×192 icons with transparent corners, one per card (six “what you get” cards, three install steps, three skills cards) and each sits above the step number tag. Generated at 24 steps (16 was too soft on fine lines): pass `--steps 24` explicitly because `--from` copies the reference's steps. A first pass of `I2` drew a letter-like X and `I13` a flower; both were regenerated (`I2C`, `I13B`) — check every icon for letters, faces and off-topic shapes before publishing.
- Writing rules (UX/UI): one idea per block; a section intro (`.sub`) is one or two short sentences, about 25 words at most, and the header lead is a single paragraph of about 30 words; put detail in the cards, not the intro. Each page title highlights one key phrase with `<em>` (gradient, same effect as the home title). Wrap `AI-KIDO` in `<span class="nowrap">` inside running text where a line break would split it. Keep EN and FR aligned and bump the `style.css?v=` cache-buster on every page when the CSS changes.
- Product screenshots: `assets/images/kimono-panel-{en,fr}.png` (1120×820) and `kimono-search-{en,fr}.png` (1120×980). Captured on 25 October 2026 from the installed `ai-kido.kimono-rag-mcp-0.6.5-darwin-arm64` panel, rendered locally with its unchanged HTML/JS/CSS and VS Code dark theme variables. The demonstration uses the installed bundled server and native engines against public `kimono-mcp-server/docs`: 10 indexed documents, 183 embedded chunks, query `local RAG search`, text/semantic modes, five results. Index counts, search locations, response sizes and timings come from actual MCP responses, not invented fixtures. The browser bridge replays that real captured state for FR/EN screenshots; these are not full IDE-window captures. The displayed ROOT is made project-relative; no private files, tokens or user settings are shown. Captions disclose the demo and version; do not present screenshot latencies as the Copilot benchmark above.
- The `kimono-why` and `kimono-shared` illustrations were regenerated on 4 November 2026 with explicitly distinct synthetic casts (three and four colleagues), varied gender presentation, ages, hair and appearances, and equally active roles. Their compositions were approved before final rendering. Qwen Image 2512 (`qwen_image_2512_bf16_i8x.ckpt`), 24 steps, guidance 4, Euler A Trailing; seeds 83 and 81 respectively; native sizes 1344×576 and 960×576, no crop or resize. Residual synthetic clothing labels were locally replaced with plain dark fabric patches. Original PNGs, prompts, settings and retouched masters stay outside Git in the Local Designer lab. Keep EN/FR alt text aligned with each image's message; generic human groups must not reuse one face unless repetition is the explicit concept.

## SEO and indexing / Référencement

- Every indexable page carries: `<title>`, `meta description`, `meta robots` (`index, follow, max-image-preview:large`), `<link rel="canonical">` (absolute URL, no `index.html`, no `?v=`), `og:url`, `og:site_name`, `og:image`, `twitter:image` and reciprocal `hreflang` (`en`, `fr`, `x-default` = EN). The two home pages also embed JSON-LD (`WebSite` + `SoftwareSourceCode`).
- `404.html` is `noindex, follow`.
- Icons: every page (including `404.html`) uses the same block: `favicon.ico` (16 + 32 px), PNG 32, 96 and 192 px, `apple-touch-icon` (180 px), `manifest.webmanifest` and two `theme-color` tags (`#f6efe0` in light mode, `#111524` in dark mode, the site background). Icon URLs carry a `?v=3` cache-buster; bump it on every page when an icon file changes. Source artwork: `assets/images/logo-512.png`.
- All canonical, Open Graph, social image, JSON-LD and language-alternate URLs use `https://www.ai-kido.fr/`. Home URLs are `/` and `/fr/`, not `index.html`. The 404 keeps `noindex` and root-relative links/assets so nested missing URLs work on the custom domain.
- `sitemap.xml` lists every public page and news article with their `xhtml:link` language alternates. When adding or renaming a page, update the sitemap, the `canonical`/`og:url`/`hreflang` tags of both versions, and bump `<lastmod>` on pages whose content changed.
- `robots.txt` at the custom domain root allows crawling and declares `Sitemap: https://www.ai-kido.fr/sitemap.xml`.
- Search engines: add the property `https://www.ai-kido.fr/` (URL prefix) in Google Search Console, submit `sitemap.xml`, then request indexing of the home pages; import it into Bing Webmaster Tools. For ownership verification, add a `google-site-verification` meta tag (or an HTML verification file at the site root) only once the token is known. After the DNS check passes and GitHub issues the certificate, enable **Enforce HTTPS** in Pages settings to redirect HTTP traffic.

## News and roadmap

Every article layout must retain the contents navigation and the AI-KIDO call
to action. At 1000 px and above they are sticky rails; `hero: left` groups the
image, contents and call to action in one sticky left column. Below 1000 px a
sticky disclosure bar exposes both controls, with exclusive panels, anchor
closure and Escape support. Header height determines the offset; tall controls
scroll within the viewport. `toc` and `rail` layout options no longer disable
this shared invariant. An article needs at least one `h2`.
After changing navigation, test every layout in EN/FR at 1440, 1024, 899 and
390 px, including scroll, anchor visibility, keyboard and call-to-action access.

The news pages are **generated** from the folder `content/news/` (one JSON file per article, per layout and per diagram; EN and FR text side by side).
Never edit the generated files by hand: `news.html`, `fr/news.html`, `news/*.html`, `fr/news/*.html`, the block between
`<!-- news:begin -->` and `<!-- news:end -->` on both home pages (the compact strip in the first screen) and the same block in `sitemap.xml`.

```bash
node scripts/build-news.mjs --validate  # validate content/news/ only (no write)
node scripts/build-news.mjs --article learn-rules --dry-run # preview a targeted edit, no write
node scripts/build-news.mjs --lists     # list pages/shared outputs only; no article rendering
node scripts/build-news.mjs --article learn-rules # render this article and its dependencies
node scripts/build-news.mjs --article learn-rules --article local-designer # explicit batch
node scripts/build-news.mjs --layout revue # articles using this layout
node scripts/build-news.mjs --diagram learn-loop # articles using this diagram ID (see --list)
node scripts/build-news.mjs --asset learn-command-tatami # articles using this asset
node scripts/build-news.mjs --all        # full build (also the default without selectors)
node scripts/build-news.mjs --check     # fail if a generated file is out of date (no write)
node --test scripts/build-news.test.mjs # tests (validation, layouts, diagrams, hreflang, sitemap, idempotence)
```

Selectors are repeatable and combine as a union; `--check` also accepts them.
News lists show at most nine articles per page, with localized Previous/Next
controls, a live page count and `?page=N` links supporting history and language
switches. Year/month filters above the grid use the available article dates,
persist in `?year=YYYY&month=MM`, and reset pagination when changed.
Article type and functional domain are independent, combinable filters stored
in `nature` / `domain` URL parameters. Stable IDs and EN/FR labels live in
`content/news/taxonomy.json`; each article declares one `nature` and a non-empty,
unique `domains` array. The existing visual `tag` is independent of these fields.
The validator rejects missing/unknown classifications and untranslated labels.
Without JavaScript all articles remain accessible. Pagination assets
load only on the two list pages; use `--lists` after changing their presentation.
All sources are validated even in targeted mode, but only selected articles
and chronological navigation dependencies are rendered. The two lists, the
two home news blocks and the sitemap are also calculated to keep summaries,
ordering and links consistent. Only changed files are written; `--dry-run`
reports `changed`, `articles` and `written: []`. Invalid selectors fail explicitly.
A title/date/order change updates affected neighbours, including old neighbours
identified from their existing navigation. Global changes to `ui.json`,
`bundle.json`, menu/footer templates or generator code require `--all`.
Article deletion/slug renaming also requires a full build and an explicit review
of obsolete HTML outputs; the builder never deletes files automatically.

### Reworking existing content: one unit or a batch

- **Article or article fragment:** edit only the relevant typed blocks in
  `content/news/articles/<slug>.json`, keep EN/FR aligned, then use `--article`.
  For shared layouts, diagrams or asset metadata, use the matching selector.
- **Static page or page fragment:** edit the source HTML in `page.html` and
  `fr/page.html` directly with a bounded patch. Do not run the News generator
  for an unrelated static change. On home pages, preserve the generated news
  block; edit its sources if that block is the target.
- **Bulk:** enumerate the pages/articles and use the existing AI-KIDO
  refactoring workflow for mechanical replacements, with exact preconditions
  and a dry-run. For editorial changes use reviewed patches to the selected
  sources, then combine selectors in one build. Never overwrite a whole page
  to replace one fragment.
- Preserve anchors, menus, language switches, contextual screenshots,
  confidentiality, the design charter and accessible sticky article controls.
  Update links, sitemap and CSS cache versions only when affected. Apply the
  local editorial and proportionate-validation policies, including browser
  checks when changing UI, layout or action zones.

Here “atomic edit” means one bounded editorial unit, not a multi-file filesystem
transaction. EN/FR and dependent outputs belong to that unit. Review the reported
changed files and the Git diff before publication, especially with a dirty index.
The local `aikido-web-edit` skill exposes this workflow to the editorial and UI
agents. Syntax tests do not replace editorial/source/privacy review.

Layout of `content/news/`:

| Path | Role |
|---|---|
| `articles/<slug>.json` | one article: `slug`, `date`, `tag`, `image`, `layout`, and an `en` / `fr` block with `title`, `summary` (220 characters at most) and `body` |
| `layouts/<id>.json` | one page layout (13 available). Options: hero position, width, accent, lead, `h2` style, drop cap, `title` (normal, caps, huge), `meta` (inline, mono, byline), `rail` (none, toc, toc-cta) and `body` |
| `diagrams/<id>.json` | one SVG diagram generated from data (`flow`, `tree`, `funnel`, `cycle`, `hub`, `bars`, `pyramid`, `quadrant`) |
| `assets.json` | images with size and EN / FR alt text |
| `ui.json`, `bundle.json` | interface strings and global rules (minimum layouts, no two neighbours alike, animation quotas) |

The code that reads this folder is in `scripts/news/` (`load`, `validate`, `blocks`, `diagrams`, `pages`, `build`).

To add an article, create `content/news/articles/<slug>.json`, give it a layout different from its neighbours, add its image to
`assets.json`, then run the build. The script rejects duplicate slugs, invalid dates, missing images, two neighbouring articles
with the same layout, an article without a visual, EN and FR with different block counts, unbalanced tags and broken local links.
Menu and footer of the news pages are copied from `history.html` / `fr/history.html`, so a menu change is made there first.

`body` is a list of blocks. A plain string is an HTML paragraph (`<p>…</p>`, lists, inline code and links). Other blocks are objects:

| Block | Fields |
|---|---|
| `{ h2 }` | section heading |
| `{ code, lang, caption }` | code block, wrapped (no horizontal scroll) |
| `{ figure, width, height, alt, caption }` | image from `assets/images/news/` |
| `{ diagram, caption, animate }` | diagram from `diagrams/`; static by default, `animate` only for a flow and only when motion explains something |
| `{ callout, title }` | highlighted note |
| `{ stats: [{ value, label }] }` | two to four figures |
| `{ pullstat: { value, label } }` | one large figure |
| `{ compare: { left, right } }` | two columns, each with `title` and `items` |
| `{ timeline: [{ when, text }] }` | dated or ordered steps |
| `{ steps: [...] }` | numbered list of things to try |
| `{ references: [{ publisher, title, url, by }], title }` | numbered external sources, last block of the article. In the text, put the link on the words that name the source with `{ref:N\|words}` (for example `{ref:2\|Kiro}`): the build turns it into `<a class="src" href="<url of source N>" title="Publisher — Title" rel="noopener noreferrer" target="_blank">words</a>`. Bracketed calls such as `[2]` or `#ref-N` anchors in the body are rejected, as are non-https URLs, duplicates, a call without a source and a block that does not end the article |
| `{ quote }`, `{ chat }`, `{ faq }`, `{ cards }` | quotation, conversation, questions, cards |

Diagrams are static by default. At most one animated diagram per article, no two animated articles in a row,
and at most half of the diagrams animated. Only the arrows move, never the text, and `prefers-reduced-motion` stops them.

Write local links from the site root (`news/version-1-5.html`, `install.html`): the generator adds `../` on article pages
and the French pages resolve them under `fr/`. Everything shown must come from a public repository or a real run;
see `prompts/gen/concepts/qa-docs-ux/consignes-articles-news.md` for the editorial rules.

`assets/js/theme.js` must be loaded exactly once per page; a second copy binds the theme button twice so it flips back
and looks broken. A test checks every HTML page of the site.

The roadmap is a section of the story page (`#roadmap`, `#feuille-de-route`). It lists intentions without dates; an item moves
to the timeline only once it ships, and every item must match the project's own roadmap (status "in progress" or "planned", never presented as installed or deployed).

The home page also has a "On this page" bar that stays hidden over the hero and appears on scroll (`assets/js/home-nav.js`, `data-home-subnav`).

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
Custom domain: `www.ai-kido.fr` (persisted in `CNAME`; preserve this file).
Every push to `main` republishes the site.
GitHub Pages serves the committed static files; it does not run the News
generator. A targeted edit therefore needs no full-site regeneration before
publishing. Pages still deploys a site snapshot, not a partial-file transaction.
Run the relevant checks and review the bounded diff before an approved push;
branch-based Pages does not itself enforce the local editorial review.
