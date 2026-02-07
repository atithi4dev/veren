# Contributing to Veren Backend

Thank you for your interest in contributing to Veren! This document provides guidelines and instructions for contributing to the **Veren Backend** - a service-oriented deployment system for automating builds and deployments.

> **Frontend Contributors:** The Veren Frontend repository has its own `CONTRIBUTING.md` with frontend-specific setup and guidelines.

---

## Table of Contents

- [About Veren](#about-veren)
- [⚠️ Before You Start - Important Guidelines](#before-you-start---important-guidelines-)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Architecture Overview](#architecture-overview)
- [Code Guidelines](#code-guidelines)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Performance Optimization](#performance-optimization)
- [Common Issues & Solutions](#common-issues--solutions)
- [Questions? Need Help?](#questions-need-help)
- [Resources](#resources)

---

## About Veren

Veren is a **backend-driven deployment system** that automates building and deploying applications from source repositories using a **service-oriented architecture**.

### Key Features

- **GitHub OAuth Integration:** Seamless authentication via GitHub
- **Multi-Service Architecture:** API Gateway, Workers, and specialized services
- **Asynchronous Processing:** Queue-based job management using Bull/BullMQ
- **Real-time Deployment:** Automated builds and deployments from Git repositories
- **Environment Management:** Per-project environment variable configuration
- **Comprehensive Logging:** Winston-based logging across services
- **Database Support:** MongoDB and PostgreSQL integration

### Technology Stack

- **Runtime:** Node.js with TypeScript
- **API Framework:** Express.js
- **Authentication:** GitHub OAuth, JWT, Sessions
- **Database:** MongoDB (user/session), PostgreSQL (project config)
- **Message Queue:**  Redis + BullMq
- **Containerization:** Docker & Docker Compose
- **Log Routing:** Kafka + ClickHouse 
- **Logging:** Winston

---

## Before You Start - Important Guidelines ⚠️

**Please follow these rules before contributing to maintain code quality and collaboration:**

#### 1. **Read Documentation First**
   - ✅ **MUST** read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Understand the API structure and endpoints
   - ✅ **MUST** read this entire [CONTRIBUTING.md](#contributing-to-veren) - Understand development workflow
   - ✅ Understand the [Code Guidelines](#code-guidelines) section
   - ❌ **DO NOT** start working without reading these

#### 2. **Don't Work Without Assignment**
   - ❌ **DO NOT** open a new issue and immediately start working on it
   - ❌ **DO NOT** directly push code to branches
   - ✅ **DO** check [existing issues](https://github.com/atithi4dev/veren/issues) first
   - ✅ **DO** comment on an issue expressing interest to work on it
   - ✅ **DO** wait for a maintainer to assign the issue to you
   - ✅ **DO** wait for discussion and approval from mentors before coding

#### 3. **Follow the Discussion-First Approach**
   - Before implementation, **discuss your approach** with mentors in the issue
   - Get **approval** on your suggested solution
   - Ask questions if anything is unclear
   - Understand the design patterns we use

#### 4. **Follow Defined Patterns**
   - ✅ **DO** follow the existing code structure and patterns in the codebase
   - ✅ **DO** review similar implementations before writing code
   - ✅ **DO** stick to [naming conventions](#naming-conventions)
   - ✅ **DO** use established patterns for error handling, logging, async operations
   - ❌ **DO NOT** introduce new patterns or deviations

#### 5. **Proper Workflow - No Direct Pushes**
   - Create a **feature branch** from `main` (e.g., `feature/issue-123-brief-description`)
   - Make commits with **conventional commit messages**
   - Push to your fork or branch
   - Create a **Pull Request** to the `develop` branch with clear description linking the issue
   - Wait for **at least 1 code review**
   - ❌ **DO NOT** force push or directly merge to main
   - ❌ **DO NOT** make PRs to main; use `develop` for contributor PRs

#### 6. **Communication Guidelines**
   - Be **respectful and professional**
   - Ask questions if requirements are unclear
   - Provide **context and reasoning** in your PR
   - Be open to feedback and **ready to iterate**
   - Keep discussions in issues/PRs, not direct messages

---

## Getting Started

This section provides detailed instructions to set up the development environment for contribution. Whether you're fixing bugs, adding features, or improving infrastructure, follow these steps to get your environment ready.

**Contributing Areas:**
- **API Gateway** - Request handling, authentication, project management
- **Workers** - Clone worker, build worker, repository analysis
- **Services** - Routing, notification, orchestration
- **Packages** - Shared domain types and logging utilities
- **Database Layer** - User models, project schemas
- **Middleware & Utils** - Authentication, error handling, utilities

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**
- GitHub account (for OAuth setup)
- **Redis** (for queue management)
- **MongoDB** (for user/session storage)
- **PostgreSQL** (for project configuration)

### Repository Structure

```
veren/
├── api-gateway/              # Main API entry point
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── models/           # Database models
│   │   ├── middlewares/      # Express middlewares
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   ├── config/           # Configuration
│   │   ├── db/               # Database setup
│   │   └── logger/           # Logging setup
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
│
├── WORKERS/                  # Background job processors
│   ├── build-worker/         # Build process handler
│   ├── clone-worker/         # Repository cloning handler
│   └── repo-analyzer/        # Repository analysis
│
├── routing-service/          # WebSocket routing service
│   ├── src/
│   └── socket.ts             # Socket.io configuration
│
├── notification-service/     # Event notifications
│   ├── src/
│   └── controllers/
│
├── orchestrate-service/      # Service orchestration
│   ├── src/
│   └── controllers/
│
├── packages/                 # Shared packages
│   ├── domain/               # Shared types & interfaces
│   └── log/                  # Shared logging
│
├── BUILDER_IMAGES/           # Docker image builders
│   ├── build-image-backend/
│   └── builder-image-frontend/
│
├── Docs/                     # Documentation
│   ├── API_DOCUMENTATION.md  # API reference
│   ├── CONTRIBUTING.md       # This file
│   └── TESTING_VERDICT.txt
│
├── docker-compose.dev.yml    # Development environment
├── docker-compose.yml        # Production environment
└── compose.sh                # Compose wrapper script
```

---

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/atithi4dev/veren.git
cd veren
```

### 2. Set Up Environment Variables

Create `.env` files in the required directories. Use the examples below based on which services you're developing:

#### Root `.env` (Optional - for Docker Compose)
```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database URLs
MONGO_CONN_STRING=mongodb://localhost:27017/verenDB
POSTGRES_DB_URL=postgresql://user:password@localhost:5432/veren

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Services
API_GATEWAY_PORT=3000
ROUTING_SERVICE_PORT=3001
NOTIFICATION_SERVICE_PORT=3002
ORCHESTRATE_SERVICE_PORT=3003

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Session
SESSION_SECRET=your_session_secret_key

# AWS/S3 (for artifact storage)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=veren-artifacts
```

#### API Gateway `api-gateway/.env`
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8001/api/v1/auth/callback

# Database
MONGO_CONN_STRING=mongodb://localhost:27017/verenDB

# Session & Cookies
SESSION_SECRET=your_session_secret_key

# JWT Tokens
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# AWS Services
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
SERVICE_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/your_account_id/veren-internal-queue.fifo
DOMAIN_EVENTS_TOPIC_ARN=arn:aws:sns:ap-south-1:your_account_id:veren-internal-queue.fifo
```

#### Clone Worker `WORKERS/clone-worker/.env`
```env
PORT=3000

# AWS S3 Config
S3_BUCKET=veren-v0
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379

# Domain Events (SNS)
DOMAIN_EVENTS_TOPIC_ARN=arn:aws:sns:ap-south-1:your_account_id:veren-internal-queue.fifo
```

#### Build Worker `WORKERS/build-worker/.env`
```env
PORT=3000

# AWS Credentials
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# S3 Configuration
S3_BUCKET=veren-v0

# Redis Configuration
REDIS_USERNAME=default
REDIS_HOSTNAME=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# ECS Task Definitions (for Docker build execution)
TASK18=arn:aws:ecs:ap-south-1:your_account_id:task-definition/frontend-builder-18:4
TASK20=arn:aws:ecs:ap-south-1:your_account_id:task-definition/builder-task-20:5
TASKBACKEND=arn:aws:ecs:ap-south-1:your_account_id:task-definition/backend-build-worker:1

# ECS Clusters
AWS_FRONTEND_CLUSTER=arn:aws:ecs:ap-south-1:your_account_id:cluster/builder
AWS_BACKEND_CLUSTER=arn:aws:ecs:ap-south-1:your_account_id:cluster/backend-builder

# Network Configuration
AWS_SUBNETS=subnet-xxxxx,subnet-xxxxx,subnet-xxxxx
AWS_SECURITY_GROUPS=sg-xxxxx

# ECR Configuration
ECR_URI=your_account_id.dkr.ecr.ap-south-1.amazonaws.com/my-backend
FRONTEND18CONTAINER=frontend-builder-18
FRONTEND20CONTAINER=builder-task-20-image
BACKEND_CONTAINER=backend-build-worker
```

#### Routing Service `routing-service/.env`
```env
PORT=3000

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379

# Socket.io Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Orchestrate Service `orchestrate-service/.env`
```env
PORT=3000

# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### Notification Service `notification-service/.env`
```env
PORT=3000

# Email Configuration (if needed)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# SNS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

> **Note:** For local development, you can use dummy values for AWS credentials if you're not testing AWS-specific features. For production, ensure all credentials are properly configured.

### 3. Install Dependencies

```bash
# Install root dependencies (workspace)
npm install

# Dependencies are installed for all workspaces defined in package.json
# api-gateway, workers, and packages
```

### 4. Set Up Databases

```bash
# Start MongoDB, PostgreSQL, and Redis using Docker Compose
docker compose -f docker-compose.dev.yml up -d

# Verify connections
npm run db:migrate  # Run pending migrations
```

### 5. Start Development Services

**Option A: Using Docker Compose (Recommended)**
```bash
docker compose -f docker-compose.dev.yml up --build

# Services will start:
# - API Gateway: http://localhost:8001
# - Routing Service: http://localhost:8004
# - Notification Service: http://localhost:8007
# - Orchestrate Service: http://localhost:8005
```

**Option B: Using npm scripts**
```bash
# Terminal 1: Start API Gateway
cd api-gateway
npm run dev

# Terminal 2: Start Build Worker
cd WORKERS/build-worker
npm run dev

# Terminal 3: Start Clone Worker
cd WORKERS/clone-worker
npm run dev

# Terminal 4+: Start other services as needed
```

### 6. Verify Installation

```bash
# Check API Gateway health
curl http://localhost:3000/api/v1/healthcheck

# Expected response:
# {
#   "statusCode": 200,
#   "data": {
#     "status": "healthy",
#     "services": { ... }
#   }
# }
```

---

## Architecture Overview

### Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Application                 │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│              API Gateway (Express)                    │
│         - Authentication (GitHub OAuth)              │
│         - Project Management                         │
│         - Deployment Orchestration                   │
│         - Request Routing                            │
└─────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
    ┌────────┐   ┌──────────────┐  ┌──────────────┐
    │ MongoDB │   │  PostgreSQL  │  │    Redis     │
    │ (Users) │   │ (Projects)   │  │   (Queue)    │
    └────────┘   └──────────────┘  └──────────────┘
        │              │              │
        └──────────────┴──────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    ┌──────────┐ ┌──────────┐ ┌──────────────┐
    │   Clone  │ │  Build   │ │ Orchestrate  │
    │  Worker  │ │  Worker  │ │   Service    │
    └──────────┘ └──────────┘ └──────────────┘
        │             │             │
        ▼             ▼             ▼
    ┌──────────────────────────────────────────┐
    │      Routing Service (WebSockets)        │
    │         - Real-time Logs                 │
    │         - Deployment Status Updates      │
    └──────────────────────────────────────────┘
        │
        ▼
    ┌──────────────────────────────────────────┐
    │    Notification Service                   │
    │      - Email Notifications               │
    │      - Webhook Events                    │
    └──────────────────────────────────────────┘
```

### Data Flow Example: Deployment Process

```
1. User triggers deployment via API
   POST /api/v1/deployment/d/:projectId
   
2. API Gateway validates request & creates deployment record
   ↓
3. Job queued in BullMQ (Redis)
   ↓
4. Clone Worker picks up job
   - Clones repository
   - Analyzes code structure
   ↓
5. Build Worker picks up job
   - Builds Docker image
   - Runs tests
   - Uploads artifact to S3
   ↓
6. Orchestrate Service coordinates
   - Creates containers
   - Manages networking
   - Handles health checks
   ↓
7. Routing Service updates clients
   - WebSocket notifications
   - Real-time logs
   ↓
8. Notification Service
   - Sends email/webhook notifications
   - Logs completion
```

---

## Code Guidelines

### TypeScript Configuration

Veren uses TypeScript with strict mode enabled. All code must be properly typed.

**Key TypeScript Settings (tsconfig.json):**
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node"
  }
}
```

### Naming Conventions

- **Files:** Use kebab-case (e.g., `auth.controller.ts`, `user.model.ts`)
- **Classes:** Use PascalCase (e.g., `ApiError`, `DeploymentController`)
- **Functions/Methods:** Use camelCase (e.g., `createProject`, `validateToken`)
- **Constants:** Use UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Variables:** Use camelCase (e.g., `projectId`, `githubToken`)

### Project Structure

```
service/src/
├── controllers/      # Handle HTTP requests
├── routes/          # Define API endpoints
├── services/        # Business logic layer
├── models/          # Database models/schemas
├── middlewares/     # Express middlewares
├── utils/           # Utility functions
├── types/           # TypeScript interfaces
├── config/          # Configuration files
├── db/              # Database setup
├── logger/          # Logging setup
└── index.ts         # Entry point
```

### Code Style

1. **Async/Await:** Use async/await instead of promises
   ```typescript
   // Good
   async function deployProject(projectId: string) {
     const project = await Project.findById(projectId);
     return project;
   }
   
   // Avoid
   function deployProject(projectId: string) {
     return Project.findById(projectId)
       .then(project => project);
   }
   ```

2. **Error Handling:** Use custom error classes
   ```typescript
   import ApiError from "../utils/api-utils/ApiError.js";
   
   throw new ApiError(404, "Project not found");
   ```

3. **Async Handler:** Wrap async route handlers
   ```typescript
   import asyncHandler from "../utils/api-utils/asyncHandler.js";
   
   router.get("/:projectId", asyncHandler(async (req, res) => {
     const project = await Project.findById(req.params.projectId);
     res.json(project);
   }));
   ```

4. **Logging:** Use Winston logger for all logs
   ```typescript
   import logger from "../logger/logger.js";
   
   logger.info("Deployment started", { projectId, userId });
   logger.error("Build failed", { error, projectId });
   ```

5. **Comments:** Add comments for complex logic
   ```typescript
   // Generate OAuth state to prevent CSRF attacks
   const state = crypto.randomBytes(16).toString("hex");
   req.session.oauthState = state;
   ```

### Module Imports

- Use ES6 module imports with `.js` extensions for ESM compatibility
  ```typescript
  import express from "express";
  import { createProject } from "../controllers/projects.controller.js";
  ```

---

## Making Changes

### Workflow: From Issue to Pull Request

**This is the ONLY approved way to contribute:**

```
1. Find an Issue → 2. Get Assigned → 3. Discuss Approach → 4. Code → 5. Test → 6. Create PR → 7. Review
```

### Step 1: Select an Issue

- ✅ Look for [issues with "good first issue"](https://github.com/atithi4dev/veren/labels/good%20first%20issue) label if new
- ✅ Look for [issues with "help wanted"](https://github.com/atithi4dev/veren/labels/help%20wanted) label
- ✅ Check the issue **Requirements** and **Description** carefully
- ❌ **DO NOT** start working without issue assignment

### Step 2: Request Assignment

1. Comment on the issue: **"I'd like to work on this issue"**
2. **Wait** for maintainer/mentor to assign it to you
3. Once assigned, you're authorized to work on it
4. ❌ **DO NOT** start without being assigned

### Step 3: Discuss Your Approach

1. In the issue, **describe your approach** before coding:
   - What files you'll modify
   - What functions/services you'll touch
   - Any design decisions
   - Questions about requirements
2. **Wait for feedback** from mentors
3. Get **approval** before starting implementation
4. This prevents wasted effort on wrong approaches

### 1. Create a Feature Branch

```bash
# Always reference the issue number in branch name
git checkout -b feature/issue-<issue-number>-brief-description
# or
git checkout -b fix/issue-<issue-number>-brief-description

# Examples:
# feature/issue-45-add-rate-limiting
# fix/issue-78-handle-null-in-env
```

**Branch Naming Convention (Strict):**
- Features: `feature/issue-<num>-feature-name`
- Bug fixes: `fix/issue-<num>-bug-name`
- Improvements: `improvement/issue-<num>-improvement-name`
- Documentation: `docs/issue-<num>-doc-name`

### 2. Make Your Changes

- Keep commits atomic and focused
- Write clear commit messages
- Follow [Code Guidelines](#code-guidelines)
- Follow established [patterns](#code-style)
  ```bash
  git commit -m "feat(issue-45): add rate limiting middleware"
  git commit -m "fix(issue-78): handle null environment variables"
  git commit -m "docs(issue-50): update API docs for new auth endpoint"
  ```

### 3. Follow Commit Message Format

Use conventional commits with issue reference:
- `feat(issue-#):` New feature
- `fix(issue-#):` Bug fix
- `docs(issue-#):` Documentation
- `refactor(issue-#):` Code refactoring
- `perf(issue-#):` Performance improvement
- `test(issue-#):` Test-related changes
- `chore(issue-#):` Maintenance tasks

### 4. Code Review Checklist

Before submitting a PR, **MUST** ensure:
- [ ] Discussed approach in issue and got approval
- [ ] Code follows style guidelines exactly
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Tests pass if applicable (`npm test`)
- [ ] No console.log statements left in code
- [ ] Error handling is proper
- [ ] Comments explain complex logic
- [ ] PR description clearly references the issue
- [ ] Branch name includes issue number
- [ ] Following conventional commit format

---

## Testing

### Setting Up Tests

```bash
# Install testing dependencies (if not already installed)
npm install --save-dev jest @types/jest ts-jest

# Create jest.config.js in the service directory
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Create test files alongside source files with `.test.ts` or `.spec.ts` extension:

```typescript
// src/controllers/projects.controller.test.ts
import { createProject } from "./projects.controller";
import Project from "../models/project.model";

jest.mock("../models/project.model");

describe("createProject", () => {
  it("should create a new project with valid input", async () => {
    const mockProject = {
      _id: "1",
      name: "test-project",
      userId: "user-1"
    };
    
    (Project.create as jest.Mock).mockResolvedValue(mockProject);
    
    const req = {
      body: { name: "test-project" },
      user: { _id: "user-1" }
    };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    
    await createProject(req as any, res as any);
    
    expect(Project.create).toHaveBeenCalledWith({
      name: "test-project",
      userId: "user-1"
    });
  });

  it("should return error for missing project name", async () => {
    // Test validation...
  });
});
```

### Test Coverage Goals

- **Controllers:** 80%+ coverage
- **Services:** 85%+ coverage
- **Utils:** 90%+ coverage
- **Critical paths:** 100% coverage

---

## Submitting Changes

### ⚠️ Important: Pull Request Workflow

**This is the ONLY way code gets merged. Direct pushes to main are BLOCKED.**

### 1. Push to Your Feature Branch

```bash
# Push YOUR branch (NOT main)
git push origin feature/issue-<num>-your-feature-name
# or
git push origin fix/issue-<num>-your-bugfix

# ❌ NEVER push directly to main
# ❌ NEVER force push
```

### 2. Create a Pull Request (Required)

**You MUST open a PR to merge code. No direct pushes allowed.**

On GitHub:
1. Go to the repository
2. Click "New Pull Request" or use the auto-prompt
3. **Set target branch:** `main` 
4. **Set source branch:** Your feature branch (e.g., `feature/issue-45-add-logging`)
5. Fill in the PR template completely:

```markdown
## Issue
Closes #<issue-number>

## Description
Brief description of the changes made

## Type of Change
- [x] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #123

## How Has This Been Tested?
- Created unit tests
- Tested locally on Docker
- Verified with all services running

## Screenshots (if applicable)
Add screenshots for API/UI changes

## Checklist
- [x] I have read CONTRIBUTING.md completely
- [x] I have read API_DOCUMENTATION.md
- [x] Code follows style guidelines
- [x] TypeScript compiles without errors
- [x] Tests pass (npm test)
- [x] No console logs left in code
- [x] Error handling is proper
- [x] Documentation is updated
- [x] My branch includes issue number
- [x] Commits follow conventional format
```

### 3. Code Review Process

**Your PR will NOT be merged until:**
- ✅ At least **1 maintainer/mentor review** completed
- ✅ **All feedback addressed** and discussed
- ✅ All **automated checks pass** (TypeScript, tests, linting)
- ✅ **No conflicts** with main branch

**During review:**
- Be open to feedback and suggestions
- Ask clarifying questions if needed
- Iterate on feedback - this is normal!
- Don't take criticism personally - it's about code quality

### 4. Merging Requirements

Once approved, **ONLY maintainers can merge.** They will:
- ✅ Ensure branch is up to date with main
- ✅ Squash commits into one clean commit
- ✅ Use conventional commit message
- ✅ Delete your feature branch

**You as contributor:**
- ✅ Wait for maintainer to merge
- ❌ DO NOT merge your own PR
- ❌ DO NOT delete main branch
- ❌ DO NOT force push after review

---

## Best Practices for PR Success

1. **Small, Focused PRs are better**
   - Split large features into multiple PRs
   - Each PR should solve ONE problem
   - Easier to review = faster merge

2. **Descriptive Commit Messages**
   - Use conventional format: `feat(issue-45): add rate limiting`
   - First line maximum 50 characters
   - Details in subsequent lines if needed

3. **Keep PR Updated**
   - Rebase/merge main if it gets ahead
   - Resolve conflicts early
   - Keep communication in PR thread

4. **Test Before Submitting**
   - Run `npm run build` - no TypeScript errors
   - Run `npm test` - all tests pass
   - Manually test the feature
   - Test edge cases

5. **Follow the Discussion**
   - Read comments on the issue
   - Follow mentor guidance
   - Ask questions in the PR
   - Don't ignore feedback

---

## Submitting Changes - Quick Checklist

- [ ] Issue is assigned to me
- [ ] I discussed my approach in the issue
- [ ] I got approval from a mentor
- [ ] Branch name: `feature/issue-<num>-name` or `fix/issue-<num>-name`
- [ ] Code follows [Code Guidelines](#code-guidelines)
- [ ] Code follows [Naming Conventions](#naming-conventions)
- [ ] Commits use conventional format with issue number
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] No console.log in code
- [ ] PR description has issue number
- [ ] PR template is filled completely
- [ ] I'm NOT force pushing or merging myself
- [ ] I'm waiting for maintainer review and merge

---

## Common Issues & Solutions

### Issue: Database Connection Fails

**Symptoms:** `MongoNetworkError` or `PostgreSQL connection refused`

**Solutions:**
```bash
# Check if Docker containers are running
docker compose ps

# Restart services
docker compose restart

# Check connection strings in .env files
cat .env | grep CONN_STRING

# Verify database is accessible
mongosh  # For MongoDB
```

### Issue: Redis Connection Error

**Symptoms:** `ECONNREFUSED` or "Redis is not connected"

**Solutions:**
```bash
# Ensure Redis container is running
docker compose logs redis

# Check Redis connection
redis-cli ping  # Should respond with PONG

# Verify Redis URL in .env
echo $REDIS_URL
```

### Issue: Port Already in Use

**Symptoms:** `EADDRINUSE: address already in use :::3000`

**Solutions:**
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Issue: TypeScript Compilation Error

**Symptoms:** `error TS2307: Cannot find module`

**Solutions:**
```bash
# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript configuration
cat tsconfig.json

# Clear build cache
rm -rf dist
npm run build
```

### Issue: GitHub OAuth Fails

**Symptoms:** `Missing Github Credentials` or `Redirect URI mismatch`

**Solutions:**
```bash
# Verify credentials in .env
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET

# Check GitHub OAuth app settings:
# 1. Go to GitHub Settings > Developer settings > OAuth Apps
# 2. Verify Redirect URI matches: http://localhost:3000/api/v1/auth/callback
# 3. Ensure Client ID and Secret match .env
```

### Issue: Build Worker Hangs

**Symptoms:** Deployment status stuck in "pending" or "building"

**Solutions:**
```bash
# Check worker logs
docker compose logs build-worker

# Check job queue
redis-cli
> KEYS "bull:*"  # View queue jobs

# Restart workers
docker compose restart build-worker clone-worker

# Clear stalled jobs
npm run queue:clear
```

---

## Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference for all endpoints
- [Testing Verdict](./TESTING_VERDICT.txt) - Testing strategies and results
- [Final Verdict](./FINAL_VERDICT.txt) - Architecture decisions and verdicts

### External Resources
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Guide](https://jwt.io/introduction)
- [Docker Documentation](https://docs.docker.com/)

### Community & Support
- **GitHub Issues:** [Report bugs and request features](https://github.com/atithi4dev/veren/issues)
- **GitHub Discussions:** [Ask questions and discuss ideas](https://discord.gg/tACgSEYz)
- **Email:** Contact the maintainer for sensitive issues 

### Development Tools

**Recommended VS Code Extensions:**
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- REST Client
- MongoDB for VS Code
- PostgreSQL
- Docker
- Thunder Client (for API testing)

**Command-Line Tools:**
```bash
# Redis CLI for queue inspection
redis-cli

# MongoDB shell
mongosh

# PostgreSQL client
psql

# Node package manager
npm / yarn

# Docker & Docker Compose
docker
docker compose
```

---

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Expected Behavior
- Be professional and kind
- Welcome newcomers
- Focus on constructive criticism
- Report violations to maintainers

### Unacceptable Behavior
- Harassment or discrimination
- Hostile comments
- Spam or self-promotion
- Sharing private information

---

## Questions? Need Help?

### Before Asking - READ FIRST ✅

**You MUST read these before asking any questions:**
1. ✅ **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
2. ✅ **[CONTRIBUTING.md](#contributing-to-veren-backend)** - This entire file
3. ✅ **[Code Guidelines](#code-guidelines)** section
4. ✅ **[Common Issues & Solutions](#common-issues--solutions)** section
5. ✅ **Existing [GitHub Issues](https://github.com/atithi4dev/veren/issues)** - Your question might already be answered

**Why we require this:**
- Saves everyone's time (answers are already documented)
- Shows you're serious about contributing
- Helps you understand the project better
- Demonstrates self-sufficiency

### Getting Help - The Right Way

**For Development Questions:**
1. ✅ Search [Common Issues & Solutions](#common-issues--solutions) above
2. ✅ Check [GitHub Issues](https://github.com/atithi4dev/veren/issues) - search first!
3. ✅ Ask in the issue you're assigned to (NOT in a new issue)
4. ✅ Be specific: Include error messages, what you tried, what happened
5. ✅ Ask in [GitHub Discussions](https://github.com/atithi4dev/veren/discussions) for general questions

**For Setup/Installation Help:**
- Follow [Development Setup](#development-setup) exactly
- Check your `.env` files are correct
- Verify Docker containers are running: `docker compose ps`
- Check logs: `docker compose logs <service-name>`

**For API-Related Questions:**
- Consult [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) first
- Check request/response examples in the docs
- Test API using the curl examples provided

**For Code Pattern Questions:**
- Review existing similar code in the repository
- Follow the patterns already established
- Ask in the issue thread before implementing differently

### Emergency / Sensitive Issues

**Contact maintainers directly for:**
- Security vulnerabilities
- Sensitive bugs
- Private concerns about project direction
- Email the maintainer (check GitHub profile)

---

## Changelog & Contributions

### Recent Contributions
We appreciate all contributions! Check the [GitHub Contributors](https://github.com/atithi4dev/veren/graphs/contributors) page to see who's helped improve Veren.

### Your First Contribution - Quick Checklist

- [ ] Read entire [CONTRIBUTING.md](#contributing-to-veren-backend)
- [ ] Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [ ] Set up environment per [Development Setup](#development-setup)
- [ ] Find [issue with "good first issue"](https://github.com/atithi4dev/veren/issues?q=label%3A%22good+first+issue%22) label
- [ ] Comment requesting assignment
- [ ] Wait for maintainer assignment
- [ ] Discuss your approach in issue
- [ ] Get approval from mentor
- [ ] Follow [Making Changes](#making-changes) workflow
- [ ] Create PR with issue number
- [ ] Respond to review feedback
- [ ] Wait for maintainer to merge

---

## Success Checklist for Contributors

### Before Starting ANY Work
- [ ] Read CONTRIBUTING.md ⬅️ You are here!
- [ ] Read API_DOCUMENTATION.md
- [ ] Environment is set up correctly
- [ ] You can run `sudo docker compose -f docker-compose.dev.yml up`
- [ ] Health check passes: `curl http://localhost:8001/api/v1/healthcheck`

### Before Coding
- [ ] Found an issue to work on
- [ ] Issue is assigned to you
- [ ] Discussed approach in issue
- [ ] Got approval from mentor
- [ ] You understand the requirements

### Before Creating PR
- [ ] Code follows all [Code Guidelines](#code-guidelines)
- [ ] `npm run build` passes without errors
- [ ] `npm test` passes all tests
- [ ] No `console.log()` in code
- [ ] Branch name includes issue number
- [ ] Commits use conventional format
- [ ] PR description references issue

### Before Submitting PR
- [ ] Filled PR template completely
- [ ] Linked the issue with "Closes #123"
- [ ] No direct pushes to main
- [ ] Ready to handle feedback
- [ ] Understand review takes time

---

**Thank you for contributing to Veren! Your efforts help improve the project for everyone.** 🚀

**Remember: Quality over Speed. Take time to understand the codebase and follow the guidelines. We appreciate contributors who invest in learning!**

**Happy coding!**