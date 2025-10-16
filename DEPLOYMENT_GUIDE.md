# DataZen SaaS - Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Razorpay webhook configured
- [ ] SSL certificate obtained
- [ ] Domain configured
- [ ] Backups configured
- [ ] Monitoring setup

## Option 1: Heroku Deployment (Easiest)

### 1. Install Heroku CLI
```bash
# Windows
choco install heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Create Heroku App
```bash
heroku login
heroku create datazen-app
```

### 3. Add PostgreSQL
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

### 4. Set Environment Variables
```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set RAZORPAY_KEY_ID=your_key_id
heroku config:set RAZORPAY_KEY_SECRET=your_key_secret
heroku config:set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Create Procfile
```
web: gunicorn main:app
```

### 6. Deploy
```bash
git push heroku main
heroku run python -c "from config.database import init_db; init_db()"
```

## Option 2: AWS Deployment

### 1. Create EC2 Instance
- Ubuntu 20.04 LTS
- t3.micro (free tier eligible)
- Security group: Allow 80, 443, 22

### 2. SSH into Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

### 3. Install Dependencies
```bash
sudo apt update
sudo apt install python3-pip python3-venv postgresql nginx
```

### 4. Setup Application
```bash
git clone your-repo
cd your-repo/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Configure PostgreSQL
```bash
sudo -u postgres createdb datazen
sudo -u postgres createuser datazen_user
```

### 6. Setup Nginx
```bash
sudo nano /etc/nginx/sites-available/datazen
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7. Enable SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 8. Start Application
```bash
gunicorn main:app --bind 0.0.0.0:8000
```

## Option 3: Docker Deployment

### 1. Create Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8000"]
```

### 2. Create docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: datazen
      POSTGRES_USER: datazen_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://datazen_user:secure_password@db:5432/datazen
      JWT_SECRET: your-secret-key
      RAZORPAY_KEY_ID: your_key_id
      RAZORPAY_KEY_SECRET: your_key_secret
    depends_on:
      - db

volumes:
  postgres_data:
```

### 3. Deploy
```bash
docker-compose up -d
docker-compose exec web python -c "from config.database import init_db; init_db()"
```

## Post-Deployment

### 1. Verify Deployment
```bash
curl https://yourdomain.com/api/health
```

### 2. Setup Monitoring
- CloudWatch (AWS)
- Datadog
- New Relic
- Sentry (error tracking)

### 3. Setup Backups
```bash
# PostgreSQL backup
pg_dump datazen > backup.sql

# Automated backups
0 2 * * * pg_dump datazen > /backups/datazen-$(date +\%Y\%m\%d).sql
```

### 4. Configure Razorpay Webhook
Update webhook URL in Razorpay dashboard:
```
https://yourdomain.com/api/webhooks/razorpay
```

### 5. Test Payment Flow
1. Create test subscription
2. Complete payment with test card
3. Verify webhook received
4. Check database for subscription

### 6. Setup Email Notifications
Configure SMTP for:
- Welcome emails
- Subscription confirmations
- Payment receipts
- Renewal reminders

## Scaling Considerations

### Database
- Use read replicas for scaling reads
- Setup connection pooling
- Monitor query performance
- Regular maintenance

### Application
- Use load balancer (AWS ELB, Nginx)
- Deploy multiple instances
- Use CDN for static files
- Cache frequently accessed data

### Monitoring
- Setup alerts for:
  - High error rates
  - Slow response times
  - Database issues
  - Payment failures

## Security Hardening

### Application
- [ ] Enable HTTPS only
- [ ] Set secure headers
- [ ] Enable CORS properly
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention

### Database
- [ ] Strong passwords
- [ ] Encrypted connections
- [ ] Regular backups
- [ ] Access control
- [ ] Audit logging

### Infrastructure
- [ ] Firewall rules
- [ ] SSH key-based auth
- [ ] Regular updates
- [ ] DDoS protection
- [ ] WAF rules

## Troubleshooting

### Application Won't Start
```bash
# Check logs
heroku logs --tail

# Check environment variables
heroku config

# Restart app
heroku restart
```

### Database Connection Issues
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Check migrations
python -c "from config.database import init_db; init_db()"
```

### Webhook Not Receiving Events
1. Verify webhook URL in Razorpay dashboard
2. Check webhook secret in .env
3. Monitor webhook logs
4. Test with Razorpay webhook tester

## Performance Optimization

### Database
- Add indexes on frequently queried columns
- Use connection pooling
- Optimize queries
- Archive old logs

### Application
- Enable caching
- Use CDN for static files
- Compress responses
- Optimize images

### Infrastructure
- Use auto-scaling
- Load balancing
- Content delivery
- Database replication

## Maintenance

### Regular Tasks
- [ ] Monitor logs daily
- [ ] Check payment status
- [ ] Review error rates
- [ ] Update dependencies
- [ ] Backup database
- [ ] Monitor costs

### Monthly Tasks
- [ ] Review usage metrics
- [ ] Check security logs
- [ ] Update SSL certificate
- [ ] Performance review
- [ ] User feedback review

### Quarterly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Capacity planning
- [ ] Disaster recovery test

---

**Status**: Ready for Deployment
**Last Updated**: 2025-10-16

