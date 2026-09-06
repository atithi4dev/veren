import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import { tokenStore } from './tokenStore'
import type { ApiInitOptions, RetriableRequestConfig } from './types'

const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

let isInitialized = false
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

let apiOptions: Required<Omit<ApiInitOptions, 'baseURL' | 'onAuthFailure'>> & {
  baseURL: string
  onAuthFailure?: () => void
} = {
  baseURL: '',
  refreshEndpoint: '',
  withCredentials: true,
  accessTokenKey: 'accessToken',
  refreshTokenKey: 'refreshToken',
  getRefreshPayload: () => ({}),
  mapRefreshResponse: (data: unknown) => {
    if (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      typeof data.data === 'object' &&
      data.data !== null &&
      'newAccessToken' in data.data &&
      'newRefreshToken' in data.data
    ) {
      const tokenData = data.data as {
        newAccessToken: string
        newRefreshToken: string
      }
      return {
        accessToken: tokenData.newAccessToken,
        refreshToken: tokenData.newRefreshToken,
      }
    }

    return null
  },
}

const setAuthHeader = (config: InternalAxiosRequestConfig, token: string) => {
  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', `Bearer ${token}`)
  config.headers = headers
}

const refreshAccessToken = async (): Promise<boolean> => {

  try {
    const response = await apiClient.post(
      apiOptions.refreshEndpoint,
      apiOptions.getRefreshPayload(),
    )

    const tokens = apiOptions.mapRefreshResponse(response.data)

    if (!tokens) {
      return true
    }

    tokenStore.setTokens(tokens)
    return true
  } catch {
    tokenStore.clearTokens()
    apiOptions.onAuthFailure?.()
    return false
  }
}

const setupInterceptors = () => {
  apiClient.interceptors.request.use((config) => {
    const accessToken = tokenStore.getAccessToken()

    if (accessToken) {
      setAuthHeader(config, accessToken)
    }

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & RetriableRequestConfig)
        | undefined

      if (!originalRequest || originalRequest._retry || error.response?.status !== 401) {
        return Promise.reject(error)
      }

      if (originalRequest.url?.includes(apiOptions.refreshEndpoint)) {
        tokenStore.clearTokens()
        apiOptions.onAuthFailure?.()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false
        })
      }

      const refreshSucceeded = await refreshPromise

      if (!refreshSucceeded) {
        return Promise.reject(error)
      }

      const currentAccessToken = tokenStore.getAccessToken()
      if (currentAccessToken) {
        setAuthHeader(originalRequest, currentAccessToken)
      }

      return apiClient(originalRequest)
    },
  )
}

export const initApiClient = (options: ApiInitOptions) => {
  apiOptions = {
    ...apiOptions,
    ...options,
  }

  apiClient.defaults.baseURL = apiOptions.baseURL
  apiClient.defaults.withCredentials = apiOptions.withCredentials

  if (!isInitialized) {
    setupInterceptors()
    isInitialized = true
  }
}

export { apiClient }
