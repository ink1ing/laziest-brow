## laziest browser

One‑liner: Type a tiny prefix to jump fast — "," → ChatGPT, "." → FuClaude Demo, "/" → Bing, ";" → GitHub, "、"/"\\" → Bilibili, "'"/"‘" → Chinese Wikipedia.

## What It Does
- Lightweight Chrome extension that turns simple prefixes into smart redirects.
- Works from the address bar or Google search page; includes an Options panel.
- Auto-fills your query into ChatGPT and can auto-send it.
 - Optional settings panel to manage prefix mappings.

## Prefix Rules
- ",关键词" or "，关键词" → ChatGPT: `https://chatgpt.com/?q=%s&hints=search`
- ".关键词" or "。关键词" → FuClaude Demo: `https://demo.fuclaude.com/new?q=%s`
- "/关键词" → Bing: `https://www.bing.com/search?q=%s`
- ";关键词" or "；关键词" → GitHub: `https://github.com/search?q=%s`
- "、关键词" or "\\关键词" → Bilibili: `https://search.bilibili.com/all?keyword=%s`
- "'关键词" or "‘关键词" → Wikipedia (ZH): `https://zh.wikipedia.org/w/index.php?search=%s`
- Special phrase: starts with "今天什么新闻" also routes to ChatGPT. It accepts separators `/`, `,`, `，` after the phrase (e.g., `今天什么新闻/科技`).

Notes
- When you type a leading slash like "/AI" in the address bar, Chrome may try `file:///AI`. The extension detects this and redirects to Bing instead.

## How It Works
- `background.js` listens for navigations and parses the query string or typed URL using a small router.
- Depending on the prefix, it builds the target URL and updates the current tab.
- `content.js` runs on ChatGPT pages to auto-fill the prompt from `?q=` and auto-click the send button.

## Install (Developer Mode)
Option A — One-click download (Releases):
1. Go to GitHub Releases and download `laziest-browser-vX.Y.Z.zip`.
2. Unzip to a folder.
3. Open Chrome → `chrome://extensions`.
4. Toggle on "Developer mode" (top-right).
5. Click "Load unpacked" and select the unzipped folder.
6. Pin the extension if you like; it has no popup UI.

Option B — From source:
1. Download or clone this repository.
2. Open Chrome → `chrome://extensions`.
3. Toggle on "Developer mode" (top-right).
4. Click "Load unpacked" and select this folder.
5. Pin the extension if you like; it has no popup UI.

## Usage
- In the address bar, type a prefix + your query, then press Enter:
  - `,how to write a regex` → ChatGPT
  - `.vector search papers` → FuClaude Demo
  - `/privacy enhancing technologies` → Bing
  - `;机器学习` → GitHub 搜索
  - `、番剧 推荐` 或 `\编程 教程` → Bilibili 搜索
  - `'百科全书` 或 `‘百科全书` → 中文维基
  - `今天什么新闻/科技` → ChatGPT with "科技"

Tip
- You can also paste these as the `q` on a Google results page; the extension intercepts and redirects.

## Customization
- Edit prefix routing in `background.js` (function `extractRedirect`). Add new branches for more engines.
- Change ChatGPT auto-send behavior in `content.js`:
  - Find the block that queries `send-button` and clicks it. Comment it out to stop auto-send, or adjust the delay.
- Update manifest fields in `manifest.json` (name, description). Icons must be packaged files; Chrome cannot load `chrome://` image URLs.

## Permissions & Privacy
- Permissions: `webNavigation`, `tabs`, `activeTab`, host `*://*/*` to observe navigations and redirect the current tab.
- No analytics, no remote requests, no background network calls.
- All routing is local logic based on your typed text or current URL.

## Troubleshooting
- Seeing "ERR_FILE_NOT_FOUND" after typing `/term`?
  - That’s Chrome trying `file:///term`. The extension adds a fallback to redirect to Bing. If you still see it, ensure the extension is enabled and reloaded.
- Nothing happens on non-Google search pages?
  - The primary interception targets Google results pages. Address bar inputs still work via the `tabs.onUpdated` fallback for slash; other prefixes are handled when the search provider is Google or when Chrome yields a standard navigation URL.
- ChatGPT input not auto-filled?
  - The site markup can change. The script tries multiple selectors and waits briefly. Reload the page if needed.

## Directory Structure
- `manifest.json` — Extension metadata and permissions.
- `background.js` — Navigation listeners and prefix routing logic.
- `content.js` — Autofill and optional auto-send on ChatGPT.

## Changelog
- 1.0.1
  - Add bilingual Options panel (English/中文) with language toggle; GitHub dark theme + all bold fonts; top-centered repo link and thanks to @ink @codex.
  - Background reads mappings from storage and updates on change; slash file:// fallback respects user’s '/' mapping.
  - Include options files in packaged ZIP and release workflow.
- 1.0.0
  - First public release with new prefix mappings: `,`/`，` → ChatGPT, `.`/`。` → FuClaude Demo, `/` → Bing, `;`/`；` → GitHub, `'`/`‘` → Wikipedia (ZH). Slash file-URL fallback redirects to Bing.
  - Add release ZIP artifact and GitHub Actions workflow for one-click download.
## Settings Panel
- Open the extension’s Options (Chrome: chrome://extensions → the extension → Details → Extension options).
- The panel lets you:
  - View and delete existing mappings
  - Add a new mapping (Prefix → URL template; use %s as placeholder)
  - Restore defaults
- The UI language is English with GitHub dark theme styling and bold fonts.
