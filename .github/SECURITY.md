# Security Policy

## Reporting Security Vulnerabilities

The Veren team takes security seriously. If you discover a security vulnerability, please **do not** create a public GitHub issue. Instead, follow these steps:

### How to Report

1. **Email:** Send a detailed report to the project maintainers (you can find contact info in the main README)
2. **Subject Line:** Start with `[SECURITY]` and include a brief description
3. **Include Details:**
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Suggested fix (if you have one)
   - Your contact information

### Response Timeline

- **Initial Response:** 48 hours
- **Confirmation:** 7 days
- **Fix Plan:** 14 days
- **Public Disclosure:** Coordinated with security researchers (typically 90 days)

## Security Best Practices

### For Contributors

1. **Never commit secrets** - Ensure no API keys, tokens, or credentials are in the codebase
   - Use `.env` files for local configuration
   - Reference [CONTRIBUTING.md](../CONTRIBUTING.md) for proper `.env` setup

2. **Authentication & Authorization**
   - Always validate user permissions before operations
   - Use JWT tokens with proper expiry (15 minutes for access tokens)
   - Implement refresh token rotation (7 days for refresh tokens)
   - Never store passwords in plain text

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Sanitize user inputs to prevent injection attacks
   - Validate file uploads (size, type, content)

4. **Dependencies**
   - Keep dependencies up to date
   - Run `npm audit` regularly and fix vulnerabilities
   - Review dependency license compliance
   - Be cautious with transitive dependencies

5. **Code Security**
   - Use prepared statements for database queries (guard against SQL injection)
   - Never concatenate strings into commands
   - Implement proper error handling (don't leak implementation details)
   - Use security headers (HSTS, CSP, X-Frame-Options)
   - Validate and sanitize all external inputs

### For Reviewers

- Look for potential security issues during code review
- Question any changes to authentication/authorization
- Check for hardcoded secrets or credentials
- Verify dependency changes
- Test for common vulnerabilities (OWASP Top 10)

### Service-Specific Security

#### API Gateway
- Validates all incoming requests
- Implements rate limiting
- Authenticates all requests (except public endpoints)
- Validates webhook signatures from workers

#### Build Worker & Clone Worker
- Only processes authenticated requests from API Gateway
- Validates project ownership before operations
- Runs untrusted code in isolated environments
- Cleans up temporary files and secrets

#### Database Layer
- Uses environment variables for connection strings
- Implements query parameterization
- Restricts database user permissions
- Has backup and recovery procedures

#### Authentication
- GitHub OAuth integration with secure state validation
- JWT tokens with short expiry times
- Refresh token rotation
- Session invalidation on logout

## Dependencies & Vulnerabilities

### Current Security Configuration

```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "audit": "All dependencies scanned regularly with 'npm audit'"
}
```

### Checking for Vulnerabilities

Run these commands regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if safe)
npm audit fix

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Vulnerable Dependency Handling

If a vulnerability is found in a dependency:

1. Check GitHub Security Advisories for recommendations
2. Update to the patched version if available
3. If no patch exists, consider alternatives
4. Document the vulnerability and mitigation in the PR

## Environment Security

### Required Environment Variables

Never commit these - always use `.env` files (see [CONTRIBUTING.md](../CONTRIBUTING.md)):

```
DATABASE_URL
MONGODB_URI
REDIS_URL
JWT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_WEBHOOK_SECRET
```

These should NEVER be:
- Logged to console
- Sent in unencrypted channels
- Committed to version control
- Exposed in error messages

## Docker Security

### Image Security

- Use specific version tags (never `latest`)
- Scan images for vulnerabilities: `docker scan <image>`
- Build from trusted base images
- Minimize image layers and size
- Don't run as root in containers

### Container Runtime

- Use read-only root filesystem when possible
- Implement resource limits (CPU, memory)
- Use security scanning in CI/CD
- Keep Docker updated

## Infrastructure Security

### General Principles

- Principle of least privilege - only grant minimum necessary permissions
- Defense in depth - multiple security layers
- Regular updates and patches
- Audit logging for all operations
- Secure communication (HTTPS/TLS)

### Network Security

- Use firewalls to restrict traffic
- Implement service-to-service authentication
- Use VPCs or private networks when possible
- Monitor unusual traffic patterns

## Compliance & Standards

This project follows these security standards:

- **OWASP Top 10 Prevention**
- **CWE (Common Weakness Enumeration)** recommendations
- **Data Protection**
  - GDPR compliance for user data
  - Data retention policies
  - User consent for data collection

## Security Review Process

All PRs should consider:

- [ ] No secrets exposed
- [ ] Authentication/authorization properly implemented
- [ ] Input validation present
- [ ] Error handling doesn't leak information
- [ ] Dependencies updated if needed
- [ ] SQL injection/injection attacks prevented
- [ ] XSS vulnerabilities addressed
- [ ] CSRF protection implemented
- [ ] Rate limiting configured
- [ ] Logging doesn't expose sensitive data

## Regular Security Activities

1. **Monthly:** `npm audit` checks and updates
2. **Quarterly:** Security review of auth system
3. **Annually:** Full penetration testing (recommended)
4. **Always:** Review security-related issues on GitHub

## Contact & Escalation

For security concerns or disclosures:

- **Project Maintainers:** [Contact info from main README]
- **GitHub Security Advisory:** [GitHub repo security tab]
- **Emergency Contact:** Available in private repo documentation

## Acknowledgments

We appreciate security researchers and contributors who responsibly disclose vulnerabilities to help us maintain a secure project.

---

**Last Updated:** 2024
**Next Review:** Quarterly
