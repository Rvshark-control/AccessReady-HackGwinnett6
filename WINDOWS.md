# AccessReady on Windows and Google Chrome

AccessReady is a web application intended to run in Google Chrome on Windows. The development workspace happens to use Linux; this is not a Linux desktop application.

## View the running workspace preview

Open **Ports → 3100 → Open in Browser** from the workspace in your Windows Chrome browser. The URL ends in `/ports/3100/`. You do not need Node.js, WSL, Docker, or Linux to view this preview.

After an update, press **Ctrl+Shift+R** to reload the page and its assets.

The preview server accounts for the workspace removing `/ports/3100` before forwarding requests. Both the browser-facing URLs and the internal requests resolve to the same CSS, fonts, JavaScript, pages, and APIs.

## Run locally on Windows

1. Install Node.js 22 LTS or 24 LTS for Windows.
2. Extract the source archive into a folder of your choice.
3. Open PowerShell in the extracted folder containing `package.json`.

```powershell
npm ci
npm run dev
```

Open **http://localhost:3000** in Google Chrome.

For a production build:

```powershell
npm run build
npm run start
```

If port 3000 is occupied, use `npm run start -- --port 3100` and open **http://localhost:3100**.

Use `npm run dev` or `npm run start` for ordinary local Windows use. The `preview:ports` command specifically serves the browser path required by this hosted workspace.

## Verify with native Windows Chrome

In PowerShell, from the project folder:

```powershell
npm run typecheck
npm test
npm run build
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
npm run test:e2e
```

Adjust the executable path if Chrome is installed elsewhere. Keep port 3100 free while this suite runs, or set `$env:PLAYWRIGHT_PORT = "3101"` to select another port.

The browser tests check real stylesheet responses, rendered Tailwind colors and layout, local fonts, mobile layouts, accessibility, API requests, matching, details, comparison, filters, error recovery, and keyboard navigation. They use temporary browser profiles.

## Coverage

See [VERIFICATION.md](VERIFICATION.md) for the checks actually performed. Google Chrome can be tested on the available Linux host, but native Windows execution requires a Windows host and is not claimed by those results.
