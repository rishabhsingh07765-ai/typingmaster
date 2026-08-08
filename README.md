# TypeMaster

A complete typing-learning platform: 30-day course, practice, timed tests, typing games,
progress charts, achievements, profile, and settings — built with React + Vite.

## Project structure

```
typemaster-project/
├── index.html            # Vite entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.jsx           # React entry point, mounts <TypeMasterApp />
│   ├── index.css          # Tailwind directives + minimal reset
│   └── TypeMaster.jsx     # The full TypeMaster application (unchanged)
└── .gitignore
```

## Run locally

```bash
npm install
npm run dev
```

This starts a local dev server (Vite will print the URL, typically `http://localhost:5173`).

## Production build

```bash
npm run build
```

This creates an optimized static build in the `dist/` folder.

To preview the production build locally before deploying:

```bash
npm run preview
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repository.
3. Vercel auto-detects the Vite framework preset:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**. No environment variables are required.

Alternatively, deploy directly from your machine with the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Notes

- All app state (course progress, test history, achievements, settings, etc.) currently lives
  in React state in memory for the running session and resets on a full page reload, since no
  persistence layer is wired up yet. If you want it to survive refreshes, a `localStorage`
  layer can be added to `src/TypeMaster.jsx` without touching anything else in this project
  scaffold.
- The app's visual design is implemented as a single injected `<style>` block inside
  `TypeMaster.jsx` (not Tailwind utility classes). Tailwind is wired into the build in case
  you want to use its utilities for future additions, but it isn't required for the existing UI.
