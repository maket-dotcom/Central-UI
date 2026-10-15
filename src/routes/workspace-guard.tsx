import { Outlet, Navigate, useParams } from "react-router-dom"
import { useAppStore } from "@/store"
import { getAppRoute } from "@/configurations/appRegistry"

interface WorkspaceGuardProps {
  /** Expected workspace key (e.g. "keyboard", "wallpaper") */
  workspace: string
}

/**
 * Route protection guard for workspace-specific child modules.
 * Prevents cross-app module access (e.g. accessing keyboard features on a wallpaper app).
 * If the current active app does not match the expected workspace, redirects to that app's home dashboard.
 */
export function WorkspaceGuard({ workspace }: WorkspaceGuardProps) {
  const { appName } = useParams<{ appName: string }>()
  const selectedApp = useAppStore((state) => state.selectedApp)
  const currentWorkspace = getAppRoute(selectedApp?.appName)

  if (currentWorkspace !== workspace) {
    return <Navigate to={`/${appName}/home`} replace />
  }

  return <Outlet />
}

export default WorkspaceGuard
