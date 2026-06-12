# Backend Connection Documentation

## Overview

This frontend application is built with **React + TypeScript + Vite** and communicates with a backend API using **Axios** as the HTTP client. The backend connection is configured with:

- **Base URL**: `http://localhost:8001/api/v1` (default, configurable via `VITE_API_BASE_URL`)
- **Authentication**: Bearer token-based authentication with JWT refresh token flow
- **Token Storage**: Browser's localStorage
- **Interceptors**: Automatic token refresh and error handling

---

## Architecture

```
src/api/
├── client.ts              # Axios instance, interceptors setup
├── auth.api.ts           # Authentication endpoints
├── projects.api.ts       # Project management endpoints
├── deployment.api.ts     # Deployment endpoints
├── logs.api.ts           # Logs/logging endpoints
├── health.api.ts         # Health check endpoint
├── repo.api.ts           # Repository endpoints
├── tokenStore.ts         # Token management (localStorage)
├── types.ts              # TypeScript type definitions
├── response.ts           # Response unwrapping utility
└── index.ts              # Main API export file
```

---

## HTTP Client Setup

### Axios Instance Configuration

The Axios client is created in [src/api/client.ts](src/api/client.ts) with:

```typescript
const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})
```

### Dynamic Base URL Configuration

When the application starts (in [src/main.tsx](src/main.tsx)), the API client is initialized:

```typescript
initializeApi({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1',
  refreshEndpoint: '/auth/refresh-token',
  withCredentials: true,
})
```

**Configuration Options:**
- `baseURL`: Backend API base URL (defaults to `http://localhost:8001/api/v1`)
- `refreshEndpoint`: Token refresh endpoint (defaults to `/auth/refresh-token`)
- `withCredentials`: Enables sending cookies with requests (set to `true`)
- `accessTokenKey`: localStorage key for access token (defaults to `'accessToken'`)
- `refreshTokenKey`: localStorage key for refresh token (defaults to `'refreshToken'`)

---

## Authentication & Token Management

### Token Storage

Tokens are stored in browser's **localStorage** using [src/api/tokenStore.ts](src/api/tokenStore.ts):

```typescript
interface AuthTokensStore {
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
  setTokens: (tokens: TokenPair) => void
  clearTokens: () => void
}
```

**Token Keys:**
- `accessToken`: JWT access token for API requests
- `refreshToken`: Token used to refresh the access token

### Token Lifecycle

1. **Login**: User redirected to backend login endpoint
   ```typescript
   authApi.loginRedirect(`${apiOrigin}`) 
   // Redirects to: /api/v1/auth/login
   ```

2. **Storage**: Tokens received and stored in localStorage

3. **Auto-Refresh**: When access token expires (401 response), the client automatically:
   - Calls `/auth/refresh-token` endpoint
   - Gets new tokens from backend
   - Retries the original request
   - If refresh fails, clears tokens and calls `onAuthFailure` callback

4. **Logout**: Clears tokens from storage
   ```typescript
   authApi.logout() // GET /auth/logout
   ```

---

## Request & Response Interceptors

### Request Interceptor

Automatically adds Bearer token to all requests:

```typescript
// Before sending any request:
apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStore.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})
```

### Response Interceptor

Handles 401 errors with automatic token refresh:

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // On 401 error:
    // 1. Check if already retried
    // 2. If refresh endpoint, clear tokens
    // 3. Otherwise, attempt to refresh token
    // 4. Retry original request with new token
  }
)
```

**Token Refresh Strategy:**
- Prevents multiple simultaneous refresh requests using `isRefreshing` flag
- Uses Promise queue pattern to handle race conditions
- Retries failed requests with new token after successful refresh
- Logs out user if refresh fails

---

## API Endpoints

All endpoints are organized in separate API modules:

### Authentication Endpoints ([src/api/auth.api.ts](src/api/auth.api.ts))

```typescript
authApi.me()              // GET  /auth/me
authApi.refresh()         // POST /auth/refresh-token
authApi.logout()          // GET  /auth/logout
authApi.loginRedirect()   // Redirects browser to login page
```

### Projects Endpoints ([src/api/projects.api.ts](src/api/projects.api.ts))

```typescript
projectsApi.list()                          // GET    /projects/g
projectsApi.createFrontend(payload)         // POST   /projects/f
projectsApi.createBackend(payload)          // POST   /projects/b
projectsApi.getById(projectId)              // GET    /projects/{projectId}
projectsApi.updateEnv(projectId, envs)      // PATCH  /projects/{projectId}/env
```

**Frontend Project Payload:**
```typescript
{
  projectName: string
  gitUrl: string
  branch: string
  entryDirectory: string
  installCommand: string
  buildCommand: string
  buildOutDirectory: string
  version: string
}
```

**Backend Project Payload:**
```typescript
{
  projectName: string
  gitUrl: string
  branch: string
  entryDirectory: string
  installCommand: string
  runCommand: string
  version: string
}
```

### Deployment Endpoints ([src/api/deployment.api.ts](src/api/deployment.api.ts))

```typescript
deploymentApi.trigger(projectId)              // GET /deployment/{projectId}
deploymentApi.deploy(projectId)               // GET /deployment/deploy/{projectId}
deploymentApi.listAll()                       // GET /deployment
deploymentApi.listByProject(projectId)        // GET /deployment?projectId={projectId}
```

### Logs Endpoints ([src/api/logs.api.ts](src/api/logs.api.ts))

```typescript
logsApi.getBuildLogs(deploymentId)           // GET /b/logs/{deploymentId}
logsApi.getBuildStreamUrl(deploymentId)      // Returns stream URL
logsApi.getBuildStaticUrl(deploymentId)      // Returns static logs URL
logsApi.getLogs(deploymentId, {limit, cursor})   // GET /logs/{deploymentId}
logsApi.getStreamUrl(deploymentId)           // Returns stream URL
logsApi.getStaticLogs(deploymentId, value)   // GET /logs/{deploymentId}/static
```

**Logs Configuration:**
- Logs service has separate base URL: `VITE_LOGS_STREAM_BASE_URL` (defaults to `http://localhost:8007/api/v1`)
- Supports streaming and static log retrieval

### Repository Endpoints ([src/api/repo.api.ts](src/api/repo.api.ts))

```typescript
repoApi.listMine()          // GET /repo/getrepo
repoApi.find(query)         // GET /repo/find?query={query}
```

### Health Check ([src/api/health.api.ts](src/api/health.api.ts))

```typescript
healthApi.check()           // GET /healthcheck
```

---

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:8001/api/v1

# Logs Service Base URL
VITE_LOGS_STREAM_BASE_URL=http://localhost:8007/api/v1
```

### Access in Code

```typescript
// In main.tsx
import.meta.env.VITE_API_BASE_URL
import.meta.env.VITE_LOGS_STREAM_BASE_URL
```

---

## Response Format

### API Response Structure

All responses follow this format:

```typescript
type ApiResponse<T> = {
  statusCode: number
  data: T
  message: string
  success: boolean
}
```

### Response Unwrapping

Use the `unwrapApiResponse` utility to extract data:

```typescript
import { unwrapApiResponse } from '@/api'

const response = await projectsApi.list()
const projects = unwrapApiResponse(response.data)
```

The utility automatically extracts the `data` field if the response follows the standard format.

---

## Error Handling

### Automatic Error Handling

1. **401 Unauthorized**: Automatically refresh token and retry
2. **Other Errors**: Reject promise, can be caught in components
3. **Network Errors**: Passed through as Axios errors

### In Components

```typescript
try {
  const response = await authApi.me()
  // Handle success
} catch (error) {
  // Handle error
  if (error.response?.status === 401) {
    // Token refresh failed, user logged out
  }
}
```

---

## API Initialization Flow

1. **Application Start** ([src/main.tsx](src/main.tsx))
   ```typescript
   initializeApi({
     baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api/v1',
     refreshEndpoint: '/auth/refresh-token',
     withCredentials: true,
   })
   ```

2. **Configuration** ([src/api/client.ts](src/api/client.ts))
   - Sets Axios defaults (baseURL, withCredentials)
   - Configures token store
   - Initializes interceptors (request + response)

3. **Ready for Use**
   - All API modules can now make authenticated requests
   - Tokens automatically attached to headers
   - Token refresh handled transparently

---

## Usage Example

### In React Components

```typescript
import { projectsApi, deploymentApi, unwrapApiResponse } from '@/api'

export function ProjectsList() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await projectsApi.list()
        const data = unwrapApiResponse(response.data)
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
      }
    }

    loadProjects()
  }, [])

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>{project.projectName}</div>
      ))}
    </div>
  )
}
```

---

## Key Features

✅ **Automatic Token Refresh**: No manual token management needed
✅ **Bearer Token Authentication**: Secure API communication
✅ **Request Retry Logic**: Automatic retry on 401 with new token
✅ **localStorage Integration**: Persistent session across page reloads
✅ **TypeScript Support**: Full type safety for API requests/responses
✅ **Modular API**: Clean separation of concerns
✅ **Error Handling**: Comprehensive error interception
✅ **CORS Support**: withCredentials enabled for cookie handling

---

## Backend Requirements

The backend must implement:

1. **Authentication Flow**
   - `GET /api/v1/auth/login` - OAuth/login redirect
   - `GET /api/v1/auth/me` - Get current user
   - `POST /api/v1/auth/refresh-token` - Refresh access token
   - `GET /api/v1/auth/logout` - Logout

2. **Token Response Format** (for refresh)
   ```json
   {
     "data": {
       "newAccessToken": "...",
       "newRefreshToken": "..."
     },
     "success": true
   }
   ```

3. **CORS Configuration**
   - Allow requests from frontend origin
   - Allow credentials (cookies)
   - Allow `Authorization` header

---

## Troubleshooting

### Tokens Not Persisting
- Check if localStorage is enabled in browser
- Check browser's privacy/incognito mode
- Verify token keys: `accessToken`, `refreshToken`

### 401 Loop
- Backend refresh endpoint not returning tokens in expected format
- Check `mapRefreshResponse` configuration
- Verify refresh token is valid

### CORS Errors
- Backend must set `Access-Control-Allow-Credentials: true`
- Frontend sends `withCredentials: true`
- Backend must explicitly list frontend URL in CORS headers

### Missing Tokens in Requests
- Check if tokens are stored in localStorage
- Verify Bearer token format: `Authorization: Bearer <token>`
- Check request interceptor logs

---

## Files Reference

| File | Purpose |
|------|---------|
| [src/api/client.ts](src/api/client.ts) | Axios instance, interceptors, token refresh logic |
| [src/api/tokenStore.ts](src/api/tokenStore.ts) | Token storage in localStorage |
| [src/api/auth.api.ts](src/api/auth.api.ts) | Authentication endpoints |
| [src/api/projects.api.ts](src/api/projects.api.ts) | Project management endpoints |
| [src/api/deployment.api.ts](src/api/deployment.api.ts) | Deployment endpoints |
| [src/api/logs.api.ts](src/api/logs.api.ts) | Logs streaming endpoints |
| [src/api/repo.api.ts](src/api/repo.api.ts) | Repository endpoints |
| [src/api/health.api.ts](src/api/health.api.ts) | Health check endpoint |
| [src/api/types.ts](src/api/types.ts) | TypeScript type definitions |
| [src/api/response.ts](src/api/response.ts) | Response unwrapping utility |
| [src/api/index.ts](src/api/index.ts) | Main API exports |
| [src/main.tsx](src/main.tsx) | API initialization on app start |
