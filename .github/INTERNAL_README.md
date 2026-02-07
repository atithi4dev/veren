# GitHub Governance & Automation

This directory contains GitHub Actions workflows and configurations that enforce development standards and project governance for the Veren backend repository.

## Overview

The GitHub automation system provides:

- ✅ **Branch Protection** - Prevent direct pushes to `main`
- ✅ **PR Validation** - Enforce PR templates and commit formats
- ✅ **Issue Management** - Automated assignment workflow (`/assign` command)
- ✅ **Code Quality** - TypeScript checks, linting, security audits
- ✅ **Label Management** - Auto-creation and guidance for issue labels

## Workflows

### 1. `protect-main.yml`
**Purpose:** Enforce branch protection rules and PR validation

**Triggers:** `pull_request` (opened, reopened, synchronize)

**Jobs:**
- `protect-main` - Rejects PRs targeting `main` branch
- `validate-pr-content` - Ensures PR follows template with required sections:
  - Issue reference (e.g., "Closes #123")
  - Description
  - Type of Change
  - Checklist
- `assign-check` - Warns about manual issue assignment in PRs

**Branch Naming Validation:**
- ✅ `feature/issue-123-description`
- ✅ `fix/issue-456-description`
- ✅ `docs/issue-789-update`
- ✅ `refactor/issue-101-cleanup`
- ✅ `perf/issue-202-optimization`

### 2. `issue-assignment.yml`
**Purpose:** Manage issue assignment via `/assign` command

**Triggers:** `issue_comment` (created, edited)

**Jobs:**
- `assign-issue` - Processes `/assign @username` commands in issue comments
  - Validates GitHub user exists
  - Assigns issue to mentioned user
  - Adds 'assigned' label
  - Posts confirmation comment
- `prevent-auto-assignment` - Removes any auto-assignments when issue is created
  - Explains `/assign` command requirement

**Usage:**
```
/assign @github-username
```

### 3. `auto-manage-labels.yml`
**Purpose:** Automatically create and manage repository labels

**Triggers:** `issues` (opened, labeled, unlabeled), manual (`workflow_dispatch`)

**Jobs:**
- `setup-labels` - Creates all standard labels on first run or update
- `validate-new-issue-labels` - Suggests labels for newly opened issues without labels

**Label Categories:**

**Difficulty Levels:**
- `easy` - Good for beginners
- `medium` - Moderate complexity
- `hard` - High complexity

**Priority Levels:**
- `priority-critical` - Must fix immediately
- `priority-high` - High priority
- `priority-medium` - Medium priority
- `priority-low` - Can wait

**Issue Types:**
- `bug` - Bug report
- `feature` - Feature request
- `enhancement` - Improvement
- `documentation` - Docs update
- `performance` - Performance improvement
- `refactor` - Code refactoring
- `security` - Security issue
- `testing` - Test-related

**Status:**
- `good-first-issue` - Great for new contributors
- `help-wanted` - Help needed
- `assigned` - Issue is assigned
- `in-progress` - Being worked on
- `on-hold` - Blocked/waiting
- `needs-review` - Awaiting review
- `blocked` - Blocked by another issue
- `duplicate` - Duplicate issue
- `wontfix` - Will not fix
- `question` - Question/discussion

**Areas:**
- `area-api-gateway` - API Gateway service
- `area-workers` - Worker services
- `area-database` - Database layer
- `area-auth` - Authentication
- `area-deployment` - Deployment system
- `area-infrastructure` - Infrastructure

### 4. `code-quality.yml`
**Purpose:** Verify code quality, run tests, and security audits

**Triggers:** `pull_request` (all branches), `push` (test branch)

**Jobs:**
- `lint-and-type-check` - Checks TypeScript compilation for all services
- `security-audit` - Runs `npm audit` on all packages
- `build-check` - Verifies builds succeed for all services

**Services Checked:**
- API Gateway
- Build Worker
- Clone Worker
- Routing Service
- Orchestrate Service
- Notification Service

**Requirements:**
- Node.js 18.x

### 5. `pr-review.yml`
**Purpose:** Validate PRs and ensure contributor guidelines compliance

**Triggers:** `pull_request` (all branches)

**Jobs:**
- `commit-validation` - Validates all commit messages follow format:
  ```
  type(issue-123): description
  ```
  Valid types: feat, fix, docs, style, refactor, perf, test, chore

- `pr-metadata-check` - Ensures PR contains:
  - Issue link (Closes/Fixes/Resolves #123)
  - Description (50+ characters)
  - Type of Change section
  - Checklist

- `prevent-direct-pushes` - Enforces PRs target `test` branch, not `main`

- `require-issue-assignment` - Verifies referenced issue is assigned to someone

- `commit-validation` - Checks all commits follow naming convention

## Configuration Files

### `pull_request_template.md`
Template shown when creating a pull request. Includes:
- Issue reference section
- Description area
- Type of Change checkboxes
- Testing information
- Checklist for contributors

### `ISSUE_TEMPLATE/`
Templates for different issue types:
- `bug_report.md` - For reporting bugs
- `feature_request.md` - For requesting features
- `documentation.md` - For documentation improvements

## Getting Started as a Contributor

### Step 1: Assignment
Create an issue (or find an existing one) and request assignment:
```
/assign @your-github-username
```

### Step 2: Branch Creation
Create a branch following the naming convention:
```bash
git checkout -b feature/issue-123-brief-description
# or
git checkout -b fix/issue-456-bug-fix-description
```

### Step 3: Development
Make your changes and commit with proper message format:
```bash
git commit -m "feat(issue-123): add new feature"
git commit -m "fix(issue-456): fix the bug"
```

### Step 4: Push & Create PR
```bash
git push origin feature/issue-123-brief-description
```

GitHub Actions will automatically:
- ✅ Validate your commit messages
- ✅ Check code quality
- ✅ Run security audits
- ✅ Verify metadata and formatting

### Step 5: Review
Respond to feedback and update your PR as needed. The workflows will re-run automatically.

## Viewing Workflow Status

1. Go to **Pull Requests** tab
2. Click on your PR
3. Scroll down to see workflow results
4. Check the "Checks" section for detailed information

## Troubleshooting Common Issues

### "PR targets main branch"
❌ **Problem:** You opened a PR to `main` instead of `develop`

✅ **Solution:**
1. Close this PR
2. Create a new PR to the `develop` branch
3. Follow the workflow for releases from `develop` → `main`

### "Commit message doesn't match format"
❌ **Problem:** Commit message like `"fixed bug"` or `"Update stuff"`

✅ **Solution:**
```bash
# You need to amend commits to match: type(issue-#): message
git commit --amend -m "fix(issue-456): resolve authentication error"
git push origin --force-with-lease
```

### "Issue not assigned"
❌ **Problem:** PR references an unassigned issue

✅ **Solution:**
1. Go to the referenced issue
2. Add a comment: `/assign @your-username`
3. Wait for automation to confirm
4. PR workflow will verify on next check

### "Missing PR template sections"
❌ **Problem:** PR missing required sections

✅ **Solution:**
1. Edit your PR description
2. Include all template sections from [pull_request_template.md](pull_request_template.md)
3. Fill each section with relevant information

### "Branch naming is wrong"
❌ **Problem:** Branch like `main-bug-fix` or `new-feature`

✅ **Solution:**
```bash
# Create correctly named branch
git checkout -b fix/issue-789-describe-the-fix
# Copy your changes if needed
git push origin fix/issue-789-describe-the-fix
```

## Manual Workflow Execution

To manually trigger label setup without waiting for issue event:

1. Go to **Actions** tab
2. Select **Auto-Manage Labels** workflow
3. Click **Run workflow**
4. Select branch (usually `test`)
5. Click **Run workflow**

## Security Considerations

All workflows:
- ✅ Use `actions/checkout@v4` and `actions/github-script@v7` (GitHub-verified actions)
- ✅ Have minimal required permissions
- ✅ Validate user input to prevent injection
- ✅ Never expose secrets in logs or comments
- ✅ Validate GitHub users before operations

For security policy, see [SECURITY.md](SECURITY.md)

## Monitoring & Logs

### View Workflow Logs
1. Go to **Actions** tab
2. Click on the workflow run
3. Click on the job name
4. Expand any step to see logs

### Common Log Locations
- **TypeScript errors** - `lint-and-type-check` job → `TypeScript Check` steps
- **Security issues** - `security-audit` job → Audit steps
- **PR validation** - `protect-main` job → GitHub Script output

## Disabling Workflows (if needed)

⚠️ **Not recommended**, but to disable a workflow:

1. In the `.github/workflows/` directory
2. Either:
   - Delete the workflow file, OR
   - Rename it to add `.disabled` extension, OR
   - Add `if: false` condition to all jobs

## Adding New Workflows

Follow these steps to add a new workflow:

1. Create `.github/workflows/your-workflow.yml`
2. Use `actions/checkout@v4` and `actions/github-script@v7`
3. Follow GitHub's YAML syntax
4. Test locally with [Act](https://github.com/nektos/act) if possible
5. Create PR to add workflow
6. Workflow will validate itself once added

Example minimal workflow:
```yaml
name: Your Workflow Name

on:
  pull_request:
    branches: [test, main]

jobs:
  example-job:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Do Something
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            console.log('Hello from workflow!');
```

## Contributing to Governance

To improve workflows or governance:

1. Create an issue describing the improvement
2. Get assigned via `/assign`
3. Make changes to `.github/` (including workflows, templates, or SECURITY.md)
4. Create PR to `test` branch
5. Reference the issue
6. Get review and merge

## Documentation References

- [CONTRIBUTING.md](../Docs/CONTRIBUTING.md) - Main contribution guide
- [SECURITY.md](SECURITY.md) - Security policy and best practices
- [API_DOCUMENTATION.md](../Docs/API_DOCUMENTATION.md) - API reference
- [GITHUB_SETUP.md](../Docs/GITHUB_SETUP.md) - GitHub governance setup guide
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Last Updated:** 2024
**Maintained By:** Veren Team
