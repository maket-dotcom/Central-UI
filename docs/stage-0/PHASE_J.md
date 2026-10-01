# Phase J: Verification

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** [Phase G+H+I](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_GHI.md) (Pages + Routing + App Root) must be complete  
> **Creates:** No new files — testing & validation only

---

## Objective

Verify the complete Stage 0 implementation works end-to-end: dev server starts cleanly, the login → app selection → keyboard dashboard flow functions correctly, the dynamic sidebar renders per-app configs, auth guards redirect properly, and session persistence works across page reloads.

---

## Task J1: Dev Server Startup

**Command:**
```bash
npm run dev
```

**Verify:**
- [x] J1a. Dev server starts without TypeScript errors
- [x] J1b. Dev server starts without Vite build errors
- [x] J1c. No console warnings about missing imports or undefined components
- [x] J1d. Browser opens at `http://localhost:5173`

---

## Task J2: Login Flow

**Prerequisites:** Central-Backend must be running at `http://localhost:3000` (or whatever `VITE_SERVER_URL` is set to).

**Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Open `http://localhost:5173` | Redirects to `/login` (fallback route) |
| 2 | See login page | Centered card with "Central" title, token input, "LogIn" button |
| 3 | Click "LogIn" with empty input | Toast: "Please enter an auth token" |
| 4 | Paste an **invalid** token, click "LogIn" | Toast shows error message from API (e.g., "Unauthorized") |
| 5 | Paste a **valid** token, click "LogIn" | Toast: "Login successful", navigates to `/apps` |
| 6 | Check `localStorage` (DevTools → Application → Session Storage) | `token` key exists with the entered value |

**Checklist:**
- [x] J2a. Landing page redirects to `/login`
- [x] J2b. Empty token shows validation toast
- [x] J2c. Invalid token shows API error toast
- [x] J2d. Valid token → success toast → navigates to `/apps`
- [x] J2e. Token stored in `localStorage`

---

## Task J3: App Selection → Keyboard Dashboard

**Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On `/apps` page | Grid of app cards rendered from API response |
| 2 | Click a "Keyboard" app card | Navigates to `/keyboard/home` |
| 3 | Check Zustand state implicitly | App loads successfully |
| 4 | See Keyboard dashboard | Layout shell with sidebar + header + "Welcome to Keyboard Dashboard" content |

**Checklist:**
- [x] J3a. `/apps` page shows app cards from API
- [x] J3b. Clicking a card navigates to `/:appName/home`
- [x] J3c. `selectedApp` stored in memory (Zustand)
- [x] J3d. Dashboard layout renders correctly (sidebar + header + content)

---

## Task J4: Dynamic Sidebar

**Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | On `/keyboard/home` | Sidebar shows "Home" menu item (from `keyboard.ts` config) |
| 2 | "Home" item is active/highlighted | Active state indicated visually |
| 3 | Click "Home" in sidebar | Stays on `/keyboard/home` (already active) |

**Checklist:**
- [x] J4a. Sidebar renders items from `configurations/apps/keyboard.ts`
- [x] J4b. Active item is visually highlighted
- [x] J4c. Sidebar navigation works

---

## Task J5: Auth Guard (401/403 Redirect)

**Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | While logged in, manually clear `localStorage` via DevTools | — |
| 2 | Reload the page | Redirects to `/login` (ProtectedRoute guard) |
| 3 | Try navigating directly to `/apps` via URL bar | Redirects to `/login` |
| 4 | Try navigating directly to `/keyboard/home` via URL bar | Redirects to `/login` |

**Checklist:**
- [x] J5a. Clearing session → reload → redirects to `/login`
- [x] J5b. Direct URL to `/apps` without token → redirects to `/login`
- [x] J5c. Direct URL to `/keyboard/home` without token → redirects to `/login`

---

## Task J6: Session Persistence (Reload Survival)

**Steps:**

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Log in with valid token | On `/apps` page |
| 2 | Select Keyboard app | On `/keyboard/home` |
| 3 | Press F5 (hard reload) | Still on `/keyboard/home` (token rehydrated from `localStorage`, selectedApp fetched via API) |
| 4 | Navigate to `/apps` | App selection page loads (token still valid) |
| 5 | Open a new tab, go to `http://localhost:5173/keyboard/home` | Dashboard loads correctly (auth token works, selected app fetched via API per tab) |

**Checklist:**
- [x] J6a. Page reload preserves auth state (stays authenticated)
- [x] J6b. Page reload preserves selected app via API fetch (stays on correct dashboard)
- [x] J6c. New tab allows independent app selection

---

## Task J7: Theme Toggle

| Step | Action | Expected Result |
|------|--------|----------------|
| 1 | Click the theme toggle (sun/moon icon) in the header | Theme switches between dark and light |
| 2 | Reload the page | Theme preference persists (stored in `localStorage` under `central-ui-theme`) |

**Checklist:**
- [x] J7a. Theme toggle works
- [x] J7b. Theme persists across reloads

---

## Summary Checklist

```
Phase J: Verification
  [x] J1. Dev server starts without errors
  [x] J2. Login flow (empty/invalid/valid token)
  [x] J3. App selection → keyboard dashboard navigation
  [x] J4. Dynamic sidebar renders per-app config
  [x] J5. Auth guard redirects (401/403 / cleared session)
  [x] J6. Session persistence (reload survival + new tab isolation)
  [x] J7. Theme toggle works and persists
```

---

## Stage 0 Complete ✅

Once all Phase J checks pass, Stage 0 is complete. The project is scaffolded with:
- ✅ Dual-instance API layer (central + app-specific)
- ✅ Zustand store with app-scoped slices pattern
- ✅ Service-Query layer with React Query
- ✅ Dynamic sidebar via per-app config registry
- ✅ Auth flow with localStorage persistence
- ✅ Reusable components from Adsshare
- ✅ Dark/Light theme support

**Next:** Stage 1 will focus on building actual Keyboard app features (themes, settings, etc.) using the architecture established here.
