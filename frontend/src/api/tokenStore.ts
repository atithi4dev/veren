import type { AuthTokensStore, TokenPair } from './types'

let accessTokenKey = 'accessToken'
let refreshTokenKey = 'refreshToken'

const isBrowser = typeof window !== 'undefined'

const getStorage = (): Storage | null => {
  if (!isBrowser) {
    return null
  }

  return window.localStorage
}

export const configureTokenStore = (options: {
  accessTokenKey?: string
  refreshTokenKey?: string
}) => {
  accessTokenKey = options.accessTokenKey ?? accessTokenKey
  refreshTokenKey = options.refreshTokenKey ?? refreshTokenKey
}

export const tokenStore: AuthTokensStore = {
  getAccessToken: () => {
    const storage = getStorage()
    return storage?.getItem(accessTokenKey) ?? null
  },
  getRefreshToken: () => {
    const storage = getStorage()
    return storage?.getItem(refreshTokenKey) ?? null
  },
  setTokens: (tokens: TokenPair) => {
    const storage = getStorage()

    if (!storage) {
      return
    }

    storage.setItem(accessTokenKey, tokens.accessToken)
    storage.setItem(refreshTokenKey, tokens.refreshToken)
  },
  clearTokens: () => {
    const storage = getStorage()

    if (!storage) {
      return
    }

    storage.removeItem(accessTokenKey)
    storage.removeItem(refreshTokenKey)
  },
}
