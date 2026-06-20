# Veren API Documentation

## Overview

Veren is a backend-driven deployment system that automates building and deploying applications from source repositories using a service-oriented architecture. This document provides comprehensive API documentation for developers integrating with Veren.

**Base URL:** `http://localhost:3000/api/v1` (development)

**Production URL:** `https://main.veren.site/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Health Check](#health-check)
3. [Projects](#projects)
4. [Deployments](#deployments)
5. [Repositories](#repositories)
6. [Routes/Reverse Proxy](#routesreverse-proxy)
7. [Internal Services](#internal-services)
8. [Error Handling](#error-handling)

---

## Authentication

### GitHub OAuth Login

**Endpoint:** `GET /api/v1/auth/login`

**Description:** Initiates GitHub OAuth flow for user authentication.

**Query Parameters:** None

**Response:** Redirects to GitHub authorization page

**Example:**
```bash
curl http://localhost:3000/api/v1/auth/login
```

---

### OAuth Callback

**Endpoint:** `GET /api/v1/auth/callback`

**Description:** Handles the OAuth callback from GitHub after user authorization.

**Query Parameters:**
- `code` (string, required): Authorization code from GitHub
- `state` (string, required): State parameter for CSRF protection

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "githubToken": "token",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  },
  "message": "User logged in successfully"
}
```

---

### Refresh Access Token

**Endpoint:** `POST /api/v1/auth/refresh-token`

**Description:** Refreshes the JWT access token using the refresh token.

**Headers:**
```
Content-Type: application/json
Cookie: refreshToken=<refresh_token>
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "new_jwt_token"
  },
  "message": "Token refreshed successfully"
}
```

---

### Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Description:** Retrieves the current authenticated user's information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "github_username",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "User retrieved successfully"
}
```

---

### Logout

**Endpoint:** `GET /api/v1/auth/logout`

**Description:** Logs out the current user and clears the session.

**Headers:**
```
Authorization: Bearer <access_token>
Cookie: sessionId=<session_id>
```

**Response:**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logged out successfully"
}
```

---

## Health Check

### System Health Status

**Endpoint:** `GET /api/v1/healthcheck`

**Description:** Checks the health status of the Veren system and its dependencies.

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "services": {
      "api": "running",
      "database": "connected",
      "queue": "active"
    }
  },
  "message": "System is healthy"
}
```

---

## Projects

### Create Project

**Endpoint:** `POST /api/v1/projects`

**Description:** Creates a new project configuration for deployment.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "my-app",
  "description": "My awesome application",
  "gitRepository": "https://github.com/user/repo",
  "branch": "main",
  "buildCommand": "npm install && npm run build",
  "runCommand": "npm start",
  "environment": {
    "NODE_ENV": "production",
    "DEBUG": "false"
  }
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "project": {
      "_id": "project_id",
      "userId": "user_id",
      "name": "my-app",
      "gitRepository": "https://github.com/user/repo",
      "branch": "main",
      "buildCommand": "npm install && npm run build",
      "runCommand": "npm start",
      "environment": {
        "NODE_ENV": "production",
        "DEBUG": "false"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Project created successfully"
}
```

---

### Get All Projects

**Endpoint:** `GET /api/v1/projects`

**Description:** Retrieves all projects for the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, optional): Page number for pagination (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "projects": [
      {
        "_id": "project_id",
        "name": "my-app",
        "gitRepository": "https://github.com/user/repo",
        "branch": "main",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  },
  "message": "Projects retrieved successfully"
}
```

---

### Get Project Details

**Endpoint:** `GET /api/v1/projects/:projectId`

**Description:** Retrieves detailed configuration for a specific project.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "project": {
      "_id": "project_id",
      "userId": "user_id",
      "name": "my-app",
      "gitRepository": "https://github.com/user/repo",
      "branch": "main",
      "buildCommand": "npm install && npm run build",
      "runCommand": "npm start",
      "environment": {
        "NODE_ENV": "production"
      },
      "deploymentHistory": [
        {
          "deploymentId": "dep_id",
          "status": "success",
          "timestamp": "2024-01-01T00:00:00Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Project details retrieved successfully"
}
```

---

### Update Project Environment Variables

**Endpoint:** `PATCH /api/v1/projects/:projectId/env`

**Description:** Updates environment variables for a project.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Request Body:**
```json
{
  "environment": {
    "DATABASE_URL": "postgresql://user:pass@localhost/db",
    "API_KEY": "secret_key",
    "DEBUG": "true"
  }
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "project": {
      "_id": "project_id",
      "environment": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db",
        "API_KEY": "secret_key",
        "DEBUG": "true"
      },
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Environment variables updated successfully"
}
```

---

## Deployments

### Trigger Deployment

**Endpoint:** `POST /api/v1/deployment/d/:projectId`

**Description:** Triggers a new deployment for a project. This initiates the build process and deployment workflow.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project to deploy

**Request Body:**
```json
{
  "branch": "main",
  "commitSha": "abc123def456",
  "metadata": {
    "triggedBy": "manual",
    "environment": "production"
  }
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "deployment": {
      "_id": "deployment_id",
      "projectId": "project_id",
      "status": "pending",
      "branch": "main",
      "commitSha": "abc123def456",
      "buildLogs": [],
      "deploymentUrl": "https://my-app.veren.site",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Deployment started successfully"
}
```

---

### Get Deployment Status

**Endpoint:** `GET /api/v1/deployment/:projectId`

**Description:** Retrieves the status and logs of a deployment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Query Parameters:**
- `deploymentId` (string, optional): Specific deployment ID (returns latest if not provided)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "deployment": {
      "_id": "deployment_id",
      "projectId": "project_id",
      "status": "in-progress",
      "progress": 45,
      "currentStep": "building",
      "buildLogs": [
        "Installing dependencies...",
        "Building application...",
        "Running tests..."
      ],
      "deploymentUrl": "https://my-app.veren.site",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:05Z"
    }
  },
  "message": "Deployment status retrieved successfully"
}
```

---

### Rollback Deployment

**Endpoint:** `POST /api/v1/deployment/r/:projectId`

**Description:** Rolls back to a previous deployment version.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Request Body:**
```json
{
  "deploymentId": "previous_deployment_id"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "deployment": {
      "_id": "rollback_deployment_id",
      "status": "pending",
      "type": "rollback",
      "previousDeploymentId": "previous_deployment_id",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Rollback initiated successfully"
}
```

---

## Repositories

### Get User Repositories

**Endpoint:** `GET /api/v1/repo/getrepo`

**Description:** Retrieves all GitHub repositories accessible to the authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (number, optional): Page number for pagination (default: 1)
- `perPage` (number, optional): Items per page (default: 30)
- `sort` (string, optional): Sort by 'stars' or 'updated' (default: 'updated')

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "repositories": [
      {
        "id": "repo_id",
        "name": "my-project",
        "fullName": "username/my-project",
        "description": "My awesome project",
        "url": "https://github.com/username/my-project",
        "htmlUrl": "https://github.com/username/my-project",
        "private": false,
        "stars": 42,
        "language": "TypeScript",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 30,
      "total": 5
    }
  },
  "message": "Repositories retrieved successfully"
}
```

---

### Find Specific Repository

**Endpoint:** `GET /api/v1/repo/find`

**Description:** Searches for a specific repository by name or URL.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `query` (string, required): Repository name or URL to search
- `limit` (number, optional): Maximum results (default: 10)

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "repository": {
      "id": "repo_id",
      "name": "my-project",
      "fullName": "username/my-project",
      "url": "https://github.com/username/my-project",
      "description": "My awesome project",
      "defaultBranch": "main",
      "branches": ["main", "develop", "feature/new-feature"],
      "language": "TypeScript",
      "topics": ["deployment", "automation"]
    }
  },
  "message": "Repository found successfully"
}
```

---

## Routes/Reverse Proxy

### Proxy Request

**Endpoint:** `GET /api/v1/route?url=<deployment_url>`

**Description:** Acts as a reverse proxy to route requests to deployed applications. Useful for accessing deployed services through a unified interface.

**Headers:**
```
Authorization: Bearer <access_token> (optional)
```

**Query Parameters:**
- `url` (string, required): The deployment URL to proxy to
- `path` (string, optional): Specific path within the deployment

**Response:** Proxied response from the deployed application

**Example:**
```bash
curl http://localhost:3000/api/v1/route?url=https://my-app.veren.site&path=/api/users
```

---

## Internal Services

### Get Build Metadata

**Endpoint:** `GET /api/v1/internal/:projectId/build-metadata`

**Description:** Retrieves build configuration metadata for a project (internal service use only).

**Headers:**
```
Authorization: Bearer <service_token>
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "buildMetadata": {
      "projectId": "project_id",
      "buildCommand": "npm install && npm run build",
      "dockerfile": "Dockerfile",
      "buildContext": ".",
      "outputDirectory": "dist",
      "cacheEnabled": true,
      "environment": {
        "NODE_ENV": "production"
      }
    }
  },
  "message": "Build metadata retrieved successfully"
}
```

---

### Update Build Metadata

**Endpoint:** `PATCH /api/v1/internal/:projectId/build-metadata`

**Description:** Updates build metadata for a project (internal service use only).

**Headers:**
```
Authorization: Bearer <service_token>
Content-Type: application/json
```

**Path Parameters:**
- `projectId` (string, required): The ID of the project

**Request Body:**
```json
{
  "buildStatus": "success",
  "buildLogs": ["log1", "log2"],
  "buildDuration": 120,
  "artifact": {
    "size": "42MB",
    "hash": "sha256:abc123",
    "url": "s3://bucket/artifact.tar.gz"
  }
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "buildMetadata": {
      "projectId": "project_id",
      "buildStatus": "success",
      "buildDuration": 120,
      "artifact": {
        "size": "42MB",
        "hash": "sha256:abc123"
      },
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Build metadata updated successfully"
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Format

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "errors": [
    {
      "field": "projectId",
      "message": "Project ID is required"
    }
  ]
}
```

### Common HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - User lacks permission for this resource |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error occurred |
| 503 | Service Unavailable - Service temporarily unavailable |

### Common Error Codes

- `INVALID_REQUEST`: Request validation failed
- `AUTHENTICATION_FAILED`: Authentication failed or token expired
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `PERMISSION_DENIED`: User does not have permission to access resource
- `INTERNAL_ERROR`: Unexpected server error
- `SERVICE_UNAVAILABLE`: A required service is unavailable

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per user
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Authentication Details

### JWT Token Structure

Access tokens are JWT tokens with the following claims:

```json
{
  "sub": "user_id",
  "username": "github_username",
  "email": "user@example.com",
  "iat": 1640000000,
  "exp": 1640086400,
  "iss": "veren"
}
```

### Token Expiration

- **Access Token:** 15 min
- **Refresh Token:** 7 days
- **Session Cookie:** 30 days

---

## Webhooks (Future)

Veren supports webhooks for deployment events. Configure webhooks in project settings to receive real-time notifications about:

- Deployment started
- Deployment completed
- Deployment failed
- Build succeeded/failed

---

## Best Practices

1. **Always include the `Authorization` header** with a valid JWT token for authenticated endpoints
2. **Use query parameters** for pagination and filtering
3. **Implement exponential backoff** for retrying failed requests
4. **Monitor rate limits** using response headers
5. **Store refresh tokens securely** on the client side
6. **Handle errors gracefully** with proper error messages
7. **Cache API responses** when appropriate to reduce load
8. **Use HTTPS** in production environments

---

## Support & Resources

- **Documentation:** https://main.veren.site/docs
- **GitHub Repository:** https://github.com/atithi4dev/veren
- **Issue Tracker:** https://github.com/atithi4dev/veren/issues
- **API Examples:** See test files in the repository