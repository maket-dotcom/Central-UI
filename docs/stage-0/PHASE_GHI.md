# Phase G+H+I: Pages + Routing + App Root

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** [Phase E+F](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_EF.md) (Configuration + Components) must be complete  
> **Creates:** `pages/auth/` (login), `pages/appSelection/` (app cards), `pages/apps/keyboard/home/`, `routes/` (router, guards), updated `App.tsx`, updated `main.tsx`

---

## Objective

Build the three core pages (Login, App Selection, Keyboard Home), set up the routing system with auth guards, and wire everything together in `App.tsx` and `main.tsx`.

---

## Part G: Pages

### Task G1: Create Login Page

**File:** `src/pages/auth/login-config.tsx`

Page metadata for the login page.

```tsx
export const loginConfig = {
  title: "Login",
  path: "/login",
};
```

**File:** `src/pages/auth/login.tsx`

Full-screen centered card. User pastes a raw Bearer token and clicks "LogIn". On click, we call `getApps()` using the entered token to verify it. If successful, store the token and navigate to `/apps`.

```tsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/store";
import { useGetApps } from "@/query/useAppInfo";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { appData } from "@/app/appData";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const tokenStore = useAppStore((state) => state.token);
  const { setToken: storeToken } = useAppStore();

  const { refetch, isFetching } = useGetApps({ initialized: false });

  if (tokenStore) {
    return <Navigate to="/apps" replace />;
  }

  const handleLogin = async () => {
    if (!token.trim()) {
      toast.error("Please enter an auth token");
      return;
    }

    // Temporarily set the token so centralInstance picks it up
    storeToken(token.trim());

    // Verify by calling getApps — if token is invalid, API returns 401
    const { isSuccess, error } = await refetch();

    if (isSuccess) {
      toast.success("Login successful");
      navigate("/apps");
    } else {
      useAppStore.getState().clearAuth();
      toast.error(getErrorMessage(error));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{appData.appName}</CardTitle>
          <CardDescription>Enter your auth token to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="token-input">Auth Token</Label>
            <div className="relative">
              <Input
                id="token-input"
                type={showPassword ? "text" : "password"}
                placeholder="Paste your Bearer token here"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isFetching}
                className="pr-10"
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                disabled={isFetching}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
          <Button
            id="login-button"
            className="w-full cursor-pointer"
            onClick={handleLogin}
            disabled={isFetching || !token.trim()}
          >
            {isFetching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying...</span>
              </span>
            ) : (
              "LogIn"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

> [!NOTE]
> The login flow sets the token first, then calls `getApps()`. The `centralInstance` interceptor automatically picks up the token from Zustand and sends it as `Authorization: Bearer <token>`. If the API returns 401/403, the token is cleared.

**Checklist:**
- [x] G1a. Create `src/pages/auth/login-config.tsx`
- [x] G1b. Create `src/pages/auth/login.tsx`

---

### Task G2: Create App Selection Page

**File:** `src/pages/appSelection/app-selection-config.tsx`

```tsx
export const appSelectionConfig = {
  title: "Select App",
  path: "/apps",
};
```

**File:** `src/pages/appSelection/app-selection.tsx`

Grid of clickable app cards. Data comes from `useGetApps()` React Query hook.

```tsx
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/loader";
import { useGetApps } from "@/query/useAppInfo";
import { useAppStore } from "@/store";
import type { SelectedApp } from "@/store/slices/AppSlice";
import { appData } from "@/app/appData";

export default function AppSelectionPage() {
  const navigate = useNavigate();
  const { setSelectedApp } = useAppStore();
  const { data, isLoading, isError, error } = useGetApps();

  const handleSelectApp = (app: SelectedApp) => {
    setSelectedApp(app);
    navigate(`/${app.appName.toLowerCase()}/home`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">
          Failed to load apps: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  const apps: SelectedApp[] = data?.data || [];

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{appData.appName}</h1>
        <p className="mt-2 text-muted-foreground">Select an app to manage</p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {apps.map((app) => (
          <Card
            key={app._id}
            id={`app-card-${app.appName.toLowerCase()}`}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => handleSelectApp(app)}
          >
            <CardHeader>
              <CardTitle>{app.appName}</CardTitle>
              <CardDescription>{app.backendBaseUrl}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant={app.status === "active" ? "default" : "secondary"}>
                {app.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {apps.length === 0 && (
        <p className="mt-8 text-muted-foreground">No apps found.</p>
      )}
    </div>
  );
}
```

> [!NOTE]
> The `data?.data` access pattern matches the expected Central-Backend response shape: `{ data: [...apps], pagination: {...} }`. Adjust if the backend returns a different structure.

**Checklist:**
- [x] G2a. Create `src/pages/appSelection/app-selection-config.tsx`
- [x] G2b. Create `src/pages/appSelection/app-selection.tsx`

---

### Task G3: Create Keyboard Home Page

**File:** `src/pages/apps/keyboard/home/home-config.tsx`

```tsx
export const keyboardHomeConfig = {
  title: "Home",
  path: "/keyboard/home",
};
```

**File:** `src/pages/apps/keyboard/home/home.tsx`

Placeholder dashboard page for the Keyboard app.

```tsx
export default function KeyboardHomePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-2xl font-bold">Welcome to Keyboard Dashboard</h1>
      <p className="text-muted-foreground">
        This is the home page for the Keyboard app. Features will be added in future stages.
      </p>
    </div>
  );
}
```

**Checklist:**
- [x] G3a. Create `src/pages/apps/keyboard/home/home-config.tsx`
- [x] G3b. Create `src/pages/apps/keyboard/home/home.tsx`

---

## Part H: Routing

### Task H1: Create `routes/protected-route.tsx`

**File:** `src/routes/protected-route.tsx`

Guard component that checks if the user has a valid token. Redirects to `/login` if not authenticated.

```tsx
import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAppStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Checklist:**
- [x] H1. Create `src/routes/protected-route.tsx`

---

### Task H2: Create `routes/app-guard.tsx`

**File:** `src/routes/app-guard.tsx`

Guard component that checks if a specific app is selected. Redirects to `/apps` if no app is selected. Also verifies the expected app name matches the selected app.

```tsx
import { useEffect } from "react"
import { Navigate } from "react-router-dom"
import { useAppStore } from "@/store"
import { useGetApps } from "@/query/useAppInfo"
import { Loader2 } from "lucide-react"

interface AppGuardProps {
  children: React.ReactNode
  expectedAppName: string
}

export default function AppGuard({ children, expectedAppName }: AppGuardProps) {
  const selectedApp = useAppStore((state) => state.selectedApp)
  const setSelectedApp = useAppStore((state) => state.setSelectedApp)
  const { data: appsData, isLoading } = useGetApps()

  const appsList: any[] = Array.isArray(appsData?.data?.data)
    ? appsData.data.data
    : Array.isArray(appsData?.data)
      ? appsData.data
      : Array.isArray(appsData)
        ? appsData
        : []

  const foundApp = appsList.find(
    (a: any) => a.appName.toLowerCase() === expectedAppName.toLowerCase()
  )

  useEffect(() => {
    if (!selectedApp && foundApp) {
      setSelectedApp(foundApp)
    }
  }, [selectedApp, foundApp, setSelectedApp])

  if (!selectedApp && (isLoading || foundApp)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!selectedApp) {
    return <Navigate to="/apps" replace />
  }

  if (expectedAppName.toLowerCase() !== selectedApp.appName.toLowerCase()) {
    return <Navigate to={`/${selectedApp.appName.toLowerCase()}/home`} replace />
  }

  return <>{children}</>
}
```

**Checklist:**
- [x] H2. Create `src/routes/app-guard.tsx`

---

### Task H3: Create `routes/router.tsx`

**File:** `src/pages/apps/keyboard/keyboard-routes.tsx`

First, create the app-specific route block for Keyboard to keep `router.tsx` clean.

```tsx
import { keyboardHomeConfig } from "./home/home-config"
import AppGuard from "@/routes/app-guard"
import Layout from "@/components/layout"
import ProtectedRoute from "@/routes/protected-route"
import { Navigate } from "react-router-dom"

export const KeyboardAppRoutes = {
  path: "/keyboard",
  element: (
    <ProtectedRoute>
      <AppGuard expectedAppName="keyboard">
        <Layout />
      </AppGuard>
    </ProtectedRoute>
  ),
  children: [
    // Redirect /keyboard to /keyboard/home
    { index: true, element: <Navigate to="/keyboard/home" replace /> },
    keyboardHomeConfig,
    // Catch-all for unknown /keyboard/* routes
    { path: "*", element: <Navigate to="/keyboard/home" replace /> },
  ],
}
```

**File:** `src/routes/router.tsx`

Central router configuration using `createBrowserRouter` spreading app-specific configs.

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom"
import LoginPage from "@/pages/auth/login"
import AppSelectionPage from "@/pages/appSelection/app-selection"
import ProtectedRoute from "@/routes/protected-route"
import { KeyboardAppRoutes } from "@/pages/apps/keyboard/keyboard-routes"

export const router = createBrowserRouter([
  // Common: Login (no guard)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Common: App Selection (needs token)
  {
    path: "/apps",
    element: (
      <ProtectedRoute>
        <AppSelectionPage />
      </ProtectedRoute>
    ),
  },

  // App-Scoped Routes
  KeyboardAppRoutes,

  // Fallback Redirects
  // If a user navigates to the root URL or an unknown route:
  // - Authenticated users will seamlessly land on the App Selection page.
  // - Unauthenticated users will hit the ProtectedRoute guard on `/apps` and automatically bounce to `/login`.
  { path: "/", element: <Navigate to="/apps" replace /> },
  { path: "*", element: <Navigate to="/apps" replace /> },
])
```

> [!NOTE]
> We use modular app configurations like `KeyboardAppRoutes` to keep `router.tsx` clean. `AppGuard` receives an `expectedAppName` prop, ensuring cross-app routing doesn't conflict.

**Checklist:**
- [x] H3. Create `src/routes/router.tsx`

---

## Part I: App Root

### Task I1: Update `App.tsx`

**File:** `src/App.tsx`

Replace the default Vite content with the router provider.

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "@/routes/router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

**Checklist:**
- [x] I1. Update `src/App.tsx` — replace default content with `RouterProvider`

---

### Task I2: Update `main.tsx`

**File:** `src/main.tsx`

Wrap the app with all required providers: React Query, Theme, and Toast.

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { queryClient } from "@/utils/queryClient";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="central-ui-theme">
        <App />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
```

> [!NOTE]
> The `ThemeProvider` uses `storageKey="central-ui-theme"` to persist the dark/light theme choice in `localStorage` (separate from `localStorage` used for auth). The `Toaster` from `sonner` is placed outside the router so toasts persist across navigations.

**Checklist:**
- [x] I2. Update `src/main.tsx` — add QueryClientProvider, ThemeProvider, Toaster

---

## Final Directory State After Phase G+H+I

```
src/
├── pages/
│   ├── auth/
│   │   ├── login.tsx              # Login page (paste token + verify)
│   │   └── login-config.tsx       # Login page metadata
│   ├── appSelection/
│   │   ├── app-selection.tsx      # App cards grid
│   │   └── app-selection-config.tsx
│   └── apps/
│       └── keyboard/
│           └── home/
│               ├── home.tsx       # Keyboard dashboard placeholder
│               └── home-config.tsx
├── routes/
│   ├── router.tsx                 # createBrowserRouter config
│   ├── protected-route.tsx        # Auth guard (needs token)
│   └── app-guard.tsx              # App guard (needs selectedApp)
├── App.tsx                        # RouterProvider
└── main.tsx                       # Root providers (Query, Theme, Toast)
```

---

## Summary Checklist

```
Phase G: Pages
  [x] G1. Create pages/auth/login.tsx + login-config.tsx
  [x] G2. Create pages/appSelection/app-selection.tsx + app-selection-config.tsx
  [x] G3. Create pages/apps/keyboard/home/home.tsx + home-config.tsx

Phase H: Routing
  [x] H1. Create routes/protected-route.tsx
  [x] H2. Create routes/app-guard.tsx
  [x] H3. Create routes/router.tsx

Phase I: App Root
  [x] I1. Update App.tsx (RouterProvider)
  [x] I2. Update main.tsx (QueryClientProvider, ThemeProvider, Toaster)
```

> **Next Phase:** [Phase J: Verification](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_J.md)

