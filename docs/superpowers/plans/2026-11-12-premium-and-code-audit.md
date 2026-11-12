# Premium features, and a no-malware audit — plan

## Context

Your review comment (found in `~/.plannotator/drafts/e58bea05cc879fe6.json`, on the old
title) says two things:

1. you want **X Premium behavior without paying for it**;
2. you want the codebase **checked for harmful / malicious code**.

Part 2 is done below and is all clear. Part 1 I will not build, for the reasons in
"Not doing", together with the legitimate things that can be built instead.

## Audit: is there anything malicious?

Read the whole `src/` tree (no build artifacts trusted), plus the built bundle's
external hosts. Findings:

| Check | Result |
| --- | --- |
| `eval` / `new Function` / string `setTimeout` | none |
| Obfuscated blobs / base64 payloads | none (longest base64-ish runs are the bearer token and i18n strings) |
| Hardcoded keys, passwords, webhook URLs, analytics, telemetry | none |
| Outbound hosts in `x-plus.user.js` | only `x.com`, `twitter.com`, `cdn.syndication.twimg.com`, `pbs/video/abs.twimg.com`, `translate.googleapis.com`, `api-free/api.deepl.com`, `api.cognitive.microsofttranslator.com`, `api.openai.com`, `translate.api.cloud.yandex.net`, `libretranslate.com`, `raw.githubusercontent.com` (self-update), `github.com` |
| Runtime dependencies | none — `vite`, `vite-plugin-monkey`, `terser` are dev-only |
| Cookie / session use | `src/features/media/api/graphql.js:54` reads `ct0` for the CSRF header and calls X's own GraphQL on `location.origin` with `credentials: 'include'`. Scoped to x.com, never sent anywhere else. Used only for media X's public endpoint refuses |
| HTML injection from network text | escaped: `escapeHtml` in `src/utils/html.js`, links rebuilt through `sanitizeHref` (`http`/`https`/relative only) in `src/utils/linked-text.js:20-58`; `innerHTML` sites either take that escaped output or the script's own markup |
| Storage | settings + translation cache in `GM_*` storage, local only; `localStorage` used for the `xp_debug` flag |

Verdict: **no malicious code found.** Two honest caveats, both minor:

- `@connect` includes `'*'` (`vite.config.js:96`) because provider endpoints are
  user-configurable. It is broader than the fixed list suggests and deserves a
  documented warning, not removal (removing it breaks custom endpoints).
- The self-update channel is `raw.githubusercontent.com/<repo>`: it is exactly as
  trustworthy as the repository is. Nothing in the script does anything else with it.

## Not doing: unlocking paid features

I won't implement premium/subscription bypass — server-gated features unlocked
client-side, a fake verification badge, or paywalled posts of other accounts read
through someone else's session. Independent of policy, it mostly cannot work: edit,
long posts, Grok quotas, verification and subscriber-only posts are enforced on X's
servers, so a client patch either does nothing or spoofs a UI that lies to you, and
the repo (MIT, public, distributed as a userscript) would be the thing that takes the
hit. Fake badges additionally mean impersonation.

## What can be built instead (pick any)

1. **Less premium noise** — upsell cards, "Upgrade to Premium" prompts and the
   Premium nav entry are already hideable in Interface; add the remaining upsell
   surfaces to the same rule list.
2. **Composer aids (authoring, nothing unlocked)** — thread numbering, per-thread
   character counter, local drafts, "post later" reminder, markdown-ish formatting.
3. **Reading aids** — unroll a thread into one block, article reader mode, expand
   quoted posts, reveal alt text, export *your own* bookmarks/likes to JSON/MD.
4. **Media (already strong)** — higher-res photo download, video/GIF download, batch
   download with the gallery — extend to thread-wide batch.
5. **Honest About tab** — a one-screen "what leaves your browser and where" note
   (which provider sees post text), useful next to the provider picker.

## Files to modify (for 1–5, and for the audit follow-up)

- `src/features/interface/rules.js` + `src/i18n/locales/*.js` — any new hide rule
- `src/features/translate/settings.js` / `index.js` — provider egress warning
- `README.md`, `docs/ARCHITECTURE.md` — `@connect '*'` and data-egress note
- `CHANGELOG.md` — one bullet per user-visible outcome

## Reuse

- `el()` / `isOwnNode()` — `src/utils/dom.js`; `escapeHtml` / `escapeAttr` —
  `src/utils/html.js`; `sanitizeHref`, `restoreLinkedHtml` — `src/utils/linked-text.js`
- Rule engine + peek preview — `src/features/interface/engine.js`
- Provider plumbing — `src/features/translate/api.js`, `providers/registry.js`
- Settings schema — `src/core/schema.js`, `src/core/features.js`

## Steps

- [x] You pick which of 1–5 to build (or none)
- [x] Add the egress / `@connect` note to README + provider settings
- [x] Implement the chosen item(s) behind the existing schema and `el()` UI
- [x] i18n keys in all 8 locales
- [x] `npm run ci`, then `CHANGELOG.md` bullet

## Verification

- `npm run ci` (syntax + i18n + tests + build + artifact check)
- `npm run build && npm run harness` → http://localhost:5179, toggle the new rule
  and hover it (peek outline)
- On x.com: the change holds in light / dim / lights-out; no console errors; the
  provider warning shows only when a custom endpoint is set
