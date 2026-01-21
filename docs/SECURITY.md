# Security Considerations

## Overview
This document outlines security considerations for the Windows VPS Web Installer and recommendations for production deployments.

## Current Security Posture

### ✅ What's Secure

1. **Password Handling**
   - Passwords are never written to disk
   - Stored only in memory for the duration of the job
   - Cleared when job completes or application restarts
   - Not logged or persisted

2. **SSH Connection**
   - Paramiko library used for secure SSH connections
   - Direct connection from backend to VPS
   - No intermediate proxy or storage

3. **Input Validation**
   - Pydantic models validate API inputs
   - Port numbers restricted to valid range
   - Required fields enforced

4. **Isolation**
   - Docker containers provide process isolation
   - Each job runs in separate thread
   - No shared state between jobs (except job dictionary)

### ⚠️ Known Limitations

1. **SSH Host Key Validation**
   - **Issue**: Uses `AutoAddPolicy()` which accepts any host key
   - **Risk**: Potential man-in-the-middle attack
   - **Justification**: 
     - VPS is in rescue mode (temporary environment, host keys change)
     - User explicitly provides and verifies credentials
     - Connection is short-lived and user-initiated
   - **Mitigation**: Document risk, recommend trusted networks

2. **No Authentication**
   - **Issue**: API endpoints are not authenticated
   - **Risk**: Anyone with network access can use the service
   - **Mitigation**: Deploy behind firewall or VPN

3. **No Rate Limiting**
   - **Issue**: No protection against API abuse
   - **Risk**: Resource exhaustion
   - **Mitigation**: Deploy with reverse proxy that implements rate limiting

4. **In-Memory Job Storage**
   - **Issue**: Jobs lost on restart, no persistence
   - **Risk**: Loss of job history and status
   - **Trade-off**: Enhances security (no credentials persistence)

## Production Recommendations

### Essential Security Measures

1. **Use HTTPS/TLS**
   ```nginx
   # Example nginx configuration
   server {
       listen 443 ssl http2;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://frontend:80;
       }
       
       location /api {
           proxy_pass http://backend:8000;
       }
   }
   ```

2. **Implement Authentication**
   - Add user authentication (JWT, OAuth2, or basic auth)
   - Example with FastAPI JWT:
   ```python
   from fastapi import Depends, HTTPException
   from fastapi.security import HTTPBearer
   
   security = HTTPBearer()
   
   @app.post("/api/jobs")
   async def create_job(
       credentials: VPSCredentials,
       token: str = Depends(security)
   ):
       # Verify token
       user = verify_token(token)
       # Create job...
   ```

3. **Network Isolation**
   - Deploy on private network or VPN
   - Use firewall rules to restrict access:
   ```bash
   # Example iptables rules
   iptables -A INPUT -p tcp --dport 80 -s TRUSTED_IP -j ACCEPT
   iptables -A INPUT -p tcp --dport 80 -j DROP
   ```

4. **Add Rate Limiting**
   - Use nginx limit_req module:
   ```nginx
   limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
   
   location /api {
       limit_req zone=api burst=5;
       proxy_pass http://backend:8000;
   }
   ```

5. **Enable Logging and Monitoring**
   ```python
   # Add logging configuration
   import logging
   
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       handlers=[
           logging.FileHandler('/var/log/windows-installer/app.log'),
           logging.StreamHandler()
       ]
   )
   ```

### Recommended Improvements

1. **Host Key Verification**
   ```python
   # Option 1: Use known_hosts file
   ssh.load_system_host_keys()
   ssh.set_missing_host_key_policy(paramiko.RejectPolicy())
   
   # Option 2: Store and verify specific host key
   expected_key = "ssh-rsa AAAAB3NzaC1yc2E..."
   ssh.get_host_keys().add(hostname, "ssh-rsa", expected_key)
   ```

2. **Certificate-Based Authentication**
   ```python
   # Use SSH keys instead of passwords
   private_key = paramiko.RSAKey.from_private_key_file('/path/to/key')
   ssh.connect(
       hostname=host,
       username=username,
       pkey=private_key
   )
   ```

3. **Job Encryption**
   ```python
   # Encrypt sensitive job data at rest
   from cryptography.fernet import Fernet
   
   key = Fernet.generate_key()
   cipher = Fernet(key)
   encrypted_password = cipher.encrypt(password.encode())
   ```

4. **Audit Logging**
   ```python
   # Log all security-relevant events
   logger.info(f"Job created: {job_id} by {user_id} for host {host}")
   logger.warning(f"Failed SSH connection attempt to {host}")
   ```

5. **Input Sanitization**
   ```python
   # Additional validation beyond Pydantic
   import re
   
   def validate_ip(ip: str) -> bool:
       pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
       if not re.match(pattern, ip):
           return False
       octets = [int(x) for x in ip.split('.')]
       return all(0 <= octet <= 255 for octet in octets)
   ```

## Deployment Checklist

- [ ] HTTPS/TLS configured with valid certificate
- [ ] Authentication implemented and enforced
- [ ] Network access restricted (firewall/VPN)
- [ ] Rate limiting enabled
- [ ] Logging and monitoring configured
- [ ] Regular security updates applied
- [ ] Backup and disaster recovery plan
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] Environment variables used for secrets
- [ ] Regular security audits scheduled

## Incident Response

If security breach suspected:

1. Immediately stop all services
2. Disconnect from network
3. Review logs for unauthorized access
4. Rotate all credentials
5. Investigate root cause
6. Apply fixes and patches
7. Document incident
8. Notify affected parties if required

## Security Headers

Add these security headers to nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Compliance Considerations

Depending on your use case, consider:

- **GDPR**: If handling EU citizens' data
- **SOC 2**: If providing service to enterprises
- **ISO 27001**: For information security management
- **HIPAA**: If handling healthcare-related data

## Regular Maintenance

1. **Update Dependencies**
   ```bash
   # Backend
   pip list --outdated
   pip install --upgrade <package>
   
   # Frontend
   npm outdated
   npm update
   ```

2. **Security Scans**
   ```bash
   # Python
   pip install safety
   safety check
   
   # Node.js
   npm audit
   npm audit fix
   
   # Docker
   docker scan windows-installer-backend
   ```

3. **Review Logs**
   - Check for suspicious activity
   - Monitor failed authentication attempts
   - Track resource usage

## Contact

For security concerns or to report vulnerabilities, please contact:
- Create a GitHub Security Advisory
- Email: [security contact]

## References

- [Paramiko Security](http://docs.paramiko.org/en/stable/api/client.html)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
