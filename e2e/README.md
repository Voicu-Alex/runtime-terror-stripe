# Profile browser tests

Run `npm ci`, `npx playwright install chromium`, then `npm run test:e2e`.
The suite starts a local Next.js server on port 3179 and covers desktop and mobile viewports.
To use an installed Edge browser in PowerShell: `$env:PLAYWRIGHT_CHANNEL='msedge'; npm run test:e2e`.

The tests exercise `/profil`, persistence in localStorage, and navigation to `/flux` with fictional data.
Free-text API responses are stubbed to test unrecognized and pending answers deterministically;
the suite does not test the external AI service. No external credentials are needed.
