import { apiClient } from './client'
import type { BackendProjectPayload, EnvPair, FrontendProjectPayload } from './types'

export const projectsApi = {
  list: () => apiClient.get('/projects/g'),
  createFrontend: (payload: FrontendProjectPayload) => apiClient.post('/projects/f', payload),
  createBackend: (payload: BackendProjectPayload) => apiClient.post('/projects/b', payload),
  getById: (projectId: string) => apiClient.get(`/projects/${projectId}`),
  getEnv: (projectId: string) => apiClient.get(`/env/${projectId}`),
  updateEnv: (projectId: string, envs: EnvPair[]) =>
    apiClient.patch(`/env/${projectId}`, { envs }),
  rollbackProject: (projectId: string) => apiClient.post('/projects/rollback', projectId),
}


// import { apiClient } from './client'
// import type { BackendProjectPayload, EnvPair, FrontendProjectPayload } from './types'

// export const projectsApi = {
//   list: () => apiClient.get('/projects/g'),
//   createFrontend: (payload: FrontendProjectPayload) => apiClient.post('/projects/f', payload),
//   createBackend: (payload: BackendProjectPayload) => apiClient.post('/projects/b', payload),
//   getById: (projectId: string) => apiClient.get(`/projects/${projectId}`),
//   getEnv: (projectId: string) => apiClient.get(`/env/${projectId}`),
//   updateEnv: (projectId: string, envs: EnvPair[]) =>
//     apiClient.patch(`/env/${projectId}`, { envs }),
//   rollbackProject: (projectId: string) => apiClient.post('/projects/rollback', projectId),
// }
