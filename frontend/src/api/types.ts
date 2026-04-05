export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type ApiInitOptions = {
  baseURL: string
  refreshEndpoint?: string
  withCredentials?: boolean
  accessTokenKey?: string
  refreshTokenKey?: string
  getRefreshPayload?: () => unknown
  mapRefreshResponse?: (data: unknown) => TokenPair | null
  onAuthFailure?: () => void
}

export type ApiResponse<T> = {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export type EnvPair = {
  key: string
  value: string
}

export type ProjectType = 'frontend' | 'backend'

export type FrontendProjectPayload = {
  projectName: string
  gitUrl: string
  branch: string
  entryDirectory: string
  installCommand: string
  buildCommand: string
  buildOutDirectory: string
  version: string
}

export type BackendProjectPayload = {
  projectName: string
  gitUrl: string
  branch: string
  entryDirectory: string
  installCommand: string
  runCommand: string
  version: string
}

export type AuthTokensStore = {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (tokens: TokenPair) => void
  clearTokens: () => void
}

export type RetriableRequestConfig = {
  _retry?: boolean
  headers?: Record<string, string>
}
