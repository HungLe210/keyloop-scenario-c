# Sales Lead Management Tool - Backend API

A lightweight RESTful API for managing sales leads and tracking follow-up activities, built for the Keyloop Technical Assessment (Scenario C: The Sales Lead Management Tool).

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)

---

## 🎯 Overview

This project implements **Scenario C: The Sales Lead Management Tool** from the Keyloop Technical Assessment. It provides a backend API that enables salespeople to:

1. **View all incoming sales leads** (Lead Inbox)
2. **View detailed lead information** with chronological activity logs (Lead Details View)
3. **Log follow-up activities** for each lead (Activity Logging)

The implementation focuses on scalability, maintainability, observability, and production-ready code quality.

---

## ✨ Features

### Core Requirements (Scenario C)

- ✅ **Lead Inbox**: List all sales leads with pagination support
- ✅ **Lead Details View**: Get full lead details with recent activity preview (5 most recent)
- ✅ **Activity Logging**: Create and persist follow-up activities (CALL, EMAIL, NOTE)
- ✅ **Activity History**: View chronological log of all activities for a lead

### Additional Features

- **Comprehensive Logging**: Winston-based logging with file rotation
- **Health Check Endpoint**: Monitor application and database health
- **Error Handling**: Centralized error handling with custom error types
- **Input Validation**: Zod-based schema validation for all inputs
- **Database Connection Pooling**: Optimized MySQL connection management
- **Graceful Shutdown**: Proper cleanup on SIGTERM/SIGINT signals

---

## 🛠 Technology Stack

- **Node.js** (v18+) - JavaScript runtime
- **Express.js** (v5) - Web application framework
- **MySQL** (v8) - Relational database
- **Zod** - Schema validation
- **Winston** - Logging library

For detailed technology justifications and architecture decisions, see [docs/system-design.md](./docs/system-design.md).

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sales-lead-management-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MySQL Database

Start your MySQL server and create a database:

```sql
CREATE DATABASE sales_lead_management;
```

### 4. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Application
NODE_ENV=development
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sales_lead_management

# Logging
LOG_LEVEL=info
```

### 5. Run Database Migrations

```bash
npm run migrate
```

This will:
- Create the `leads` and `activities` tables
- Insert sample seed data for testing

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(required)* |
| `DB_NAME` | Database name | `sales_lead_management` |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |

---

## 🏃 Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Verify Installation

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-04T...",
    "uptime": 5.123,
    "database": {
      "connected": true
    }
  }
}
```

---

## 📚 API Documentation

For detailed API documentation with cURL examples, see [API_TESTING.md](./API_TESTING.md).

### Quick Reference

#### Lead Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/leads` | Get all leads (with optional pagination) |
| `GET` | `/leads/:leadId` | Get lead by ID with recent activities |

#### Activity Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/leads/:leadId/activities` | Get all activities for a lead (paginated) |
| `POST` | `/leads/:leadId/activities` | Create a new activity |

#### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/` | API information |

### Example Usage

**Get All Leads:**
```bash
curl http://localhost:3000/leads
```

**Get Lead Details with Recent Activities:**
```bash
curl http://localhost:3000/leads/1
```

**Log an Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Called customer to discuss requirements"
  }'
```

---

## 🧪 Testing

The application has been thoroughly tested using **cURL** commands. For comprehensive API testing documentation with examples, see [API_TESTING.md](./API_TESTING.md).

### Quick Test

```bash
# 1. Check health
curl http://localhost:3000/health

# 2. Get all leads
curl http://localhost:3000/leads

# 3. Get specific lead with activities
curl http://localhost:3000/leads/1

# 4. Create an activity
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{"type": "CALL", "note": "Follow-up call"}'
```

---

## 📁 Project Structure

```
sales-lead-management-backend/
├── src/
│   ├── config/              # Configuration files
│   ├── container/           # Dependency injection
│   ├── controllers/         # Request handlers
│   ├── errors/              # Custom error classes
│   ├── middlewares/         # Express middlewares
│   ├── models/              # Data access layer
│   ├── routes/              # API routes
│   ├── schemas/             # Zod validation schemas
│   ├── services/            # Business logic layer
│   ├── utils/               # Utility functions
│   └── index.js             # Application entry point
├── migrations/              # Database migrations
├── scripts/                 # Utility scripts
├── tests/                   # Test suites
├── logs/                    # Application logs
├── docs/                    # Documentation
│   └── system-design.md     # System design document
├── .env.example             # Environment template
├── API_TESTING.md           # API testing guide
└── README.md                # This file
```

---

## 📖 Documentation

- **[System Design Document](./docs/system-design.md)** - Comprehensive architecture, design decisions, and AI collaboration details
- **[API Testing Guide](./API_TESTING.md)** - Detailed API documentation with cURL examples

---

## 🤖 AI Collaboration

This project was developed in collaboration with **Kiro**, an AI-powered development environment. The AI assisted with:
- Code generation and boilerplate scaffolding
- Implementation of design patterns
- Validation logic and error handling
- Documentation generation
- Suggest alternative approaches
- Refine implementation details

All architectural decisions, business logic validation, and security reviews were conducted with human oversight. For detailed information about the AI collaboration process, see the [System Design Document](./docs/system-design.md#3--ai-collaboration-in-design-phase).

---

## 📝 License

ISC

---

## 👤 Author

Developed for the Keyloop Technical Assessment - Scenario C: The Sales Lead Management Tool

---

**Happy Coding! 🚀**
