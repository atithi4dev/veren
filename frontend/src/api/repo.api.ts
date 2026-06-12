import { apiClient } from './client'

export const repoApi = {
  listMine: () => apiClient.get('/repo/getrepo'),
  find: (query: string) => apiClient.get('/repo/find', { params: { query } }),
}
