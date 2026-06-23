# Moving Day — Studio

> **You bring the brand. We'll do the moving.**

Moving Day is a premium brand‑identity *moving service*, delivered as a web app. A client arrives, hands over whatever brand assets they already have (logos, colours, type, documents), and the studio **reveals** the brand back to them — organised, classified, and published as a permanent, client‑accessible **Brand Home**.

The guiding principle, baked into how the whole app behaves:

> **Moving Day does not build brands. It reveals them.**
> Never invent. Always reveal. *AI decides content. Code decides layout.*

---

## Live

| Environment | URL |
| --- | --- |
| Production (custom domain) | https://studio.movingdaybrand.com |
| Production (Vercel) | https://studio1-woad.vercel.app |
| Marketing site | https://movingdaybrand.com |

Deploys are automatic: push to **`main`** → Vercel builds and ships.

---

## What it does

1. **Arrival** — the client enters through the *Brand Concierge* experience (`experience.html`), a calm, glass‑and‑morning‑light onboarding flow. They upload the assets they have.
2. **Reveal** — uploaded files are sent to the AI analysis route (`/api/analyze-brand-files`), which reads the marks with GPT‑4o vision and returns a structured read of the brand: palette, per‑asset roles, typography, and a written `presentation` layer.
3. **Organise** — assets land in the **Brand Home** (`index.html`): a room‑based environment where everything is grouped into logo *families* and *roles*. The client (or founder) can correct any role; the organisation is the single source of truth.
4. **Publish** — the full interactive Brand Home is snapshotted with its assets embedded and stored as a permanent link in Vercel Blob, ready to hand to the client.

### The rooms

The Brand Home is organised into rooms, each a view onto the same underlying brand data:

- **Identity** — the marks, shown as they should be used.
- **Assets** — every file, grouped by family and role (Primary, Secondary, Wordmark, Icon, Supporting), plus typography.
- **Brand Guide** — the logo system, colour, and typography written up as a guide.
- **Typography** — the brand's faces.
- **Deliverables** — exportable outputs.
- **Founder Tools** — internal controls (editor mode, raw state, atmosphere), not shown to clients.

---

## Repository layout

This is intentionally a **single‑file app per surface** plus a thin serverless API. There is no build framework, no bundler, and no client‑side dependency graph — just HTML/CSS/vanilla JS that the browser runs directly.

```
.
├── index.html              # ⭐ The Studio / Brand Home — builder, rooms, publish (the core product)
├── experience.html         # Brand Concierge — client arrival & intake flow
├── guide.html              # Standalone Brand Guide builder (legacy surface)
├── client-guide.html       # Client-facing brand guide view
│
├── api/                    # Vercel serverless functions (Node)
│   ├── analyze-brand-files.js  # GPT-4o vision: reads assets → palette, roles, type, presentation
│   ├── smart-fill.js           # Auto-populate brand fields from a website URL
│   ├── publish.js              # Store built Brand Home/Guide HTML in Blob → return a viewer link
│   ├── guide.js                # Serve one published guide inline (re-serves the Blob with the right headers)
│   ├── guides.js               # List published guides (newest first)
│   └── render-brand-guide.js   # Server-side guide render (uses shared core)
│
├── shared/
│   └── render-brand-guide-core.js   # Render logic shared between surfaces
│
├── clients/                # Saved client outputs + index.json
├── netlify/functions/      # Netlify equivalents (alternate host config)
│
├── vercel.json             # Routes + rewrites (primary host)
├── netlify.toml            # Build + redirects (alternate host)
├── package.json            # Build script + @vercel/blob dependency
└── .gitignore
```

### Entry points at a glance

| File | Purpose |
| --- | --- |
| `index.html` | The Studio. Builds and organises the Brand Home, runs analysis, and publishes. **This is where almost all product work happens.** |
| `experience.html` | The client‑facing arrival / intake experience. |
| `guide.html` / `client-guide.html` | Earlier guide‑builder surfaces. |

---

## How it works (architecture)

### One write‑store, many read‑views

Everything flows from a single flat object, **`brand`**:

```
brand = {
  name, tagline, category,
  logos[],            // each: { id, name, ext, url, role, variantClass, ... }
  photos[], docs[],
  colors[], type, fonts[],
  presentation,       // the written, studio-voiced brand sections
  placements          // which mark goes in which slot
}
```

Logo **roles** are the backbone: `primaryLogo`, `secondaryLogo`, `wordmark`, `iconMark`, `supporting`.

`logoFamilies()` derives families (Primary / Secondary / Wordmark / Icon / Supporting, each with full‑colour / dark / light / other variants) **from those roles**. Every surface that shows logos — the **Identity** room, the **Brand Guide** logo system, and the **Assets** shelves — reads from `logoFamilies()`. That means organising an asset once (e.g. locking a role in Assets) is reflected everywhere the next time a room renders.

A few rules the code follows:

- **Roles are the source of truth.** When you set a role in Assets it is *locked*, so re‑analysis can't move it. Colour variants of the same mark follow the locked role.
- **AI decides content, code decides layout.** The analysis route fills in *what* the brand is; the app decides *how* it's arranged.
- **Publishing re‑derives.** Before a Brand Home or Guide is snapshotted, roles are re‑derived so the published, client‑facing output always mirrors the current organisation.

### Publishing

Published output is a self‑contained HTML snapshot of the interactive Brand Home (assets embedded), stored in **Vercel Blob**. Because Blob force‑downloads `.html`, published links are always served *through* `/api/guide` (and listed via `/api/guides`), which re‑serve the stored file inline with the correct content type — clients get a page that renders, never a download.

---

## Local development

There's no dev server required for the static surfaces — open the HTML directly or serve the folder:

```bash
# serve the repo root with any static server
npx serve .
# then visit http://localhost:3000/index.html  (or /experience.html)
```

The `/api/*` routes are Vercel serverless functions. To run them locally with the rewrites and environment in place:

```bash
npm install
npx vercel dev
```

> Note: the AI routes (`analyze-brand-files`, `smart-fill`) and publishing require the environment variables below. Without them, the static UI still loads, but analysis and publish will fail.

### Build

The build simply assembles the static surfaces into `dist/` (no compilation):

```bash
npm run build
```

---

## Environment variables

Set these in the Vercel project (or `.env.local` for `vercel dev` — never commit them; `.env*` is git‑ignored).

| Variable | Used by | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | `analyze-brand-files`, `smart-fill` | OpenAI access for vision analysis and website smart‑fill. |
| `OPENAI_MODEL` | `analyze-brand-files` | Optional model override (defaults to GPT‑4o‑class vision). |
| `WEBSITE_ENRICHMENT` | `analyze-brand-files` | Optional toggle for pulling extra context from the brand's site. |
| `BLOB_READ_WRITE_TOKEN` | `publish`, `guides`, `guide` | Vercel Blob read/write token for publishing. |
| `BLOB_STORE_ID` | `publish`, `guides`, `guide` | Vercel Blob store identifier. |

---

## Deployment

**Primary host: Vercel.** Pushing to `main` triggers an automatic deploy. `vercel.json` defines the rewrites:

- `/experience`, `/brand-concierge` → `experience.html`
- `/guide` → `guide.html`
- `/api/analyze-brand-files`, `/api/smart-fill`, `/api/render-brand-guide` → their `.js` functions
- other `api/*.js` files are served as functions at their matching `/api/<name>` paths

`netlify.toml` keeps an equivalent configuration for Netlify as a fallback host.

### Typical change cycle

1. Edit the relevant surface (almost always `index.html`).
2. Commit and push `main` (GitHub Desktop → Vercel auto‑deploys).
3. For client‑facing output, **re‑publish** the Brand Home — the previous published link keeps serving until you do.

---

## Working notes (read before editing `index.html`)

`index.html` is a large (~350 KB) single‑file app. A few conventions keep it stable:

- **It's an additive `!important` CSS cascade.** New styles are layered on top rather than rewriting existing rules. Broad rewrites are risky; prefer targeted additions.
- **Edit surgically.** One change at a time, verified before the next. Exact‑string find/replace beats line numbers.
- **Validate before shipping.** The app's inline scripts should pass `node --check`. The published toolbar is a JS template literal — confirm it still parses after edits that touch it.
- **The published page embeds the full stylesheet.** Any CSS added to the app appears in the published Brand Home automatically; CSS‑only animations therefore publish without extra work.

---

## Housekeeping

A few snapshot/backup files live in the repo and can be archived or removed when convenient:

- `index (2).html` — an older copy of the studio.
- `moving-day-organized.html` — an earlier organised export.

---

*Built part‑time, with care. The brand is already there — Moving Day just helps it move in.*
