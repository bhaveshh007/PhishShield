
# 🛡️ PhishShield – URL Phishing & Risk Scanner

[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![AWS ECS Fargate](https://img.shields.io/badge/AWS-ECS%20Fargate-FF9900?style=flat-square&logo=amazonecs&logoColor=white)](https://aws.amazon.com/ecs/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-4053D6?style=flat-square&logo=amazondynamodb&logoColor=white)](https://aws.amazon.com/dynamodb/)
[![Amazon ECR](https://img.shields.io/badge/AWS-ECR-FF9900?style=flat-square&logo=amazonecs&logoColor=white)](https://aws.amazon.com/ecr/)

PhishShield is a lightweight URL risk scanner built with Python (Flask) and deployed on AWS ECS Fargate. It evaluates submitted URLs for common phishing indicators—such as raw IP hostnames, missing HTTPS encryption, and suspicious query parameters—assigns a score from 0 to 100, and persists the scan history in Amazon DynamoDB.

---

## 🏛️ Architecture Overview

```text
                      Internet / Client
                             │
                             ▼
                  ┌─────────────────────┐
                  │   PhishShield API   │
                  │     (Port 5000)     │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   ECS Fargate Task  │
                  │  ┌───────────────┐  │
                  │  │ Gunicorn WSGI │  │
                  │  │       │       │  │
                  │  │   Flask App   │  │
                  │  └───────────────┘  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Analyzer Engine   │
                  │  - URL Parser       │
                  │  - Security Checks  │
                  │  - Scoring Engine   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │   Amazon DynamoDB   │
                  │  (PhishShieldScans) │
                  └─────────────────────┘

```

---

## 🎯 Scoring Logic

The application evaluates incoming URLs against deterministic rules and assigns a risk score:

| Score Range | Severity | Description |
| --- | --- | --- |
| **0 – 20** | `LOW` | Valid structure with standard HTTPS transport. |
| **21 – 50** | `MEDIUM` | Structural anomalies detected (abnormal length, excessive parameters). |
| **51 – 75** | `HIGH` | Multiple risk flags triggered (e.g., cleartext HTTP + IP address hostname). |
| **76 – 100** | `CRITICAL` | Explicit credential harvesting or dangerous redirect patterns detected. |

---

## 📂 Project Structure

```text
PhishShield/
├── analyzer/
│   ├── url_parser.py          # Extracts protocol, domain, path, and query parameters
│   ├── security_checks.py     # Performs IP format, SSL, and keyword pattern checks
│   └── risk_engine.py         # Computes score and builds findings array
├── database/
│   └── connection.py          # Boto3 DynamoDB resource initialization
├── routes/
│   ├── scan.py                # POST /api/scan endpoint
│   └── history.py             # GET /api/scans and GET /api/scans/<scan_id> endpoints
├── frontend/
│   ├── index.html             # Scanner interface
│   ├── history.html           # Scan history dashboard
│   ├── style.css              # Custom styling
│   └── script.js              # Fetch requests and UI event handlers
├── app.py                     # Application entry point
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Container image specification
├── .dockerignore
└── .gitignore

```

---

## 🔌 API Reference

### Health Check

`GET /api/health`

```json
{
  "service": "PhishShield API",
  "status": "healthy"
}

```

### Scan a URL

`POST /api/scan`

**Request:**

```json
{
  "url": "[http://192.168.1.10/login?redirect=http://example.com](http://192.168.1.10/login?redirect=http://example.com)"
}

```

**Response:**

```json
{
  "created_at": "2026-10-05T10:15:30Z",
  "domain": "192.168.1.10",
  "findings": [
    "URL does not use HTTPS.",
    "URL uses an IP address instead of a domain name.",
    "Suspicious keyword detected: login."
  ],
  "ip_based_url": true,
  "protocol": "http",
  "risk_level": "HIGH",
  "risk_score": 65,
  "scan_id": "c7a6f23b-8254-47f2-a392-4fdb0d5eb291",
  "url": "[http://192.168.1.10/login?redirect=http://example.com](http://192.168.1.10/login?redirect=http://example.com)"
}

```

### Retrieve Past Scans

* `GET /api/scans` – Returns stored scans from DynamoDB.
* `GET /api/scans/<scan_id>` – Returns detailed findings for a specific scan.

---

## 💡 Architecture Note: RDS to DynamoDB

The original architecture was designed around Amazon RDS MySQL. During AWS deployment, account limits on the Free Tier prevented provisioning an additional RDS instance.

Instead of adding infrastructure complexity and cost, persistence was migrated to **Amazon DynamoDB** with on-demand capacity (`PAY_PER_REQUEST`). This kept the deployment serverless, avoided idle costs, and maintained low-latency lookups by using `scan_id` (UUID) as the partition key.

---

## 🐳 Containerization & Deployment

PhishShield runs on **Gunicorn** instead of Flask's development server to properly handle concurrent requests.

### Dockerfile

```dockerfile
FROM python:3.14-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

```

### ☁️ AWS ECS Configuration

* **Cluster:** `phishshield-cluster`
* **Service:** `phishshield-service`
* **Task Definition:** `phishshield-task:3`
* **Compute:** Fargate (256 CPU, 512 MB RAM)
* **IAM Task Role:** `PhishShieldECSTaskRole` (grants `PutItem`, `GetItem`, and `Scan` permissions on `PhishShieldScans`)
* **Environment Variables:**
```env
AWS_REGION=ap-south-1
DYNAMODB_TABLE=PhishShieldScans

```



---

## 💻 Local Setup

### 1. Clone & Install

```bash
git clone [https://github.com/your-username/PhishShield.git](https://github.com/your-username/PhishShield.git)
cd PhishShield

# Set up virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

```

### 2. Environment Configuration

Create a local `.env` file in the root directory:

```env
AWS_REGION=ap-south-1
DYNAMODB_TABLE=PhishShieldScans

```

Ensure AWS credentials with DynamoDB access are configured via `aws configure` or environment variables.

### 3. Run Locally

**With Python:**

```bash
python app.py

```

**With Docker:**

```bash
docker build -t phishshield:3.0 .
docker run -p 5000:5000 --env-file .env phishshield:3.0

```

The application will be accessible at `http://localhost:5000`.

---

## 🧪 Verification & Test Results

### Production Startup (CloudWatch Logs)

```text
Starting gunicorn 26.2.0
Listening at: [http://0.0.0.0:5000](http://0.0.0.0:5000) (1)
Using worker: sync
Booting worker with pid: 7

```

### Test Cases

1. **Standard Domain (`https://example.com`)**
* Result: `Score: 0` | `Risk: LOW`
* Findings: No suspicious indicators detected.


2. **Suspicious IP Endpoint (`http://192.168.1.10/login?redirect=http://example.com`)**
* Result: `Score: 65` | `Risk: HIGH`
* Findings: Missing HTTPS, raw IP hostname, sensitive keyword (`login`).



---

## 🚀 Planned Improvements

* [ ] Add external threat feed integration (Google Safe Browsing / VirusTotal APIs).
* [ ] Implement machine learning classification for domain lexical features.
* [ ] Add an Application Load Balancer (ALB) with SSL termination via AWS Certificate Manager.
* [ ] Add user authentication and request rate limiting.

```

```
