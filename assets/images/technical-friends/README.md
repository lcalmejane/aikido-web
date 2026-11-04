# Technical reference identities

Retrieved on 4 November 2026 for nominative identification on the bilingual
Technical friends page. These are upstream logos, publisher identities or
official site icons, not generated artwork and not evidence of endorsement.
They remain subject to their owners' licenses and trademark policies; the
method's MIT license does not relicense these assets.

Colours and proportions are preserved. ICO frames were exported as PNG;
ONNX Runtime and Hugging Face images were reduced proportionally to 96 px.
White presentation plates keep the original marks legible in both site themes.
The images are served locally: no visitor request goes to an upstream site.

| Local file | Official source / identity |
|---|---|
| `github.svg` | [GitHub site icon](https://github.githubassets.com/assets/pinned-octocat-093da3e6fa40.svg) |
| `draw-things.png` | [Draw Things favicon](https://drawthings.ai/images/favicon.png) |
| `mcp.png` | [MCP 192 px site icon](https://modelcontextprotocol.io/mintlify-assets/_mintlify/favicons/mcp/ebiVJzri-bsiCfVZ/_generated/favicon/android-chrome-192x192.png) |
| `kimono.svg` | `kimono-mcp-server/vscode/media/icon.svg` in the workspace; [public source](https://github.com/lcalmejane/kimono-mcp-server/blob/main/vscode/media/icon.svg) |
| `nodejs.png` | [Node.js favicon](https://nodejs.org/static/images/favicons/favicon.png) |
| `docker.png` | [Docker site icon](https://www.docker.com/app/uploads/2024/02/cropped-docker-logo-favicon-192x192.png) |
| `vscode.png` | [Visual Studio Code touch icon](https://code.visualstudio.com/assets/apple-touch-icon.png) |
| `claude-code.png` | [Claude Code documentation icon](https://code.claude.com/docs/mintlify-assets/_mintlify/favicons/claude-code/pLsy-mRpNksna2sx/_generated/favicon-dark/android-chrome-192x192.png) |
| `copilot.svg` | [GitHub Octicons Copilot](https://raw.githubusercontent.com/github/octicons/main/icons/copilot-24.svg), MIT; see [retained license](OCTICONS-LICENSE.txt) |
| `openai.png` | [OpenAI's GitHub organization avatar](https://avatars.githubusercontent.com/u/14957082?s=128), publisher identity on the Codex card, not a dedicated Codex logo |
| `kiro.svg` | [Kiro site icon](https://kiro.dev/icon.svg?fe599162bb293ea0) |
| `zoo-code.png` | [Zoo-Code site icon](https://www.zoocode.dev/icon.png?icon.0a8c_u2.fh1mu.png?dpl=dpl_ADH71HpnfekTDYf8R5zJCeoAChXF) |
| `roo-code.svg` | [Roo Code icon](https://raw.githubusercontent.com/RooCodeInc/Roo-Code/main/src/assets/icons/icon.svg) |
| `antigravity.svg` | [Google Antigravity favicon](https://antigravity.google/favicon.svg) |
| `opengui.svg` | [OpenGUI app icon](https://raw.githubusercontent.com/akemmanuel/OpenGUI/master/assets/app-icon.svg) |
| `openintelligentui.svg` | [OpenIntelligentUI app icon](https://raw.githubusercontent.com/CopilotKit/OpenIntelligentUI/main/apps/app/public/icon.svg) |
| `copilotkit.png` | [CopilotKit favicon](https://www.copilotkit.ai/favicon.ico), 48 px frame |
| `onnx-runtime.png` | [ONNX Runtime icon](https://raw.githubusercontent.com/microsoft/onnxruntime/main/docs/images/ONNX_Runtime_icon.png) |
| `minishlab.webp` | [MinishLab organization avatar](https://cdn-avatars.huggingface.co/v1/production/uploads/63161f9495b55e2621d109fa/bqKqoUcriI_W-8K4QNTF3.png), identified by the [Hugging Face organization API](https://huggingface.co/api/organizations/minishlab/overview); publisher identity for Model2Vec/Potion |
| `hugging-face.png` | [Hugging Face favicon](https://huggingface.co/favicon.ico), largest frame |
| `rust.svg` | [Rust site icon](https://rust-lang.org/static/images/favicon.svg) |
| `tree-sitter.png` | [Tree-sitter site icon](https://tree-sitter.github.io/tree-sitter/favicon-d87102d5.png) |

No dedicated project logo was identified for fast-grep, embsearch-core or
Multilingual E5 small. Their cards use plain text labels, not invented logos or
the GitHub/Hugging Face hosting logo passed off as the project's identity.

The Kimono references were checked against its `package.json`,
`semantic/Cargo.toml`, `semantic/versions.json`, `src/embedding-models.ts`
and the local Cargo package metadata for the exact upstream repositories.
Model2Vec describes the static embedding approach; Kimono implements its
lookup/mean/normalization backend in Rust rather than running the Python package.
