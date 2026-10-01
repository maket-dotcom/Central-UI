# Phase A: Scaffolding + Environment

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** None (first phase)  
> **Creates:** Vite+React+TS project, npm dependencies, environment files, path alias config

---

## Objective

Initialize the Central-UI project from scratch using the shadcn preset, install all required runtime and dev dependencies, set up environment variables, and verify the `@/` path alias is configured correctly in `vite.config.ts` and `tsconfig.json`.

---

## Task 1: Scaffold Project with shadcn Preset

**Command:**
```bash
npx shadcn@latest init --preset b7Br7G7Ci --template vite --pointer
```

> [!NOTE]
> Run this command from inside `d:\project\central\Central-UI\`. The `--preset b7Br7G7Ci` preset applies a pre-configured shadcn theme. The `--template vite` uses Vite+React+TS as the bundler. The `--pointer` flag uses pointer-style cursor.

**Expected output:**
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json` generated
- `src/` directory with `App.tsx`, `main.tsx`, `index.css`, `App.css`
- `components.json` (shadcn config)
- `src/components/ui/` directory (shadcn auto-managed)
- `src/lib/utils.ts` (shadcn utility — `cn()` function)

**Checklist:**
- [x] A1. Run `npx shadcn@latest init --preset b7Br7G7Ci --template vite --pointer`
- [x] Verify `src/` directory exists with initial files
- [x] Verify `components.json` exists at project root

---

## Task 2: Install Runtime Dependencies

**Command:**
```bash
npm i zustand @tanstack/react-query axios zod sonner react-router react-router-dom @tabler/icons-react
```

**Package purposes:**

| Package | Purpose |
|---------|---------|
| `zustand` | Lightweight global state management (slices pattern) |
| `@tanstack/react-query` | Server state management, caching, refetching |
| `axios` | HTTP client (dual-instance architecture) |
| `zod` | Schema validation for API responses & forms |
| `sonner` | Toast notification system |
| `react-router` + `react-router-dom` | Client-side routing with `createBrowserRouter` |
| `@tabler/icons-react` | Icon library for sidebar and UI elements |

**Checklist:**
- [x] A2. Run `npm i zustand @tanstack/react-query axios zod sonner react-router react-router-dom @tabler/icons-react`
- [x] Verify all packages appear in `package.json` under `dependencies`

---

## Task 3: Install Dev Dependencies

**Command:**
```bash
npm i -D @types/react-router-dom @types/node
```

**Checklist:**
- [x] A3. Run `npm i -D @types/react-router-dom @types/node`
- [x] Verify packages appear under `devDependencies`

---

## Task 4: Create Environment Files

**File: `.env`**
```env
VITE_SERVER_URL=http://localhost:3000
```

**File: `.env.example`**
```env
VITE_SERVER_URL=http://localhost:3000
```

> [!IMPORTANT]
> `VITE_SERVER_URL` points to **Central-Backend only**. App-specific backend URLs come dynamically from the `selectedApp.backendBaseUrl` stored in Zustand — they are never hardcoded in env.

**Checklist:**
- [x] A4. Create `.env` at project root with `VITE_SERVER_URL=http://localhost:3000`
- [x] A5. Create `.env.example` with the same content
- [x] Add `.env` to `.gitignore` (if not already present)

---

## Task 5: Verify Path Alias Configuration

After scaffolding, verify that the `@/` path alias is properly configured. shadcn's Vite template typically sets this up, but confirm:

**Expected in `vite.config.ts`:**
```ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Expected in `tsconfig.json` (or `tsconfig.app.json`):**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Checklist:**
- [x] A6. Verify `@/` alias exists in `vite.config.ts` → `resolve.alias`
- [x] A7. Verify `@/*` path mapping exists in `tsconfig.json` or `tsconfig.app.json`
- [x] If missing, add them manually

---

## Task 6: Verify Dev Server Starts

**Command:**
```bash
npm run dev
```

**Checklist:**
- [x] A8. Run `npm run dev` — confirm it starts without errors
- [x] Confirm browser shows default Vite+React page at `http://localhost:5173`
- [x] Stop the dev server after verification

---

## Summary Checklist

```
Phase A: Scaffolding + Environment
  ☑ A1. Run shadcn init command
  ☑ A2. Install runtime npm packages
  ☑ A3. Install dev npm packages
  ☑ A4. Create .env
  ☑ A5. Create .env.example
  ☑ A6. Verify vite.config.ts path alias (@/)
  ☑ A7. Verify tsconfig path mapping (@/*)
  ☑ A8. Run dev server to confirm setup works
```

> **Next Phase:** [Phase B: API Layer](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_B.md)
