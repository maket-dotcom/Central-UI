import { keyboardHomeConfig } from "./home/home-config"
import CampaignConfig from "./campaign/campaign-config"
import FeatureConfig from "./features/feature-config"
import RemoteConfigConfig from "./remoteConfig/remote-config-config"
import ReleaseConfig from "./releases/release-config"
import TesterConfig from "./testers/tester-config"

/**
 * Feature module routes specific to the Keyboard workspace (including Home dashboard).
 * These are mounted under the shared App shell when a keyboard application is active.
 */
export const keyboardRoutes = [
  keyboardHomeConfig,
  CampaignConfig,
  FeatureConfig,
  RemoteConfigConfig,
  ReleaseConfig,
  TesterConfig,
]

export default keyboardRoutes
