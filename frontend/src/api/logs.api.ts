import { apiClient } from './client'
import { env } from '../config/env'

export type LogsLimit = 500 | 1000 | 2500 | 5000;

const loggerServiceUrl = env.logsStreamBaseUrl.replace(/\/$/, '')

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
