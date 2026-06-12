import { apiClient } from './client'

export const healthApi = {
  check: () => apiClient.get('/healthcheck'),
}
