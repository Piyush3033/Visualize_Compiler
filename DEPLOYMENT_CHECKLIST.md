# Pre-Deployment Checklist

Complete this checklist before deploying to production.

## Code Quality

- [ ] **Lint Check**
  ```bash
  pnpm lint
  # Fix any warnings and errors
  ```

- [ ] **Type Check**
  ```bash
  pnpm type-check
  # Resolve all TypeScript errors
  ```

- [ ] **Build Successfully**
  ```bash
  pnpm build
  # Ensure no build errors
  ```

- [ ] **No Console Errors**
  - Test locally with DevTools open
  - Check for any console warnings

- [ ] **Code Review**
  - Get approval from team lead
  - Address all feedback

## Testing

- [ ] **Unit Tests Pass**
  ```bash
  pnpm test
  # All tests should pass
  ```

- [ ] **Integration Tests Pass**
  - Test API endpoints
  - Test compilation pipeline

- [ ] **Manual Testing**
  - [ ] Simple C program
  - [ ] Complex C program with structs
  - [ ] Function pointers
  - [ ] Error cases (syntax errors)
  - [ ] Large code files
  - [ ] Export functionality

- [ ] **Cross-browser Testing**
  - [ ] Chrome/Chromium
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Responsive Testing**
  - [ ] Desktop (1920x1080)
  - [ ] Laptop (1366x768)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)

## Security

- [ ] **Environment Variables**
  ```bash
  # Ensure all required env vars are set
  cat .env.production | grep -v "^#"
  ```

- [ ] **Secrets Not Committed**
  ```bash
  git log --all --oneline | grep -i "secret\|key\|password"
  # Should return nothing
  ```

- [ ] **Dependencies Updated**
  ```bash
  pnpm audit
  # Fix any critical vulnerabilities
  ```

- [ ] **No Debug Code**
  - Remove `console.log()` statements
  - Remove debug flags
  - Remove test-only code

- [ ] **CORS Configured**
  - Verify allowed origins
  - Test cross-origin requests

- [ ] **Rate Limiting Enabled**
  - API rate limits set
  - Tested under load

- [ ] **SQL Injection Prevention** (if applicable)
  - All queries parameterized
  - No string concatenation

## Performance

- [ ] **Build Size Optimized**
  ```bash
  pnpm build
  # Check next/bundle-analyzer
  ```

- [ ] **Images Optimized**
  - All images compressed
  - Using next/image component

- [ ] **Bundle Split Optimized**
  - Code splitting configured
  - No duplicate packages

- [ ] **Caching Configured**
  - Static assets cached (1 year)
  - API responses cached appropriately

- [ ] **Compression Enabled**
  - Gzip enabled
  - Brotli enabled (optional)

- [ ] **Database Optimized** (if applicable)
  - Indexes created
  - Queries optimized
  - Connection pooling configured

## Monitoring & Logging

- [ ] **Error Tracking Setup**
  - Sentry configured (or alternative)
  - Email alerts enabled
  - Slack notifications (optional)

- [ ] **Logging Configured**
  - Log level set appropriately
  - Log rotation configured
  - Sensitive data not logged

- [ ] **Performance Monitoring**
  - APM configured (if applicable)
  - Critical paths monitored
  - Slow query logging enabled

- [ ] **Uptime Monitoring**
  - Health check endpoint working
  - Monitoring service configured
  - Alert thresholds set

## Infrastructure

- [ ] **Database Migrations**
  - All migrations applied
  - Rollback plan documented
  - Backup taken

- [ ] **Backup System**
  - Automated backups configured
  - Restore process tested
  - Backup storage verified

- [ ] **SSL/TLS Certificate**
  - Valid certificate installed
  - Auto-renewal configured
  - Expires in > 30 days

- [ ] **DNS Configured**
  - A records correct
  - CNAME records correct
  - MX records (if email enabled)
  - SPF, DKIM, DMARC (if email enabled)

- [ ] **Firewall Rules**
  - Only necessary ports open
  - DDoS protection enabled
  - IP whitelisting (if applicable)

## Documentation

- [ ] **README Updated**
  - Installation instructions current
  - Feature list complete
  - Known issues documented

- [ ] **API Documentation Current**
  - Endpoints documented
  - Examples updated
  - Response formats correct

- [ ] **Deployment Documentation**
  - Deployment steps clear
  - Rollback procedures documented
  - Runbooks created

- [ ] **Environment Documentation**
  - All env vars documented
  - Secrets management explained
  - Configuration instructions clear

## Team Communication

- [ ] **Stakeholders Notified**
  - Product owners informed
  - Support team briefed
  - Marketing (if applicable) notified

- [ ] **Runbook Prepared**
  - Deployment steps documented
  - Rollback procedures ready
  - Escalation contacts listed

- [ ] **Incident Response Plan**
  - On-call schedule updated
  - Incident procedures documented
  - Communication channels ready

- [ ] **Release Notes**
  - Changes summarized
  - New features highlighted
  - Breaking changes noted
  - Migration instructions (if applicable)

## Deployment Execution

### Pre-Deployment (1 hour before)

- [ ] **Final Verification**
  ```bash
  # Pull latest main branch
  git checkout main
  git pull upstream main
  
  # Run final checks
  pnpm lint
  pnpm type-check
  pnpm build
  pnpm test
  ```

- [ ] **Notify Team**
  - Post in #deployments channel
  - Alert on-call engineer
  - Notify support team

- [ ] **Enable Maintenance Mode** (if applicable)
  ```
  POST /api/admin/maintenance
  { "enabled": true, "message": "Deployment in progress" }
  ```

### During Deployment

- [ ] **Deploy to Staging First** (if available)
  ```bash
  # Deploy to staging/preview environment
  # Smoke test on staging
  ```

- [ ] **Monitor Deployment**
  - Watch build logs
  - Monitor error tracking
  - Monitor performance metrics

- [ ] **Deploy to Production**
  ```bash
  pnpm deploy --prod
  # or use your deployment tool
  ```

- [ ] **Monitor Post-Deployment**
  - Watch error tracking service
  - Monitor performance
  - Monitor logs
  - Check uptime monitoring

### Post-Deployment (1 hour after)

- [ ] **Smoke Testing**
  - Test main user flows
  - Verify API endpoints
  - Check database connectivity
  - Verify file uploads (if applicable)

- [ ] **Performance Check**
  - Check page load times
  - Check API response times
  - Verify no new errors

- [ ] **Disable Maintenance Mode** (if enabled)
  ```
  POST /api/admin/maintenance
  { "enabled": false }
  ```

- [ ] **Notify Success**
  - Post in #deployments channel
  - Update status page (if applicable)
  - Notify stakeholders

## Rollback Plan

Keep this ready in case issues arise:

- [ ] **Rollback Procedure Documented**
  - Previous version tagged
  - Database rollback steps
  - Cache clear commands
  - DNS revert steps

- [ ] **Quick Rollback Commands**
  ```bash
  # Example rollback
  git checkout v1.0.0
  pnpm build
  pnpm deploy --prod
  ```

- [ ] **Communication Plan**
  - Who to notify
  - Message templates prepared
  - Incident channels open

## Post-Deployment Monitoring

First 24 Hours:

- [ ] **Error Rate Normal**
  - No spike in error rate
  - No critical errors

- [ ] **Performance Normal**
  - Response times stable
  - No slow queries
  - Memory usage normal

- [ ] **User Reports**
  - Monitor support channels
  - Respond to issues quickly

- [ ] **Metrics**
  - Check key metrics dashboard
  - Verify improvements (if applicable)
  - Document any regressions

## Sign-Off

- [ ] **Deployment Successful**
  ```
  Deployed: _______________
  Deployed By: _______________
  Time: _______________
  Issues: _______________
  ```

- [ ] **Release Notes Posted**
  - Changelog updated
  - Blog post (if applicable) published
  - Social media (if applicable) updated

- [ ] **Post-Mortem (if issues)**
  - Schedule within 24 hours
  - Document root cause
  - Create action items
  - Prevent future issues

---

## Important Notes

⚠️ **Never Skip Steps** - Each item is important for production quality

⚠️ **Document Issues** - Record any problems encountered for future reference

⚠️ **Keep Team Informed** - Communication is key to smooth deployments

⚠️ **Test Rollback** - Make sure you can rollback before deploying

✅ **When In Doubt** - Ask for help, better safe than sorry

---

**Deployment Status**: Ready ✅

**Last Updated**: 2026-05-27  
**Version**: 1.0.0

For any issues during deployment, contact the DevOps team.
