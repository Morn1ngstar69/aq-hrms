# Visual interface preview

Start with `index.html` to see the actual HTML/CSS interface. Open it in a browser directly, or right-click it in VS Code and choose **Open with Live Server**.

No npm packages, API credentials, internet connection or database are needed. The sample accounts are `admin`, `hr`, `employee` and `accountant`, all with password `demo123`. Click a demo account tile on the login screen to enter instantly.

You can switch between Admin / HR, Employee and Accountant from the top-right role selector without logging out. Most data actions update the preview and the related screens during the browser session. Use **Reset Demo Data** in the Admin sidebar to return to the original data.

For an alternative local static server using only Node.js:

```bash
npm run preview:html
```

Navigate to `http://127.0.0.1:4173`.

Files:

- `index.html`: UI entry page.
- `styles.css`: standalone CSS including the design system used by Next.js.
- `preview.js`: client-side interactions and view rendering.
- `demo-data.js`: bundled demonstration records from `lib/seed.js`.
- `serve.mjs`: optional static HTTP server without third-party packages.

The preview is a visual walkthrough, not a substitute for the Next.js application. The shown QR pattern is a decorative placeholder. The Next.js project generates an actual QR token.
