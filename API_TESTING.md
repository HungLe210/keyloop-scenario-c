# API Testing Guide

This document provides cURL examples to test all API endpoints of the Sales Lead Management system.

## Prerequisites

1. Start the server:
```bash
npm start
```

2. Ensure database is running and migrations are applied:
```bash
npm run migrate
```

3. Server should be running on: `http://localhost:3000`

---

## 🏥 Health Check

### Check API Health
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
    "database": {
      "state": "connected",
      "connected": true
    }
  }
}
```

### Get API Info
```bash
curl -X GET http://localhost:3000/
```

---

## 📋 Lead Management APIs

### 1. Get All Leads (with Pagination )

**Get All Leads (Default Pagination):**
```bash
curl -X GET http://localhost:3000/leads
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
      "status": "NEW",
      "reason": null,
      "created_at": "2026-04-15T09:30:00.000Z",
      "updated_at": "2026-04-15T09:30:00.000Z"
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

**Get Leads with Custom Pagination:**
```bash
curl -X GET "http://localhost:3000/leads?page=1&limit=2"
```


**Error Case - Invalid Query Parameters (Extra Fields):**
```bash
curl -X GET "http://localhost:3000/leads?page=1&limit=10&invalidParam=test"
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Unrecognized key(s) in object: 'invalidParam'",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Invalid Page Number:**
```bash
curl -X GET "http://localhost:3000/leads?page=0"
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Page must be greater than 0",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Invalid Limit (Too High):**
```bash
curl -X GET "http://localhost:3000/leads?limit=200"
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Limit must be between 1 and 100",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Non-numeric Page:**
```bash
curl -X GET "http://localhost:3000/leads?page=abc"
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Page must be a positive integer",
  "errorCode": "VALIDATION_ERROR"
}
```

---

### 2. Get Lead by ID

**Success Case:**
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
    "status": "NEW",
    "reason": null,
    "created_at": "2026-04-15T09:30:00.000Z",
    "updated_at": "2026-04-15T09:30:00.000Z"
  }
}
```

**Error Case - Lead Not Found:**
```bash
curl -X GET http://localhost:3000/leads/999
```

**Expected Response (404):**
```json
{
  "status": "error",
  "message": "Lead not found",
  "errorCode": "LEAD_NOT_FOUND"
}
```

**Error Case - Invalid ID Format:**
```bash
curl -X GET http://localhost:3000/leads/abc
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Lead ID must be a positive integer",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Negative ID:**
```bash
curl -X GET http://localhost:3000/leads/-1
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Lead ID must be a positive integer",
  "errorCode": "VALIDATION_ERROR"
}
```

---

## 📝 Activity Management APIs

### 3. Create Activity for a Lead

**Success Case - CALL Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Called customer to discuss requirements"
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

**Success Case - EMAIL Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EMAIL",
    "note": "Sent product brochure and pricing"
  }'
```

**Success Case - NOTE Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NOTE",
    "note": "Customer requested demo next week"
  }'
```

**Error Case - Missing Required Field:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Note is required",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Invalid Activity Type:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "MEETING",
    "note": "Had a meeting with customer"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Invalid activity type. Must be one of: CALL, EMAIL, NOTE",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Extra Fields in Activity (Zod Schema Validation):**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Called customer",
    "duration": 30,
    "outcome": "positive"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Unrecognized key(s) in object: 'duration', 'outcome'",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Wrong Field Name in Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "activityType": "CALL",
    "description": "Called customer"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Activity type is required",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Wrong Data Type in Activity:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": 12345
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Note must be a string",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Note Too Long:**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"CALL\",
    \"note\": \"$(printf 'A%.0s' {1..2001})\"
  }"
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Note cannot exceed 2000 characters",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - HTML in Note (XSS Prevention):**
```bash
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "NOTE",
    "note": "<script>alert(\"XSS\")</script>Customer wants demo"
  }'
```

**Expected Response (201) - HTML stripped:**
```json
{
  "status": "success",
  "data": {
    "id": 16,
    "lead_id": 1,
    "type": "NOTE",
    "note": "Customer wants demo",
    "created_at": "2026-05-03T..."
  }
}
```

**Error Case - Lead Not Found:**
```bash
curl -X POST http://localhost:3000/leads/999/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Test note"
  }'
```

**Expected Response (404):**
```json
{
  "status": "error",
  "message": "Lead not found",
  "errorCode": "LEAD_NOT_FOUND"
}
```

---

### 4. Get All Activities for a Lead

**Success Case:**
```bash
curl -X GET http://localhost:3000/leads/2/activities
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 4,
      "lead_id": 2,
      "type": "CALL",
      "note": "Follow-up call, customer is reviewing the proposal",
      "created_at": "2026-04-20T14:30:00.000Z"
    },
    {
      "id": 3,
      "lead_id": 2,
      "type": "EMAIL",
      "note": "Sent quotation and product brochure",
      "created_at": "2026-04-19T09:00:00.000Z"
    },
    {
      "id": 2,
      "lead_id": 2,
      "type": "CALL",
      "note": "First call made, customer requested quotation",
      "created_at": "2026-04-18T10:20:00.000Z"
    }
  ]
}
```

**Success Case - Lead with No Activities:**
```bash
curl -X GET http://localhost:3000/leads/1/activities
```

**Expected Response (200):**
```json
{
  "status": "success",
  "data": []
}
```

**Error Case - Lead Not Found:**
```bash
curl -X GET http://localhost:3000/leads/999/activities
```

**Expected Response (404):**
```json
{
  "status": "error",
  "message": "Lead not found",
  "errorCode": "LEAD_NOT_FOUND"
}
```

---

## 🔄 Complete Workflow Test

Here's a complete workflow to test the entire system:

```bash
# 1. Get all leads
curl -X GET http://localhost:3000/leads

# 2. Get a specific lead (assuming lead ID 1 exists from seed data)
curl -X GET http://localhost:3000/leads/1

# 3. Add activity to lead
curl -X POST http://localhost:3000/leads/1/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Follow-up call with customer"
  }'

# 4. Get all activities for the lead
curl -X GET http://localhost:3000/leads/1/activities

# 5. Test pagination
curl -X GET "http://localhost:3000/leads?page=1&limit=5"

```

---

## 🎯 Testing Checklist

### Basic Functionality
- [ ] Health check endpoint works
- [ ] Get all leads with pagination
- [ ] Get lead by ID
- [ ] Create activity for lead
- [ ] Get all activities for lead

### Lead Query Validation (Zod Schema)
- [ ] Get leads fails with extra query parameters
- [ ] Get leads fails with invalid page number (0 or negative)
- [ ] Get leads fails with invalid limit (>100)
- [ ] Get leads fails with non-numeric page/limit
- [ ] Get lead by ID fails with invalid ID format
- [ ] Get lead by ID fails with negative ID

### Activity Validation (Zod Schema)
- [ ] Create activity fails with missing note
- [ ] Create activity fails with invalid type
- [ ] Create activity fails with extra fields
- [ ] Create activity fails with wrong field names
- [ ] Create activity fails with wrong data types
- [ ] Create activity fails with note too long (>2000 chars)
- [ ] Create activity strips HTML from note (XSS prevention)
- [ ] Create activity fails for non-existent lead

### Activity Query Validation (Zod Schema)
- [ ] Get activities fails with invalid lead ID
- [ ] Get activities fails with extra query parameters
- [ ] Get activities fails with invalid pagination params

---

## 💡 Tips

1. **Pretty Print JSON Response:**
   
   **Option 1 - Python (Works on all systems):**
   ```bash
   curl -X GET http://localhost:3000/leads | python -m json.tool
   ```
   
   **Option 2 - jq (If installed):**
   ```bash
   curl -X GET http://localhost:3000/leads | jq
   # Install jq: choco install jq (Windows) or brew install jq (Mac)
   ```
   
   **Option 3 - PowerShell (Windows):**
   ```powershell
   curl http://localhost:3000/leads | ConvertFrom-Json | ConvertTo-Json -Depth 10
   ```
   
   **Option 4 - json_pp (Perl, usually pre-installed):**
   ```bash
   curl -X GET http://localhost:3000/leads | json_pp
   ```

2. **Save Response to File:**
   ```bash
   curl -X GET http://localhost:3000/leads > leads.json
   ```

3. **Include Response Headers:**
   ```bash
   curl -i -X GET http://localhost:3000/leads
   ```

4. **Verbose Output (for debugging):**
   ```bash
   curl -v -X GET http://localhost:3000/leads
   ```

---

## 🐛 Troubleshooting

**Connection Refused:**
- Check if server is running: `npm start`
- Verify port 3000 is not in use

**Database Errors:**
- Ensure MySQL is running
- Check database credentials in `.env`
- Run migrations: `npm run migrate`

**404 Not Found:**
- Verify the endpoint URL is correct
- Check server logs in `logs/combined.log`

**500 Internal Server Error:**
- Check server logs in `logs/error.log`
- Verify database connection

---

## 🛡️ Zod Schema Validation Summary

The API uses Zod schemas with `.strict()` mode to ensure data integrity:

### Key Features:
1. **Strict Mode**: Rejects any extra fields not defined in schema
2. **Type Safety**: Validates data types (string, number, enum, etc.)
3. **Field Validation**: Checks required fields, formats, and constraints
4. **Sanitization**: Strips HTML from text inputs to prevent XSS
5. **Transform**: Converts string IDs to integers, sanitizes inputs

### What Gets Validated:
- **Lead Creation**: name, email, phone, status (no extra fields allowed)
- **Activity Creation**: type (enum), note (string, max 2000 chars, HTML stripped)
- **Query Parameters**: page (>0), limit (1-100), no extra params
- **Path Parameters**: leadId (positive integer only)

### Common Validation Errors:
- `Unrecognized key(s) in object` - Extra fields sent
- `[Field] is required` - Missing required field
- `[Field] must be a string/number` - Wrong data type
- `Invalid [field] format` - Format validation failed
- `[Field] must be between X and Y` - Range validation failed

---

**Happy Testing! 🚀**
