# Deployment to Render Static Sites — Exact Steps

Target: Free tier Static Site on Render.com. Pure `dist/` output from Vite. Git-based deploys. CDN + automatic HTTPS.

## Prerequisites (for a human or agent)

- A GitHub (or GitLab/Bitbucket) repo containing this project (the current workspace will be pushed).
- The repo must contain a working `npm run build` that emits a `dist/` folder with `index.html` + assets.

## One-Time Setup on Render (Dashboard)

1. Go to https://dashboard.render.com/ and log in (free account).
2. Click **New +** → **Static Site**.
3. Connect your Git provider and select the `mezzo` repo (or the branch you want to deploy, usually `main` or `master`).
4. Fill in:
   - **Name**: `mezzo` (or `mezzo-tornado`, whatever is available and memorable)
   - **Environment**: Static Site (already selected)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: leave blank (or `.` if the dashboard asks)
5. (Optional but recommended) Under **Advanced**:
   - Add any necessary environment variables (none for pure static v1).
   - You can add a `render.yaml` later for infrastructure-as-code (see below).
6. Click **Create Static Site**.

Render will clone, run the build, and deploy. You will get a `*.onrender.com` URL immediately.

## Subsequent Deploys

Every push to the tracked branch triggers an automatic rebuild and deploy (atomic, with CDN cache invalidation).

Pull Request previews: Render can automatically create preview URLs for PRs if enabled in the service settings.

## Local Verification Before Pushing (Mandatory for Agents)

```bash
npm run build
npm run preview
# Open the local preview URL in browser
# Perform the full manual checklist from the master instructions / verification section
```

Also test by serving the raw `dist/` folder with any static server:
```bash
npx serve dist
# or python -m http.server -d dist
```

## Optional: render.yaml (for repeatable setup)

Create a `render.yaml` in the repo root (Render will detect it):

```yaml
services:
  - type: static_site
    name: mezzo
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    # routes, headers, redirects can be added here later
    # e.g.
    # routes:
    #   - type: rewrite
    #     source: /*
    #     destination: /index.html   # for client-side routing if ever needed (not for v1)
```

This file makes the static site definition part of the repo. Future agents or humans can re-create the service from it.

## Custom Domain (nice to have, not required)

In the Render dashboard for the static site:
- Settings → Custom Domains → Add your domain.
- Follow the DNS instructions (CNAME or A record).
- Render provisions a free TLS certificate via Let's Encrypt.

Free tier supports a small number of custom domains.

## What the Free Tier Gives You (as of 2026 knowledge)

- Static sites are free to deploy.
- Global CDN.
- Automatic deploys from Git.
- Bandwidth and build minutes count against workspace included usage (personal/educational projects with modest traffic are almost always fine).
- No spinning down (static sites are always on via CDN).

## Verification Checklist After Deploy (Agent Must Run)

1. Open the live `onrender.com` URL in a clean browser session (incognito or different profile).
2. Cold load time feels reasonable (< ~3–4 s on typical connection for first visit).
3. 3D canvas appears and is interactive (orbit, zoom, time scrubber works).
4. Play the simulation through at least one full cycle; all 8 pulsing balls move and are clickable at multiple phases.
5. Data panel (if open) shows updating numbers and charts that match the visual phase.
6. Test on a real mobile device or responsive dev tools (touch orbit + scrubber + ball tapping).
7. No console errors related to three.js, loading of `/art/*.jpg`, or module imports.
8. The theme (colors, stamps, typography) matches the Imagine references.
9. "View source" or Network tab shows only static assets (no mysterious API calls).
10. (Optional) Run Lighthouse or WebPageTest for perf sanity (performance budget is "good enough for an interactive 3D educational toy").

Record the live URL in the root README or a `DEPLOYED.md` once it is stable.

## Rollback & Debugging

- Render keeps previous deploys. You can redeploy any previous successful build from the dashboard.
- Build logs are visible per deploy — the most common issues are:
  - Wrong publish directory (`dist` not `build`).
  - Missing `npm run build` step or wrong Node version (Render usually detects Vite fine; pin Node in `.nvmrc` or `engines` in package.json if needed).
  - Large assets not committed to `public/art/`.

## Future Agents

When you are ready to deploy:
- Make sure the current commit on the branch is the one you want live.
- Push.
- Watch the Render dashboard for the new deploy.
- Run the verification checklist above.
- Update any "live demo" link in the README or docs.

This is intentionally the simplest possible production path for a pure static Three.js + React educational app. No surprises.
