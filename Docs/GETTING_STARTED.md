# Getting Started

This is local startup flow for Veren. The backend side is meant to be
started from the project root with Docker Compose, while the dashboard runs with
Vite from the `frontend` folder.


## What Starts Locally

The development compose file starts the backend platform containers:

- `api-gateway` on host port `8001`
- `routing-service` on host port `8004`
- `orchestrate-service` on host port `8005`
- `notification-service` on host port `8007`
- `frontend-build-worker`
- `backend-build-worker`
- `backend-deploy-worker`
- `log-worker`
- `internal-redis`

The frontend dashboard is not started by Docker Compose. Run it separately with
`npm run dev` inside `frontend`.

## Prerequisites

You need:

- Docker and Docker Compose
- Node.js and npm
- GitHub OAuth app credentials
- smee client for local GitHub webhook forwarding
- the required `.env` files for the services being started
- AWS, Kafka, ClickHouse, and other cloud credentials when testing real deploys

## Environment Files

Before starting, make sure these files exist where the services expect them:

```txt
api-gateway/.env
routing-service/.env
orchestrate-service/.env
notification-service/.env
WORKERS/frontend-build-worker/.env
WORKERS/backend-build-worker/.env
WORKERS/backend-deploy-worker/.env
WORKERS/log-worker/.env
frontend/.env
```

The API gateway should know the frontend URL and GitHub OAuth values:

```env
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
SESSION_SECRET=...
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...
```

Workers and builder paths need AWS, Kafka, Redis, and event configuration. The
exact values depend on the cloud resources you are using.

## Start The Backend Platform

From the Veren project root, where `docker-compose.dev.yml` exists:

```bash
sudo docker compose -f docker-compose.dev.yml up --build
```

This is the primary command for local backend development. It builds and starts
the backend services, workers, and Redis on the shared Docker network.

If you only want to restart after the images are built:

```bash
sudo docker compose -f docker-compose.dev.yml up
```

To stop everything:

```bash
sudo docker compose -f docker-compose.dev.yml down
```

## Start GitHub Webhook Forwarding

GitHub cannot call your localhost directly, so use smee to forward webhook
events into the local API gateway:

```bash
npx smee-client https://smee.io/abc123xyz --target http://localhost:8001/api/v1/webhooks/github
```

Keep this running while testing GitHub webhook deployments. The target points to
the API gateway because Docker maps `api-gateway` from container port `3000` to
host port `8001`.

In GitHub, the webhook URL should use the smee URL:

```txt
https://smee.io/abc123xyz
```

## Start The Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite usually serves the dashboard at:

```txt
http://localhost:5173
```

The frontend talks to the API gateway through the configured backend URL. During
local development, that API is exposed at:

```txt
http://localhost:8001/api/v1
```

## First Local Run Checklist

Use this order:

1. Start the backend platform with Docker Compose.
2. Start the smee client.
3. Start the frontend with `npm run dev`.
4. Open the dashboard in the browser.
5. Log in with GitHub.
6. Create a project.
7. Trigger a deployment manually or push to the configured branch.
8. Watch the compose logs for API, worker, builder/event, and routing behavior.

## How The Local Pieces Connect

```txt
Frontend dashboard
  http://localhost:5173
        |
        v
API gateway
  http://localhost:8001/api/v1
        |
        v
Redis / workers / event consumers from docker-compose.dev.yml

GitHub webhook
  GitHub -> smee.io URL -> localhost:8001/api/v1/webhooks/github
```

## When You Need Cloud Resources

The platform can start locally without every external system being perfect, but
real deployments need the cloud pieces to be configured:

- ECS/Fargate task definitions for frontend and backend builders
- ECR for backend images
- S3 for frontend build artifacts
- SNS/SQS for deployment events
- Kafka for build logs
- ClickHouse for stored logs
- AWS networking values such as subnets and security groups

If those values are missing, the containers may start, but build and deployment
jobs will fail when they reach the worker or cloud-task stage.