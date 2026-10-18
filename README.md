# NetLet chat website

Marketing and documentation site for **NetLet chat**, a local network messaging app.
Built with React 19, TypeScript, Vite, React Router and three.js.

## Scripts

| Command            | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Dev server at http://localhost:5173/netlet-site/ |
| `npm run build`    | Type-check and build to `dist/`          |
| `npm run lint`     | Oxlint                                   |
| `npm test`         | Unit and component tests (Vitest)        |
| `npm run coverage` | Tests with coverage report               |

## Structure

- `src/pages` – Home, Features, Use Cases (home / office / events views), User Manual (7 sub-sections), FAQs, Download
- `src/components` – layout, canvas logo (`MeshLogo`), three.js hero (`HeroScene`), SVG diagrams, mock screenshots
- `src/lib` – pure, tested logic (mesh simulation, scene geometry, diagram layouts, hooks)
- `src/data/content.ts` – all marketing and manual copy
- `src/config/site.ts` – **download URLs** (placeholders until the first release is published)

### Replacing manual screenshots

Each manual step renders a stylised mock until a real image is provided. Put the image in
`public/screenshots/` and set `screenshot: '/netlet-site/screenshots/<file>.png'` on the step in `src/data/content.ts`.

## Deployment (GitHub Pages)

- Development happens on `develop`; `.github/workflows/ci.yml` lints, tests and builds it.
- `.github/workflows/deploy.yml` deploys **only** from `main` (a direct commit or a merge into `main`).
- The build copies `index.html` to `404.html` so deep links work on GitHub Pages.
- One-time setup: repository **Settings → Pages → Source: GitHub Actions**.
