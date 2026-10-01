import { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAppStore } from "@/store"
import { useGetApps } from "@/query/useAppInfo"
import { getErrorMessage } from "@/utils/getErrorMessage"
import { appData } from "@/app/appData"

/**
 * Authentication login page.
 * Prompts the user to enter a Bearer token and verifies it against Central-Backend
 * via the getApps endpoint before storing it and granting entry to the app catalog.
 */
export default function LoginPage() {
  const [token, setToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const tokenStore = useAppStore((state) => state.token)
  const setTokenStore = useAppStore((state) => state.setToken)
  const clearAuth = useAppStore((state) => state.clearAuth)

  // Disabled on mount; only fires via refetch() after user submits a token
  const { refetch, isFetching } = useGetApps({ initialized: false })

  // If already authenticated, skip login and go to app selection
  // MUST be below all hooks to satisfy Rules of Hooks
  if (tokenStore) {
    return <Navigate to="/apps" replace />
  }

  // Authenticate user with provided token
  const handleLogin = async () => {
    const trimmedToken = token.trim()
    if (!trimmedToken) {
      toast.error("Please enter an auth token")
      return
    }

    // Set token before refetch so centralInstance request interceptor attaches it
    setTokenStore(trimmedToken)

    // Verify token by fetching apps through React Query; refetch() returns the query result
    const { isSuccess, error } = await refetch()
    if (isSuccess) {
      toast.success("Login successful")
      navigate("/apps")
    } else {
      // Clear token since verification failed
      clearAuth()
      toast.error(getErrorMessage(error))
    }
  }

  // Allow form submission on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {appData.appName}
          </CardTitle>
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
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
          </div>
          <Button
            id="login-button"
            className="w-full cursor-pointer"
            onClick={handleLogin}
            disabled={isFetching}
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
  )
}
