import { apiClient } from './client'

export type LogsLimit = 500 | 1000 | 2500 | 5000;

const loggerServiceUrl = (import.meta.env.VITE_LOGS_STREAM_BASE_URL ?? 'http://localhost:8007/api/v1').replace(/\/$/, '')

export const logsApi = {
  getBuildLogs: (deploymentId: string) => apiClient.get(`/b/logs/${deploymentId}`),
  getBuildStreamUrl: (deploymentId: string) => `${loggerServiceUrl}/logs/${encodeURIComponent(deploymentId)}/stream`,
  getBuildStaticUrl: (deploymentId: string) => `${loggerServiceUrl}/logs/${encodeURIComponent(deploymentId)}/static`,
  getLogs: (deploymentId: string, params: { limit: LogsLimit; cursor?: string }) =>
    apiClient.get(`/logs/${deploymentId}`, { params }),
  getStreamUrl: (deploymentId: string) => `${loggerServiceUrl}/logs/${encodeURIComponent(deploymentId)}/stream`,
  getStaticLogs: (deploymentId: string, value: number) =>
    apiClient.get(`${loggerServiceUrl}/logs/${encodeURIComponent(deploymentId)}/static`, { params: { value } }),
}
