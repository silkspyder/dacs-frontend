# Digital Access Catalogue System (DACS) — Frontend

React + TypeScript frontend for the Digital Access Catalogue System.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- pnpm

## Requirements

- Node.js
- pnpm (`npm install -g pnpm`)

## Setup

### 1. Install dependencies

```
pnpm install
```

### 2. Configure the API URL

Edit `src/app/api/apiClient.ts` and set the backend URL to your Render deployment:

```typescript
const BASE_URL = 'https://dacs-backend.onrender.com/api';
```

Use `http://localhost:8080/api` for local development.

### 3. Run in development

```
pnpm dev
```

The app will be available at `http://localhost:5173`.

## Building for Deployment

```
pnpm build
```

This generates a `dist/` folder containing plain HTML, CSS, and JS files.

## Deployment (Vercel)

The frontend is deployed on **Vercel** as a static site.

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Set the following in Vercel's project settings:
    - **Framework Preset:** Vite
    - **Build Command:** `pnpm build`
    - **Output Directory:** `dist`
4. Deploy — Vercel builds and hosts it automatically

The live app will be available at your Vercel-provided URL (e.g. `https://dacs.vercel.app`).

## User Roles

| Role | Access |
|---|---|
| Admin | Full access — users, books, students, issue, return, fines, records |
| Librarian | Books, students, issue, return, fines, records, borrow requests |
| Student | Book catalog, my books, my history, borrow requests |

## Project Structure

```
src/
  app/
    api/          — API client and base URL config
    components/   — All page components
    context/      — Auth and Theme context
    data/         — mockData.ts (data layer / DataStore)
  styles/         — Global CSS and Tailwind config
```

## Authors
Aaron James Monte Siat  
Github: `https://github.com/silkspyder`

Enzo Gabriel Longcob