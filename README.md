# PhishShield – URL Phishing & Risk Scanner

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Framework-Flask-lightgrey.svg)](https://flask.palletsprojects.com/)
[![AWS ECS Fargate](https://img.shields.io/badge/AWS-ECS%20Fargate-orange.svg)](https://aws.amazon.com/ecs/)
[![AWS DynamoDB](https://img.shields.io/badge/AWS-DynamoDB-blueviolet.svg)](https://aws.amazon.com/dynamodb/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED.svg)](https://www.docker.com/)

PhishShield is a cloud-native URL phishing and security risk analyzer built using Python Flask, Docker, and AWS services. The application inspects target URLs, calculates risk indicators across multiple threat vectors, classifies threats via an automated rule-based risk engine, and persists scan histories in Amazon DynamoDB.

---

## Table of Contents

- [1. Project Objective](#1-project-objective)
- [2. Key Features](#2-key-features)
- [3. AWS Services Used](#3-aws-services-used)
- [4. Architecture](#4-architecture)
- [5. Application Workflow](#5-application-workflow)
- [6. Technology Stack](#6-technology-stack)
- [7. Project Structure](#7-project-structure)
- [8. API Endpoints](#8-api-endpoints)
- [9. Risk Detection Example](#9-risk-detection-example)
- [10. Database Design](#10-database-design)
- [11. Architecture Decision: RDS vs. DynamoDB](#11-architecture-decision-rds-vs-dynamodb)
- [12. Docker Configuration](#12-docker-configuration)
- [13. ECS Fargate Deployment & IAM](#13-ecs-fargate-deployment--iam)
- [14. Local Development & Deployment Guide](#14-local-development--deployment-guide)
- [15. Verification & Testing](#15-verification--testing)
- [16. Screenshots & Evidence](#16-screenshots--evidence)
- [17. Key Learnings & Future Enhancements](#17-key-learnings--future-enhancements)

---

## 1. Project Objective

PhishShield automates threat inspection for URLs by detecting suspicious traits such as:
- Non-HTTPS (plain HTTP) transport schemes
- IP-based URLs bypassing DNS name resolution
- Phishing and credential-harvesting keywords
- Unusual URL lengths, character distributions, and structural patterns

### Risk Scoring Matrix

| Risk Score | Risk Level | Severity Profile |
| :--- | :--- | :--- |
| **0 – 20** | `LOW` | Benign structure, standard HTTPS domain |
| **21 – 50** | `MEDIUM` | Structural anomalies detected |
| **51 – 75** | `HIGH` | Strong indicators (e.g., raw IP, missing SSL, sensitive path) |
| **76 – 100** | `CRITICAL` | Confirmed malicious structure / explicit credential harvesting |

---

## 2. Key Features

- **Heuristic Threat Detection:** Automated checks for protocols, IP addresses, suspicious tokens, and path structures.
- **Rule-Based Engine:** Deterministic calculation delivering scores from 0 to 100 with actionable risk findings.
- **RESTful API:** Structured endpoints for URL scanning, single-record lookup, and global scan histories.
- **Serverless Persistence:** Amazon DynamoDB on-demand billing (`PAY_PER_REQUEST`) for low-latency state tracking.
- **Containerized Delivery:** Production Gunicorn WSGI server running on AWS ECS Fargate with zero host management.
- **Auditing & Telemetry:** Full operational and application logging streamed to Amazon CloudWatch Logs.

---

## 3. AWS Services Used

| AWS Service | Region | Purpose |
| :--- | :--- | :--- |
| **Amazon ECS Fargate** | `ap-south-1` | Serverless container execution for Gunicorn/Flask |
| **Amazon ECR** | `ap-south-1` | Private registry hosting production Docker container images |
| **Amazon DynamoDB** | `ap-south-1` | NoSQL persistence for audit trails and scan histories |
| **AWS IAM** | Global | Least-privilege Task Role for secure AWS resource access |
| **Amazon CloudWatch** | `ap-south-1` | Real-time container metrics and application log monitoring |
| **Amazon VPC & Security Groups** | `ap-south-1` | Isolated network boundaries and port-level access controls |

---

## 4. Architecture

```text
                        Internet / Client
                               |
                               v
                     +-------------------+
                     |  PhishShield API  |
                     |     Port 5000     |
                     +---------+---------+
                               |
                               v
                     +-------------------+
                     |  ECS Fargate Task |
                     |                   |
                     |     Gunicorn      |
                     |        |          |
                     |    Flask App      |
                     +---------+---------+
                               |
                               v
                     +-------------------+
                     |   URL Analyzer    |
                     |                   |
                     |  - URL Parser     |
                     |  - Security Rule  |
                     |  - Risk Engine    |
                     +---------+---------+
                               |
                               v
                     +-------------------+
                     |  Amazon DynamoDB  |
                     | (PhishShieldScans)|
                     +-------------------+

   [Container Telemetry]                     [Container Delivery]
            |                                         |
            v                                         v
   Amazon CloudWatch Logs                         Amazon ECR