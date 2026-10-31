# AccessReady

A complete, local-first hackathon demo for finding healthcare facilities that fit a person's specific accessibility requirements.

**All facilities, locations, contact details, accommodation evidence, and verification statuses are synthetic. This is not a provider directory for arranging real care.**

## Run locally

Use Node.js 22 or newer. No secrets, database, authentication, paid APIs, or external image/font services are required.

**Windows:** extract the source archive, open PowerShell in the folder containing `package.json`, and run the commands below. Linux, WSL, Docker, and Python are not required. See [WINDOWS.md](WINDOWS.md) for native Windows and Google Chrome checks.

In this development workspace, that project folder is `/Workshop/accessready-v2`.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. If another app uses that port:

```bash
npm run dev -- --port 3100
```

For production:

```bash
npm run build
npm run start -- --port 3100
```

To view the app through this workspace's **Ports** panel, including from Google Chrome on Windows:

```bash
npm run preview:ports
```

The preview defaults to **port 4173**. Open **Ports → 4173 → Open in Browser**; its default address redirects to **`/ports/4173/accessready-v2`** on that workspace host. This builds a separate production preview with the correct prefixes for styles, fonts, links, and API calls. Port 3100 is no longer used for the live workspace preview.

The workspace removes `/ports/4173` before forwarding requests, so the preview server restores that prefix for Next.js and handles redirects without duplicating it. Preview responses use `Cache-Control: private, no-store` to prevent old HTML and JavaScript from being mixed across builds. The usual root-path build remains separate in `.next`; this preview uses `.next-preview-4173`. Each preview port gets its own build directory, so a second preview cannot overwrite assets used by a running one. You can pass a different available port if needed. No GitHub repository or deployment is required.

The build and development commands explicitly use Next.js's webpack integration with the standard Tailwind 4 PostCSS plugin. The global stylesheet imports Tailwind through `@import "tailwindcss"`. DM Sans and Lora are bundled locally through `next/font/local`, with their SIL Open Font Licenses in `public/fonts/`. Styling and fonts are served by the app; there are no external font requests.

## Halloween theme

The shared palette in `app/globals.css` uses a midnight canvas (`#0D0D12`), pumpkin primary actions (`#FF7A00`), purple accents (`#A855F7`), and off-white text (`#F3F4F6`). Dark glass cards have subtle orange/purple borders; opaque surfaces provide a fallback when backdrop filtering is unavailable. The clinic illustration and Boo use the same palette.

Primary buttons use dark text for a 7.4:1 contrast ratio. Purple labels use a lighter purple, and barrier text uses a lighter red, to retain contrast at small sizes. Green verification, amber uncertainty, and red barrier indicators always include text or icons. Captions and labels are at least 12 CSS pixels, focus rings remain visible, and the 200 ms hover effects respect reduced-motion preferences. Automated checks cover selected WCAG A/AA rules, not full conformance.

## Two-minute demonstration

1. Open the homepage and choose **Try the demo**.
2. The profile selects a wheelchair-accessible entrance and adjustable-height exam tables.
3. The browser calls the clinic and matching APIs. Twelve facilities are ranked using the selected requirements.
4. Open **Willow Family Care** to inspect a 100% synthetic match, including the specific table details.
5. Add Willow Family Care and Harborview Wellness to comparison. Harborview has a verified entrance but lacks an adjustable exam table, so its score is 50%.
6. Compare them side by side. Tidewell Specialty Care offers a useful third example: its table is unknown, not confirmed missing.

## Implemented features

- A responsive homepage, Find Care, facility details, comparison, About/data page, and not-found/error states.
- All 16 requested accommodations across Mobility, Hearing, Vision, Sensory, and Communication.
- Native, labeled multi-select checkboxes; no medical diagnoses or personal identity fields.
- Twelve distinct, committed JSON facility records with contact information, specialty, fictional location, evidence, and detailed accommodation notes.
- Search by facility, specialty, address, or neighborhood; specialty and verification filters; best-match/alphabetical sorting.
- Real server-side matching via `POST /api/match`, plus `GET /api/clinics` and `GET /api/health`.
- Transparent scores, supported/missing/unknown breakdowns, per-accommodation evidence, and explanatory text.
- Up to three facilities compared side by side, including unknown support and contact details.
- Demo profile, session-scoped profile and comparison persistence, reset/clear controls, loading states, recoverable API errors, and empty results.
- An original lightweight SVG healthcare illustration and Boo, the friendly Halloween mascot.
- Keyboard controls, skip link, visible focus, live result announcements, semantic tables/forms, reduced-motion support, and mobile layouts.

## Matching rules

```text
score = floor(verified supported selected requirements / selected requirements * 100)
```

All selected requirements have equal weight.

| Accommodation evidence | Matching treatment |
| --- | --- |
| Verified + supported | Supported; earns one point |
| Verified + unsupported | Confirmed missing; earns no points |
| Unknown, self-reported, unverified, or absent data | Unknown; earns no points |
| No selected requirements | No percentage (`null`) |

A facility can receive 100% only when every selected requirement has verified support in the fictional scenario. Ties favor fewer confirmed missing requirements, then alphabetical name order. The overall facility verification badge is separate from each accommodation's evidence level. Per-accommodation evidence determines the score.

The score describes this dataset. It does not measure clinical quality, establish medical suitability, or guarantee availability.

## Project structure

```text
app/
  layout.tsx, globals.css, page.tsx, icon.svg
  find-care/page.tsx
  facilities/[id]/page.tsx
  compare/page.tsx
  about/page.tsx
  api/clinics/route.ts
  api/match/route.ts
  api/health/route.ts
  error.tsx, loading.tsx, not-found.tsx
components/
  brand.tsx, care-illustration.tsx, shell.tsx, ui.tsx
  profile-provider.tsx, requirements-selector.tsx
  find-care.tsx, facility-card.tsx, facility-detail.tsx
  compare-facilities.tsx
data/
  clinics.json                 # Complete bundled synthetic dataset
  clinics.ts                   # Typed data import
lib/
  accessready/types.ts
  accessready/requirements.ts
  accessready/match.ts          # Deterministic matching logic
  accessready/validation.ts
  use-matches.ts               # API loading, errors, cancellation
  api-path.ts                  # Prefixes API calls for optional port previews
scripts/generate-demo-data.py   # Optional fixture authoring utility
scripts/preview-ports.mjs       # Production preview through workspace Ports
scripts/preview-server.mjs      # Adapts the workspace's path-stripping proxy
scripts/fonts.conf             # Optional fallback for fontless Linux test hosts
public/fonts/                  # Bundled fonts and their licenses
tests/
  backend.test.ts
  e2e/accessready.spec.ts
  preview/styling.spec.ts       # Browser regression through a stripping proxy
  support/port-proxy.mjs        # Reproduces workspace forwarding for tests
playwright.config.ts
playwright.preview.config.ts
next.config.ts
postcss.config.mjs
package.json, package-lock.json, tsconfig.json
API_CONTRACT.md
VERIFICATION.md
WINDOWS.md
```

Python is only used by the optional fixture-authoring script. It is not needed for installation, runtime, builds, deployment, or tests.

## Verification

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

On Linux, Playwright may require browser OS libraries: `npx playwright install --with-deps chromium`.

If a minimal Linux test host has no system fonts or Fontconfig configuration:

```bash
FONTCONFIG_FILE="$PWD/scripts/fonts.conf" npm run test:e2e
```

This optional test-only configuration points Chromium at the bundled font files. It does not change production behavior.

The browser suite launches a production server on port 3100 and shuts it down afterward. Run the build first and leave that port free, or select another port with `PLAYWRIGHT_PORT=3101 npm run test:e2e`. It tests desktop Chromium and Chromium with iPhone 13 viewport/touch emulation; this is not a claim of Safari or physical-device coverage.

To test the already-running workspace preview without starting another port, use:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 PLAYWRIGHT_BASE_PATH=/ports/4173/accessready-v2 npm run test:e2e
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e:preview
```

These checks leave the preview running. The usual test server serves a root-path build and is only for automation; its port is not a workspace preview link. Use **4173** in the Ports panel.

After running the port-preview build, verify the workspace-specific path handling with:

```bash
npm run test:e2e:preview
```

This regression uses ports 3199 and 3200, so the live preview on 4173 can stay open. It starts at the same root URL opened by the Ports button, reproduces the workspace's prefix removal and redirect rewriting, then checks CSS response types, computed Tailwind styles, loaded fonts, the full demo, comparison, page reloads, and cache prevention for HTML, RSC, CSS, and redirects. Its fixture expects a preview built for `/ports/4173/accessready-v2`. Set `ACCESSREADY_PREVIEW_PORT` to test a preview built for another port.

To run either suite with an installed Google Chrome browser instead of Playwright's bundled Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to that Chrome executable's path. The optional font configuration above is still needed on this minimal Linux host.

The tests check actual HTTP responses, the complete match/details/comparison flow, profile persistence, all five categories, filtering, empty and error states, mobile navigation, keyboard focus, reduced motion, page overflow, generated CSS, computed Tailwind styling, and axe WCAG A/AA rules.

See [VERIFICATION.md](VERIFICATION.md) for actual results and limitations. Browser screenshots and HTML reports are generated in ignored `test-results/` and `playwright-report/` directories.

## Privacy and limitations

- Requirement IDs are sent to the app's API. The application does not persist user profiles on the server and has no analytics. Hosting providers may keep standard request logs.
- Selections are stored only in session storage for the current browser tab when supported. Storage failures fall back to in-memory state. Reset needs and clear the comparison to remove selections.
- The directory is synthetic. No appointments, genuine contact actions, insurance filtering, live location search, routing/map service, or real verification workflow is provided.
- Contact details use reserved `555-01xx` phone numbers and `.example` email domains. The city and coordinates are illustrative.
- Self-reported information is deliberately conservative: it counts as unknown until verified.
- Automated accessibility checks cannot establish full WCAG 2.2 AA compliance. A full manual audit, assistive-technology evaluation, and user research remain future work.

## Git safety and a future GitHub transfer

This rebuild is in the isolated local worktree `/Workshop/accessready-v2` on branch `rebuild/accessready-v2`. The existing backend, integration checkout, and `main` branch are preserved. No GitHub repository has been created and nothing has been pushed.

Inspect the local delivery:

```bash
git branch --show-current
git log -1 --oneline
git status --short
```

When you choose to create a GitHub repository, create an **empty** repository in your own account. Then add it as a separate remote so the existing `origin` remains intact:

```bash
git remote add publish https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u publish rebuild/accessready-v2
```

Select `rebuild/accessready-v2` as that new repository's default branch if desired. No force push or changes to the previous `main` branch are needed. Use your normal GitHub authentication; no tokens belong in this project.

For a repository-free source transfer:

```bash
git archive --format=zip --output=/tmp/accessready-v2.zip rebuild/accessready-v2
```

Extract the archive elsewhere, run `npm ci`, and follow the run commands above. A worktree's `.git` file points to the original local repository, so use the archive instead of copying that pointer to a different machine.

## Deploy to Vercel when ready

Nothing is deployed automatically by this project.

1. Push the completed branch to your chosen repository when ready.
2. In Vercel, import that repository and choose `rebuild/accessready-v2`.
3. Use the **Next.js** framework preset and the repository root as the root directory. The archive/branch contains the app at its root.
4. Select Node.js **22.x** or **24.x**. Keep the build command `npm run build`; use `npm ci` to install.
5. Leave the output directory at Next.js's default. No environment variables or secrets are required.
6. Deploy. Check `/api/health`, `/api/clinics`, and the two-minute demo at the deployment URL.

Alternatively, the official Vercel CLI can deploy the finished local directory when you decide to publish, without requiring a GitHub repository. Follow the CLI's account/project prompts. Publication has not been performed here.

The JSON fixture is imported into the server bundle, so API routes do not depend on external filesystem paths or development-only data files.
