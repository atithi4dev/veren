# Builder Images & ECS Task Mapping

This document outlines the relationship between Workers, ECS Tasks, and Builder Images in the Veren deployment pipeline.

## Architecture Overview

```
WORKERS/build-worker
    └─> Triggers ECS Tasks (via AWS ECS API)
        └─> ECS Tasks run containers from ECR
            └─> ECR containers built from BUILDER_IMAGES/
```

---

## Worker → ECS Task → Builder Image Flow

### 1. Frontend Build Pipeline

**Worker Path:** `WORKERS/build-worker/src/services/distributionHandler/buildFrontend.ts`

#### Node.js 18 Projects
- **ECS Config:** `frontendConfig18` in `WORKERS/build-worker/src/config/ECSconfig.ts`
- **ECS Task Definition:** `arn:aws:ecs:ap-south-1:account_id:task-definition/frontend-builder-18:4`
- **ECS Cluster:** `arn:aws:ecs:ap-south-1:account_id:cluster/builder`
- **Container Name:** `frontend-builder-18` (from `FRONTEND18CONTAINER` env var)
- **Builder Image Source:** `BUILDER_IMAGES/builder-image-frontend/`
- **Dockerfile:** `BUILDER_IMAGES/builder-image-frontend/dockerfiles/Dockerfile.18x.dev`
- **Base Image:** `ubuntu:focal` with Node.js 18
- **Image in ECR:** `{account_id}.dkr.ecr.ap-south-1.amazonaws.com/frontend-builder-18`

**What it does:**
- Clones user's repository
- Navigates to frontend directory
- Runs `npm install` (or custom install command)
- Runs `npm run build` (or custom build command)
- Uploads build artifacts to S3 bucket `veren-v2/__outputs/{PROJECT_ID}/`

#### Node.js 20 Projects
- **ECS Config:** `frontendConfig20` in `WORKERS/build-worker/src/config/ECSconfig.ts`
- **ECS Task Definition:** `arn:aws:ecs:ap-south-1:account_id:task-definition/builder-task-20:5`
- **ECS Cluster:** `arn:aws:ecs:ap-south-1:account_id:cluster/builder`
- **Container Name:** `builder-task-20-image` (from `FRONTEND20CONTAINER` env var)
- **Builder Image Source:** `BUILDER_IMAGES/builder-image-frontend/`
- **Dockerfile:** `BUILDER_IMAGES/builder-image-frontend/dockerfiles/Dockerfile.20x.dev`
- **Base Image:** `ubuntu:focal` with Node.js 20
- **Image in ECR:** `{account_id}.dkr.ecr.ap-south-1.amazonaws.com/builder-task-20-image`

**What it does:**
- Same as Node 18 pipeline but with Node.js 20 runtime

---

### 2. Backend Build Pipeline

**Worker Path:** `WORKERS/build-worker/src/services/distributionHandler/buildBackend.ts`

- **ECS Config:** `backendECSConfig` in `WORKERS/build-worker/src/config/ECSconfig.ts`
- **ECS Task Definition:** `arn:aws:ecs:ap-south-1:account_id:task-definition/backend-build-worker:1`
- **ECS Cluster:** `arn:aws:ecs:ap-south-1:account_id:cluster/backend-builder`
- **Container Name:** `backend-build-worker` (from `BACKEND_CONTAINER` env var)
- **Builder Image Source:** `BUILDER_IMAGES/build-image-backend/`
- **Dockerfile:** `BUILDER_IMAGES/build-image-backend/Dockerfile`
- **Base Image:** `node:20-bullseye` + Kaniko executor
- **Image in ECR:** `{account_id}.dkr.ecr.ap-south-1.amazonaws.com/backend-build-worker`

**What it does:**
- Clones user's repository
- Navigates to backend directory
- Copies appropriate Dockerfile based on Node version (18 or 20):
  - Node 18: `BUILDER_IMAGES/build-image-backend/dockerbackend/Dockerfile_node18/Dockerfile`
  - Node 20: `BUILDER_IMAGES/build-image-backend/dockerbackend/Dockerfile_node20/Dockerfile`
- Uses Kaniko to build Docker image for user's backend
- Pushes built image to ECR with tag: `{ECR_URI}:{PROJECT_ID}-{DEPLOYMENTID}`

---

## Builder Images Detailed Breakdown

### Frontend Builder Images

Located in: `BUILDER_IMAGES/builder-image-frontend/`

| Component | Purpose |
|-----------|---------|
| `main.sh` | Entry point: clones git repo and executes `script.js` |
| `script.js` | Main build logic: installs deps, runs build, uploads to S3 |
| `publisher.js` | Kafka event publisher for build status updates |
| `utils/` | Helper utilities (e.g., recursive directory reading) |
| `kafka.pem` | Kafka SSL certificate for secure connections |
| `dockerfiles/Dockerfile.18x.dev` | Node.js 18 builder image |
| `dockerfiles/Dockerfile.20x.dev` | Node.js 20 builder image |

**Environment Variables Required:**
- `GIT_REPOSITORY__URL` - Repository to clone
- `PROJECT_ID` - Unique project identifier
- `DEPLOYMENTID` - Deployment instance ID
- `FRONTENDPATH` - Path to frontend directory
- `BUILDCOMMAND` - Build command (default: `npm run build`)
- `INSTALLCOMMAND` - Install command (default: `npm install`)
- `AWS_ACCESS_KEY_ID` - AWS credentials for S3 upload
- `AWS_SECRET_ACCESS_KEY` - AWS credentials for S3 upload
- `KAFKA_*` - Kafka connection details

---

### Backend Builder Image

Located in: `BUILDER_IMAGES/build-image-backend/`

| Component | Purpose |
|-----------|---------|
| `Dockerfile` | Main builder image with Kaniko + Node.js 20 |
| `main.sh` | Entry point: clones git repo and executes `script.js` |
| `script.js` | Main build logic: copies Dockerfile, builds with Kaniko, pushes to ECR |
| `publisher.js` | Kafka event publisher for build status updates |
| `dockerbackend/Dockerfile_node18/` | Template Dockerfile for Node.js 18 backends |
| `dockerbackend/Dockerfile_node20/` | Template Dockerfile for Node.js 20 backends |
| `kafka.pem` | Kafka SSL certificate |

**Environment Variables Required:**
- `GIT_REPOSITORY__URL` - Repository to clone
- `PROJECT_ID` - Unique project identifier
- `DEPLOYMENTID` - Deployment instance ID
- `BACKEND_PATH` - Path to backend directory
- `NODE_VERSION` - Node.js version (18 or 20)
- `ECR_URI` - ECR repository URI for pushing images
- `AWS_ACCESS_KEY_ID` - AWS credentials for ECR push
- `AWS_SECRET_ACCESS_KEY` - AWS credentials for ECR push
- `AWS_REGION` - AWS region
- `KAFKA_*` - Kafka connection details

---

## Configuration Files

### ECS Configuration
File: `WORKERS/build-worker/src/config/ECSconfig.ts`

```typescript
export const frontendConfig18 = {
    CLUSTER: process.env.AWS_FRONTEND_CLUSTER,
    TASK: process.env.TASK18,
    CONTAINERNAME: process.env.FRONTEND18CONTAINER
}

export const frontendConfig20 = {
    CLUSTER: process.env.AWS_FRONTEND_CLUSTER,
    TASK: process.env.TASK20,
    CONTAINERNAME: process.env.FRONTEND20CONTAINER
}

export const backendECSConfig = {
    CLUSTER: process.env.AWS_BACKEND_CLUSTER,
    TASK: process.env.TASKBACKEND,
    CONTAINERNAME: process.env.BACKEND_CONTAINER
}
```

### Environment Variables (Build Worker)
File: `WORKERS/build-worker/.env`

```env
# ECS Task Definitions
TASK18=arn:aws:ecs:ap-south-1:account_id:task-definition/frontend-builder-18:4
TASK20=arn:aws:ecs:ap-south-1:account_id:task-definition/builder-task-20:5
TASKBACKEND=arn:aws:ecs:ap-south-1:account_id:task-definition/backend-build-worker:1

# ECS Clusters
AWS_FRONTEND_CLUSTER=arn:aws:ecs:ap-south-1:account_id:cluster/builder
AWS_BACKEND_CLUSTER=arn:aws:ecs:ap-south-1:account_id:cluster/backend-builder

# ECR Configuration
ECR_URI=account_id.dkr.ecr.ap-south-1.amazonaws.com/my-backend
FRONTEND18CONTAINER=frontend-builder-18
FRONTEND20CONTAINER=builder-task-20-image
BACKEND_CONTAINER=backend-build-worker
```

---

## Build Flow Sequence

### Frontend Build Flow
1. **User submits project** → API Gateway receives request
2. **Clone Worker** → Analyzes project, detects Node.js version (18 or 20)
3. **Build Worker** (`WORKERS/build-worker/src/workers/build.ts`) → Receives job from queue
4. **Build Worker** calls `buildFrontend()` → Selects appropriate ECS config based on Node version
5. **ECS Task starts** → Runs container from ECR (frontend-builder-18 or builder-task-20-image)
6. **Container executes:**
   - Clones repository
   - Installs dependencies
   - Runs build command
   - Uploads to S3
7. **Kafka events published** → Status updates sent to API Gateway
8. **Success/Failure** → User notified via WebSocket

### Backend Build Flow
1. **User submits project** → API Gateway receives request
2. **Clone Worker** → Analyzes project, detects Node.js version (18 or 20)
3. **Build Worker** receives job, calls `buildBackend()`
4. **ECS Task starts** → Runs backend-build-worker container from ECR
5. **Container executes:**
   - Clones repository
   - Copies appropriate Dockerfile (Node 18 or 20)
   - Builds Docker image with Kaniko
   - Pushes image to ECR with tag `{PROJECT_ID}-{DEPLOYMENTID}`
6. **Kafka events published** → Status updates sent
7. **Success/Failure** → User notified

---

## ECR Repositories Summary

| ECR Repository | Source Builder Image | Node Version | Purpose |
|----------------|---------------------|--------------|---------|
| `frontend-builder-18` | `BUILDER_IMAGES/builder-image-frontend/` (Dockerfile.18x.dev) | 18 | Build frontend projects using Node.js 18 |
| `builder-task-20-image` | `BUILDER_IMAGES/builder-image-frontend/` (Dockerfile.20x.dev) | 20 | Build frontend projects using Node.js 20 |
| `backend-build-worker` | `BUILDER_IMAGES/build-image-backend/` (Dockerfile) | 20 (runtime) | Build backend Docker images using Kaniko |
| `{PROJECT_ID}-{DEPLOYMENTID}` | User's backend code | 18 or 20 | User's deployed backend application |

---

## Key Technologies

- **Kaniko:** Builds Docker images inside containers without Docker daemon (used in backend builder)
- **AWS ECS Fargate:** Serverless container execution
- **AWS ECR:** Container registry for storing builder images and user application images
- **AWS S3:** Storage for frontend build artifacts
- **Kafka:** Event streaming for build status updates
- **Redis:** Build job queue and pub/sub for logs

---

## Notes

1. **Frontend builders** are lightweight - they only need Node.js to install deps and run build commands
2. **Backend builder** is heavier - includes Kaniko for building Docker images
3. **Node version detection** happens in Clone Worker (`WORKERS/clone-worker/src/services/detector/detectProjectType.ts`)
4. **Build artifacts:**
   - Frontend: Static files in S3 (`veren-v2/__outputs/{PROJECT_ID}/`)
   - Backend: Docker images in ECR (`{ECR_URI}:{PROJECT_ID}-{DEPLOYMENTID}`)
5. **Container name mismatch:** There's a typo in `ECSconfig.ts` - `frontendConfig20` uses `FRONTEND18CONTAINER` instead of `FRONTEND20CONTAINER`

---

## Contributing Guidelines

**⚠️ IMPORTANT for Issue Reporters:**

When creating issues or reporting bugs related to this build pipeline, you **MUST** specify the exact file paths you are referring to. This repository has a complex structure with multiple services, workers, and builder images.

**Good Examples:**
- ✅ "Bug in `WORKERS/build-worker/src/services/distributionHandler/buildFrontend.ts` line 105"
- ✅ "Environment variable missing in `BUILDER_IMAGES/build-image-backend/script.js`"
- ✅ "Update needed in `WORKERS/build-worker/src/config/ECSconfig.ts`"

**Bad Examples:**
- ❌ "Bug in the build worker"
- ❌ "Frontend builder is broken"
- ❌ "Fix the Dockerfile"

**Why this matters:**
- We have multiple workers: `build-worker`, `clone-worker`, `repo-analyzer`
- We have multiple builder images with similar names
- We have multiple Dockerfiles in different directories
- Ambiguous references slow down issue resolution and can lead to fixes in the wrong place

Please use the file paths shown in this document as reference when reporting issues.
