import { initApiClient, apiClient } from './client'
import { configureTokenStore, tokenStore } from './tokenStore'
import type { ApiInitOptions, TokenPair } from './types'
import { authApi } from './auth.api'
import { projectsApi } from './projects.api'
import { deploymentApi } from './deployment.api'
import { logsApi } from './logs.api'
import { repoApi } from './repo.api'
import { healthApi } from './health.api'
import { unwrapApiResponse } from './response'

export const initializeApi = (options: ApiInitOptions) => {
  configureTokenStore({
    accessTokenKey: options.accessTokenKey,
    refreshTokenKey: options.refreshTokenKey,
  })

  initApiClient(options)
}

export const authTokens = {
  getAccessToken: tokenStore.getAccessToken,
  getRefreshToken: tokenStore.getRefreshToken,
  set: (tokens: TokenPair) => tokenStore.setTokens(tokens),
  clear: () => tokenStore.clearTokens(),
}

export { apiClient }
export { authApi, projectsApi, deploymentApi, logsApi, repoApi, healthApi, unwrapApiResponse }
export type {
  ApiInitOptions,
  TokenPair,
  ApiResponse,
  EnvPair,
  FrontendProjectPayload,
  BackendProjectPayload,
  ProjectType,
} from './types'
