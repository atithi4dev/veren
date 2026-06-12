import { apiClient } from './client'

export const deploymentApi = {
  trigger: (projectId: string) => apiClient.get(`/deployment/${projectId}`),
  deploy: (projectId: string) => apiClient.get(`/deployment/deploy/${projectId}`),
  listAll: () => apiClient.get('/deployment'),
  listByProject: (projectId: string) => apiClient.get('/deployment', { params: { projectId } }),
}
