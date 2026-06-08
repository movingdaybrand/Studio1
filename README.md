# Moving Day Studio — Logic Update

This is the GitHub-ready version of your current Moving Day Studio app with the actual product logic exposed and wired up.

## What changed

- Fixed the build problem by using a real `index.html` file.
- Kept your single-file HTML guide builder design.
- Exposed the hidden Auto-Builder controls.
- Added a local no-key smart sorter that analyzes filenames, file types, dimensions, quality, and colors.
- Added optional AI analysis endpoints for both Vercel and Netlify.
- Added `/api/analyze-brand-files` routing on both platforms.
- Added localStorage persistence so the builder does not reset on refresh.
- Final export still removes internal builder UI and downloads a clean client-facing guide.

## Deploy on Vercel

Use these project settings:

- Framework Preset: Other
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

Optional AI setup:

- Add environment variable: `OPENAI_API_KEY`
- Optional environment variable: `OPENAI_MODEL`
- Default model in the serverless endpoint: `gpt-5.4-mini`

## Deploy on Netlify

Netlify uses `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Optional AI setup:

- Add environment variable: `OPENAI_API_KEY`
- Optional environment variable: `OPENAI_MODEL`

## How the logic works

1. Client or internal user uploads a messy brand folder.
2. Files are stored in-browser as embedded data URLs for this static MVP.
3. Local Smart Sort immediately works without a backend.
4. AI Analyze + Place calls `/api/analyze-brand-files` when an OpenAI key is configured.
5. If the AI endpoint fails, the app automatically falls back to Local Smart Sort.
6. The builder maps assets into hero logo, primary logo, icon mark, profile image, web header, print, and social slots.
7. Export Final Guide downloads a clean HTML file with the internal builder removed.

## Important MVP limitation

This version is still static. Uploaded files live in the browser and exported HTML. For a true client portal, the next step is Supabase Storage or another file storage/database layer.
