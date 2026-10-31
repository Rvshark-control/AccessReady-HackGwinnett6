# AccessReady verification

Verified on October 31, 2026 in the isolated `rebuild/accessready-v2` worktree.

## Actual results

| Check | Result |
| --- | --- |
| Dependency installation | Passed; pinned dependencies installed |
| Clean lockfile installation | Passed: `npm ci --ignore-scripts` in a separate temporary directory, 56 packages installed |
| Dependency audit | 0 vulnerabilities reported after upgrading to Next.js 16.4.3 |
| TypeScript | Passed: `npm run typecheck` generates route types and completes `tsc --noEmit` |
| Production build | Passed: `npm run build`; all five page types, not-found page, icon, and three API routes generated |
| Matching/data/API tests | 13 passed, 0 failed |
| Full browser suite | 14 passed, 0 failed; seven scenarios each on desktop and mobile Chromium |
| Official Google Chrome | Full suite: 14 passed, 0 failed using Google Chrome for Testing 156.0.8078.80 on Linux |
| Workspace forwarding regression | 2 passed in Chromium and 2 passed in official Chrome; desktop and mobile flows through a proxy that strips `/ports/3100` |
| Final visual adjustments | Rebuilt successfully, then reran the four affected homepage/full-demo desktop/mobile scenarios: 4 passed |
| Automated accessibility | No axe violations for the selected WCAG A/AA rules in the tested page states, on both desktop and mobile |
| Tailwind and fonts | Served CSS returned HTTP 200; computed Tailwind colors, custom layout styles, and loaded local fonts were verified in Chromium |
| Responsive layout | No document-level horizontal overflow in the tested flows at desktop/iPhone sizes; additional Chrome checks passed at 320, 360, 768, 1024, and 1920 CSS pixels |
| Visual inspection | Desktop homepage, Find Care, facility details, comparison, and mobile homepage screenshots were inspected |
| Source whitespace | `git diff --check` passed |

The original Chromium full suite completed in 52 seconds. A targeted rerun after mobile text-spacing and comparison-scroll-hint adjustments completed in 24 seconds. The later complete official Chrome suite passed in approximately one minute. The forwarding regression passed in 13.3 seconds with Chromium and 16.4 seconds with official Chrome.

## Fixed missing CSS in the workspace preview

The workspace proxy removes `/ports/3100` from incoming paths and prepends it to relative redirect locations. The first preview assumed that Next.js would receive the prefix intact. A direct browser check of the prefixed URL passed, but it did not reproduce the proxy's transformation.

The actual stripped stylesheet request returned **404**. The preview-only adapter in `scripts/preview-server.mjs` now restores the prefix before passing the request to Next.js and adjusts redirects to avoid duplicate prefixes. The same stripped homepage and stylesheet requests now return **200**, with the stylesheet served as `text/css`.

`tests/support/port-proxy.mjs` reproduces the path and redirect behavior read from this workspace's proxy implementation. The committed browser regression runs through that proxy and checks loaded CSS/fonts, computed Tailwind styling, API prefixes, demo scores, details, comparison, reload persistence, accessibility, and canonical redirects. Both official Chrome and Chromium passed with zero failed HTTP responses or page errors.

The hosted workspace proxy itself requires the user's authenticated browser session; the automated regression reproduces its routing behavior locally. Native Windows Chrome execution is not claimed. [WINDOWS.md](WINDOWS.md) includes native Windows run and verification commands.

## What was exercised

The backend tests validate the complete 12-facility/16-accommodation dataset, unique synthetic records, reserved phone/email formats, confirmed/missing/unknown distinctions, self-reported evidence, missing records, empty profiles, duplicate requirements, score rounding, deterministic ranking, every single and paired requirement combination across every facility, invalid input, API filtering, malformed JSON, content types, oversized request bodies, and API health.

The browser tests use the production server and real API calls. They cover:

- Homepage rendering, stylesheet requests, generated Tailwind styling, loaded bundled fonts, and navigation.
- Try Demo → selected requirements → ranked matches → Willow Family Care details → comparison with Harborview Wellness.
- Correct 100% versus 50% compatibility and a clear missing examination table.
- Session persistence after reload and repeated demo reset on the same page.
- Requirement edits in all five categories, searching, specialty and verification filters, unknown evidence, empty results, and reset.
- Building comparisons directly, the three-facility limit, removal, and clearing.
- A deliberately injected API failure, accessible error display, absence of stale cards, and recovery through the real API.
- Keyboard skip link and focus, reduced-motion settings, mobile navigation, About/data, and missing facility routing.
- HTTP health, clinic search, ranked matching, invalid requirement IDs, malformed JSON, and missing IDs.

Accessibility scans include the homepage, populated Find Care, the API error state, facility details, populated comparison, and About. These are automated checks of specific states, not a full conformance audit.

## Reproduce

```bash
npm ci
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser suite starts and stops its own production server on port 3100. Keep that port free, or set `PLAYWRIGHT_PORT` to another port.

After building the preview for `/ports/3100`, run its separate regression:

```bash
npm run test:e2e:preview
```

It uses ports 3199 and 3200 and leaves the live preview on 3100 running. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to a Google Chrome executable to run either suite with that browser.

This minimal Linux host had no system fonts or Fontconfig configuration. Its first browser attempt crashed in Chromium's font renderer. Locally bundled, licensed DM Sans and Lora fonts and the optional test configuration resolved that environment failure:

```bash
FONTCONFIG_FILE="$PWD/scripts/fonts.conf" npm run test:e2e
```

This host also restricts local sockets and some subprocess behavior inside its sandbox. The TypeScript runner, production build, and browser server were run with the required execution permission. These restrictions are specific to the test environment.

The official Google Chrome binary initially could not launch because the host lacked CUPS, Cairo, and Pango shared libraries. The required RPMs were downloaded and extracted under `/tmp`, then supplied through `LD_LIBRARY_PATH` for the passing tests. No system browser or application dependency was changed.

Initial accessibility checks found a few captions just below the contrast threshold and comparison buttons whose accessible names did not include their visible labels. Both issues were fixed before the passing runs. The tests also distinguish the application's error alert from Next.js's empty route-announcement alert.

## Environment and limits

- Node.js 24.22.2; npm 12.2.1.
- Next.js 16.4.3; React 19.3.1; Tailwind/PostCSS plugin 4.3.3.
- Playwright 1.64.1; axe integration 4.14.0.
- Google Chrome for Testing stable 156.0.8078.80, downloaded from Google's official distribution.
- Desktop Chromium at 1440 × 1000; Chromium with iPhone 13 viewport/touch emulation at 390 × 844 CSS pixels.
- Browser automation ran on Linux. No native Windows, Safari, Firefox, physical-device, real assistive-technology, or full manual WCAG audit was performed.
- No live provider data, actual accessibility verification, medical advice, real appointment booking, or production verification workflow is included.
- The app is prepared for Vercel, but no deployment or GitHub repository creation/push has been performed.

Screenshots and browser reports are generated under ignored `test-results/` and `playwright-report/` directories. The latest HTML report corresponds to the complete official Google Chrome run.
