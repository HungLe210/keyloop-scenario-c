# API Testing Guide

This document provides cURL examples to test all API endpoints of the Sales Lead Management system.

## Prerequisites

1. Start the server: `npm start`
2. Ensure database is running and migrations are applied: `npm run migrate`
3. Server should be running on: `http://localhost:3000`

---

## 🏥 Health Check

```bash
curl -X GET http://localhost:3000/health
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-03T...",
    "uptime": 123.456,
    "database": { "connected": true }
  }
}
```

---

## 📋 Lead Management

### Get All Leads

```bash
# Without pagination
curl -X GET http://localhost:3000/leads

# With pagination
curl -X GET "http://localhost:3000/leads?page=1&limit=10"
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "phone": "0901234567",
      "created_at": "2026-04-15T09:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### Get Lead by ID

```bash
curl -X GET http://localhost:3000/leads/1
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john.smith@example.com",
    "phone": "0901234567",
    "created_at": "2026-04-15T09:30:00.000Z"
  }
}
```

**Error - Lead Not Found (404):**
```bash
curl -X GET http://localhost:3000/leads/999
```

---

## 📝 Activity Management

### Create Activity

```bash
# CALL activity
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Called customer to discuss requirements"
  }'

# EMAIL activity
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EMAIL",
    "note": "Sent product brochure and pricing"
  }'

# NOTE activity
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NOTE",
    "note": "Customer requested demo next week"
  }'
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 15,
    "lead_id": 1,
    "type": "CALL",
    "note": "Called customer to discuss requirements",
    "created_at": "2026-05-03T..."
  }
}
```

### Get All Activities for a Lead

```bash
curl -X GET http://localhost:3000/leads/1/activities
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 4,
      "lead_id": 1,
      "type": "CALL",
      "note": "Follow-up call, customer is reviewing the proposal",
      "created_at": "2026-04-20T14:30:00.000Z"
    }
  ]
}
```

---

## 🔄 Complete Workflow Test

```bash
# 1. Check health
curl -X GET http://localhost:3000/health

# 2. Get all leads
curl -X GET http://localhost:3000/leads

# 3. Get specific lead
curl -X GET http://localhost:3000/leads/1

# 4. Create activity
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{"type": "CALL", "note": "Follow-up call with customer"}'

# 5. Get all activities
curl -X GET http://localhost:3000/leads/1/activities
```

---

## ⚠️ Common Error Cases

### Validation Errors (400)

**Invalid activity type:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{"type": "MEETING", "note": "Test"}'
```

**Missing required field:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{"type": "CALL"}'
```

**Invalid pagination:**
```bash
curl -X GET "http://localhost:3000/leads?page=0"
curl -X GET "http://localhost:3000/leads?limit=200"
```

### Not Found Errors (404)

```bash
curl -X GET http://localhost:3000/leads/999
curl -X POST http://localhost:3000/leads/999/activities \
  -H "Content-Type: application/json" \
  -d '{"type": "CALL", "note": "Test"}'
```

---

## 💡 Tips

**Pretty Print JSON (Python):**
```bash
curl -X GET http://localhost:3000/leads | python -m json.tool
```

**Save Response to File:**
```bash
curl -X GET http://localhost:3000/leads > leads.json
```

**Include Response Headers:**
```bash
curl -i -X GET http://localhost:3000/leads
```

---

## 🛡️ Security Features

- **SQL Injection Prevention**: All queries use parameterized statements
- **XSS Prevention**: HTML tags are stripped from input
- **Input Validation**: Zod schemas validate all inputs
- **Type Safety**: Automatic type conversion and validation

---

**Happy Testing! 🚀**
