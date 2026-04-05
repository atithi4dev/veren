import { apiClient } from './client'

export const authApi = {
  me: async () => {
    const response = await apiClient.get('/auth/me')
    console.log('[authApi.me] /auth/me response:', response.data)
    return response
  },
  refresh: () => apiClient.post('/auth/refresh-token', {}),
  logout: () => apiClient.get('/auth/logout'),
  loginRedirect: (apiOrigin: string) => {
    window.location.href = `${apiOrigin}/api/v1/auth/login`
  },
}
