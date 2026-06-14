# Deployment Guide

Complete instructions for deploying the Supply Chain Disruption Agent to production environments.

## Table of Contents
1. [Local Deployment](#local-deployment)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [Database Setup](#database-setup)
5. [Monitoring & Logging](#monitoring--logging)

---

## Local Deployment

### Prerequisites
- Python 3.10+
- OpenAI API key
- 4GB RAM minimum
- 500MB disk space

### Installation

```bash
# Clone/download project
cd supply_chain_agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with API key
echo OPENAI_API_KEY=sk-xxx... > .env

# Run the system
python orchestrator.py
```

### Verification

```bash
# Test demo mode (no API key needed)
python demo_mode.py

# Run tests
pytest tests/ -v

# Start dashboard
streamlit run dashboard.py
```

---

## Docker Deployment

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM
- OpenAI API key

### Build & Run

```bash
# Build Docker image
docker build -t supply-chain-agent:latest .

# Run container
docker run -e OPENAI_API_KEY=sk-xxx... \
  -v $(pwd)/output:/app/output \
  supply-chain-agent:latest

# Or use Docker Compose
docker-compose up -d
```

### Docker Compose Services

```yaml
# Three services:
1. supply-chain-agent (main orchestrator)
2. postgres (data persistence)
3. Dashboard accessible at http://localhost:8501
```

### Container Health Check

```bash
# Check container status
docker ps

# View logs
docker logs supply-chain-agent

# Interactive shell
docker exec -it supply-chain-agent bash
```

### Clean Up

```bash
docker-compose down
docker image prune -a
docker volume prune
```

---

## Cloud Deployment

### AWS Deployment

#### Option 1: ECS (Elastic Container Service)

```bash
# 1. Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI
docker tag supply-chain-agent:latest YOUR_ECR_URI/supply-chain-agent:latest
docker push YOUR_ECR_URI/supply-chain-agent:latest

# 2. Create ECS task definition
# Reference: aws-ecs-task-definition.json

# 3. Deploy to ECS cluster
aws ecs run-task --cluster supply-chain-prod \
  --task-definition supply-chain-agent:1 \
  --launch-type FARGATE
```

#### Option 2: Lambda (Serverless)

```bash
# Package for Lambda
pip install -r requirements.txt -t ./package
cd package
zip -r ../deployment-package.zip .
cd ..
zip -r deployment-package.zip lambda_handler.py

# Deploy to Lambda
aws lambda create-function --function-name SupplyChainAgent \
  --runtime python3.10 \
  --role arn:aws:iam::ACCOUNT:role/lambda-role \
  --handler lambda_handler.lambda_handler \
  --zip-file fileb://deployment-package.zip \
  --timeout 300 \
  --memory-size 1024
```

#### Option 3: EC2

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. SSH into instance
ssh -i key.pem ubuntu@instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install python3.10 python3-pip docker.io -y

# 4. Clone repository
git clone https://github.com/yourorg/supply-chain-agent.git

# 5. Configure environment
cd supply-chain-agent
echo OPENAI_API_KEY=sk-xxx... > .env

# 6. Run with systemd
sudo systemctl start supply-chain-agent
sudo systemctl enable supply-chain-agent
```

### Azure Deployment

#### Option 1: Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry myregistry --image supply-chain-agent:latest .

# Deploy to ACI
az container create \
  --resource-group mygroup \
  --name supply-chain-agent \
  --image myregistry.azurecr.io/supply-chain-agent:latest \
  --environment-variables OPENAI_API_KEY=sk-xxx...
```

#### Option 2: Azure App Service

```bash
# Create App Service plan
az appservice plan create --name myplan --sku B2 --is-linux

# Create web app
az webapp create --resource-group mygroup \
  --plan myplan \
  --name supply-chain-app \
  --runtime "PYTHON:3.10"

# Configure and deploy
az webapp deployment source config-zip \
  --resource-group mygroup \
  --name supply-chain-app \
  --src deployment.zip
```

### Google Cloud Deployment

```bash
# Push to Google Container Registry
docker tag supply-chain-agent gcr.io/PROJECT_ID/supply-chain-agent
docker push gcr.io/PROJECT_ID/supply-chain-agent

# Deploy to Cloud Run
gcloud run deploy supply-chain-agent \
  --image gcr.io/PROJECT_ID/supply-chain-agent \
  --platform managed \
  --region us-central1 \
  --set-env-vars OPENAI_API_KEY=sk-xxx...
```

---

## Database Setup

### PostgreSQL Configuration

```bash
# Create database
createdb supply_chain

# Create tables
psql supply_chain < db/schema.sql

# Connect to database
psql -U admin -d supply_chain
```

### Schema

```sql
CREATE TABLE suppliers (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  on_time_rate DECIMAL(4,2),
  risk_score DECIMAL(3,2)
);

CREATE TABLE shipments (
  id VARCHAR(10) PRIMARY KEY,
  supplier_id VARCHAR(10) REFERENCES suppliers(id),
  value DECIMAL(12,2),
  priority VARCHAR(20),
  status VARCHAR(20)
);

CREATE TABLE disruptions (
  id VARCHAR(10) PRIMARY KEY,
  type VARCHAR(50),
  location VARCHAR(255),
  severity VARCHAR(20),
  timestamp TIMESTAMP
);
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Monitor performance
python -m cProfile orchestrator.py

# Memory profiling
pip install memory-profiler
python -m memory_profiler orchestrator.py
```

### Log Aggregation (ELK Stack)

```yaml
# logstash.conf
input {
  file {
    path => "/app/logs/supply-chain.log"
    start_position => "beginning"
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "supply-chain-%{+YYYY.MM.dd}"
  }
}
```

### Health Checks

```bash
# Basic health check
curl http://localhost:8501/health

# Metrics endpoint
curl http://localhost:8501/metrics
```

---

## Environment Configuration

### Production .env

```env
OPENAI_API_KEY=sk-prod-key-here
OPENAI_MODEL=gpt-4
ENVIRONMENT=production
LOG_LEVEL=INFO
DATABASE_URL=postgresql://user:pass@db-host:5432/supply_chain
REDIS_URL=redis://redis-host:6379
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| OPENAI_API_KEY | OpenAI API key | sk-xxx... |
| OPENAI_MODEL | Model selection | gpt-4 |
| ENVIRONMENT | prod/staging/dev | production |
| LOG_LEVEL | Logging level | INFO |
| DATABASE_URL | DB connection string | postgresql://... |
| REDIS_URL | Cache connection | redis://... |

---

## Troubleshooting

### Common Issues

#### 1. API Key Not Found
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Verify .env file
cat .env

# Fix: Update .env with correct key
```

#### 2. Database Connection Failed
```bash
# Test connection
psql -U admin -d supply_chain -c "SELECT 1"

# Check database service
docker ps | grep postgres
```

#### 3. OutOfMemory Error
```bash
# Increase memory limit
docker run --memory=2g supply-chain-agent

# Or in docker-compose.yml
services:
  supply-chain-agent:
    mem_limit: 2g
```

#### 4. OpenAI Rate Limiting
```python
# Add exponential backoff in config.py
RETRY_STRATEGY = {
    'max_retries': 5,
    'backoff_factor': 2
}
```

---

## Performance Tuning

### Optimization Tips

1. **Batch Processing**: Group API calls together
2. **Caching**: Cache disruption data for 5 minutes
3. **Async Processing**: Run agents in parallel where possible
4. **Database Indexing**: Index frequently queried columns

### Benchmarks

| Component | Metric | Target |
|-----------|--------|--------|
| Pipeline Execution | End-to-end | <5 minutes |
| API Latency | Per agent | <1 second |
| Dashboard Load | Page load | <2 seconds |
| Data Processing | 1000 shipments | <30 seconds |

---

## Security Checklist

- [ ] API keys stored in .env, not in code
- [ ] Database credentials encrypted
- [ ] HTTPS enabled for web services
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Logging sensitive data masked
- [ ] Regular dependency updates
- [ ] Security scanning enabled (e.g., Snyk)

---

## Support & Maintenance

For issues and questions:
- Email: support@example.com
- Slack: #supply-chain-team
- Documentation: https://docs.example.com
- Issues: https://github.com/yourorg/supply-chain-agent/issues
