const getRequiredEnv = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export const env = {
  apiBaseUrl: getRequiredEnv('VITE_VEREN_API_BASE_URL', import.meta.env.VITE_VEREN_API_BASE_URL),
  logsStreamBaseUrl: getRequiredEnv('VITE_VEREN_LOGS_STREAM_BASE_URL', import.meta.env.VITE_VEREN_LOGS_STREAM_BASE_URL),
  authRefreshEndpoint: getRequiredEnv('VITE_VEREN_AUTH_REFRESH_ENDPOINT', import.meta.env.VITE_VEREN_AUTH_REFRESH_ENDPOINT),
}
