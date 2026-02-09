# Repository Owner Setup Required

## ⚠️ Action Required for Repository Owner

The repository has been configured to use a **`develop` branch workflow**. To enforce this properly, the repository owner needs to set up branch protection rules on GitHub.

## 🚀 Owner Privileges

As the repository owner (`atithi4dev`), you have special access:

✅ **Direct push to `main`** - No restrictions, workflows skip automatically  
✅ **Create PRs to `main`** - From `develop` or any branch  
✅ **Bypass all checks** - GitHub Actions workflows won't block you  
✅ **Merge without approval** - When branch protection excludes administrators

Contributors **cannot** push to `main` directly - they must go through `develop`.

---

## Branch Protection Setup

### 1. Create the `develop` Branch

If it doesn't exist yet:
```bash
git checkout -b develop
git push origin develop
```

### 2. Configure Branch Protection for `main`

Go to: **Settings** → **Branches** → **Add branch protection rule**

**Branch name pattern:** `main`

**Required settings:**
- ✅ Require a pull request before merging
  - ✅ Require approvals: **1** (minimum)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - Select required checks:
    - `protect-main`
    - `validate-pr-content`
    - `code-quality` (if applicable)
- ✅ Require conversation resolution before merging
- ❌ **Do NOT check** "Include administrators" - This allows repository owner to push directly to `main`
- ❌ **Do NOT restrict** who can push to matching branches - Owner needs direct push access

### 3. Configure Branch Protection for `develop`

Go to: **Settings** → **Branches** → **Add branch protection rule**

**Branch name pattern:** `develop`

**Required settings:**
- ✅ Require a pull request before merging
  - ✅ Require approvals: **1** (minimum)
- ✅ Require status checks to pass before merging
  - Select required checks:
    - `code-quality`
    - `validate-pr-content`
- ✅ Require conversation resolution before merging

### 4. Set `develop` as Default Branch (Optional)

Go to: **Settings** → **General** → **Default branch**

- Change from `main` to `develop`
- This makes contributor PRs automatically target `develop`

---

## Workflow Summary

```
Contributors → feature/fix branches → PR to develop → Merge
                                                        ↓
Owner/Admins → develop → PR to main OR direct push to main → Release
```

### For Contributors:
1. Branch from `main`: `git checkout -b feature/issue-123-description`
2. Make changes and commit
3. Open PR to **`develop`** branch
4. Get review and merge

### For Repository Owner:
**Option 1: Direct Push (Recommended for quick fixes)**
```bash
git checkout main
git pull origin main
# Make changes
git commit -m "chore: quick fix or release"
git push origin main
```

**Option 2: PR from develop (Recommended for releases)**
1. When ready to release, create PR from `develop` to `main`
2. The workflow will recognize you as owner and allow the PR
3. Merge to `main` for production release

---

## Benefits of This Setup

✅ **Quality Control:** All contributions reviewed before hitting `main`  
✅ **Stable Main:** `main` always contains production-ready code  
✅ **Integration Testing:** Test multiple features together in `develop`  
✅ **Clear Release Points:** Explicit PR from `develop` → `main` for releases  
✅ **Owner Flexibility:** Repository owner can push directly for hotfixes and quick updates  
✅ **Contributor Safety:** Contributors guided through proper workflow without direct `main` access  

---

## GitHub Permissions

The workflows use these permissions:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- Owner bypass is configured in `.github/workflows/protect-main.yml`:
  ```yaml
  const AUTHORIZED_ADMINS = ['atithi4dev'];
  ```

Add more admins to this array if needed.

### How Owner Bypass Works:

**For Direct Pushes:**
- GitHub Actions workflows skip entirely when `github.actor == 'atithi4dev'`
- Branch protection is NOT enforced for administrators (when "Include administrators" is unchecked)
- You can push directly to `main` without any restrictions

**For Pull Requests:**
- Workflows run but recognize you as authorized owner
- Allows PRs from `develop` → `main`
- Still validates commit messages and PR structure for consistency

---

## Testing the Setup

**Test 1: Contributor Workflow (should be blocked)**
1. **Create a test branch:** `git checkout -b feature/test-workflow`
2. **Make a small change** (e.g., update README)
3. **Push and create PR to `main`** → Should be blocked by workflow
4. **Close and create PR to `develop`** → Should pass

**Test 2: Owner Direct Push (should work)**
1. **Checkout main:** `git checkout main`
2. **Make a small change** (e.g., add a comment)
3. **Commit and push:** `git commit -m "test: owner direct push" && git push origin main`
4. **Verify:** Push succeeds without restrictions

**Test 3: Owner PR from develop to main (should work)**
1. **Make changes in develop branch**
2. **Create PR from `develop` to `main`**
3. **Verify:** Workflow recognizes you as owner and allows merge

---

For questions, see [CONTRIBUTING.md](../Docs/CONTRIBUTING.md) or [GitHub Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
