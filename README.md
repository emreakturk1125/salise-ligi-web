# Salise Ligi

A football-themed simulation mini-game that runs entirely in the browser. Built with TypeScript, Lit Web Components, and Vite.

## Features

- **Single Player (Bot)** — Play against an AI opponent
- **2 Players** — Two players share the same screen/keyboard
- **Multi-language** — Turkish, English, German, Spanish, Arabic
- **Sound Effects** — WebAudio-based match sounds (crowd, whistle, kick, goal)
- **Responsive UI** — Works on desktop and mobile browsers

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI / Components | TypeScript + [Lit](https://lit.dev/) (Web Components) |
| Build | [Vite](https://vitejs.dev/) |
| MCP Tools | [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) + [Zod](https://zod.dev/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The output is written to the `dist/` directory, ready to be deployed to any static hosting provider.

## Project Structure

```
├── index.html          # Entry HTML
├── index.tsx           # App bootstrap & audio engine
├── index.css           # Global styles
├── playground.ts       # Main game component (UI, state, game logic)
├── mcp_maps_server.ts  # MCP tool server (score, cards, theme control)
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── public/
│   └── fonts/          # Local font files
└── docs/               # Documentation pages
```

### Key Files

- **playground.ts** — The core `LitElement` component containing game modes (BOT / LOCAL_2P), match state, timer logic, UI rendering, and multi-language dictionaries.
- **index.tsx** — Application entry point. Sets up the `requestAnimationFrame` timer engine, WebAudio sound effects, and mounts the Playground component. (Despite the `.tsx` extension, there is no React dependency.)
- **mcp_maps_server.ts** — An MCP server exposing tools for score updates, card events, match time control, and theme switching via Zod-validated schemas.

## Deployment

The production build (`dist/`) is a fully static site. Deploy it to any web hosting service:

- **Vercel** — `vercel --prod`
- **Netlify** — drag & drop the `dist/` folder or connect your repo
- **GitHub Pages** — push `dist/` contents to a `gh-pages` branch
- **Firebase Hosting** — `firebase deploy`
- **Any static server** — serve the `dist/` folder

## License

All rights reserved.

