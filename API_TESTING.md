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

### 1. Create a New Lead

**Success Case:**
```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test.user@example.com",
    "phone": "0987654321",
    "status": "NEW"
  }'
```

**Expected Response (201):**
```json
{
  "status": "success",
  "data": {
    "id": 6,
    "name": "Test User",
    "email": "test.user@example.com",
    "phone": "0987654321",
    "status": "NEW",
    "reason": null,
    "created_at": "2026-05-03T...",
    "updated_at": "2026-05-03T..."
  }
}
```

**Error Case - Missing Required Field:**
```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "0987654321"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Email is required",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Invalid Email Format:**
```bash
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "phone": "0987654321",
    "status": "NEW"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Invalid email format",
  "errorCode": "VALIDATION_ERROR"
}
```

**Error Case - Duplicate Email:**
```bash
# First, create a lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Test",
    "email": "duplicate@example.com",
    "phone": "0987654321",
    "status": "NEW"
  }'

# Then try to create another with same email
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "email": "duplicate@example.com",
    "phone": "0123456789",
    "status": "NEW"
  }'
```

**Expected Response (409):**
```json
{
  "status": "error",
  "message": "email already exists",
  "errorCode": "DUPLICATE_ENTRY"
}
```

---

### 2. Get All Leads (with Pagination & Filtering)

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

**Filter by Status:**
```bash
curl -X GET "http://localhost:3000/leads?status=CONTACTED"
```

**Search by Name or Email:**
```bash
curl -X GET "http://localhost:3000/leads?search=john"
```

**Combined Filters:**
```bash
curl -X GET "http://localhost:3000/leads?status=CONTACTED&search=sarah&page=1&limit=5"
```

---

### 3. Get Lead by ID

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
  "message": "Invalid id format",
  "errorCode": "VALIDATION_ERROR"
}
```

---

### 4. Update Lead Status

**Valid Transition - NEW → CONTACTED:**
```bash
curl -X PATCH http://localhost:3000/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED"
  }'
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
    "status": "CONTACTED",
    "reason": null,
    "created_at": "2026-04-15T09:30:00.000Z",
    "updated_at": "2026-05-03T..."
  }
}
```

**Valid Transition - CONTACTED → QUALIFIED:**
```bash
curl -X PATCH http://localhost:3000/leads/2/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED"
  }'
```

**Valid Transition - QUALIFIED → CLOSED (with reason):**
```bash
curl -X PATCH http://localhost:3000/leads/3/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CLOSED",
    "reason": "Deal successfully closed"
  }'
```

**Invalid Transition - NEW → QUALIFIED:**
```bash
curl -X PATCH http://localhost:3000/leads/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Invalid status transition from NEW to QUALIFIED",
  "errorCode": "INVALID_STATUS_TRANSITION"
}
```

**Invalid Transition - CLOSED → Any Status:**
```bash
curl -X PATCH http://localhost:3000/leads/4/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "NEW"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Invalid status transition from CLOSED to NEW",
  "errorCode": "INVALID_STATUS_TRANSITION"
}
```

---

## 📝 Activity Management APIs

### 5. Create Activity for a Lead

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

### 6. Get All Activities for a Lead

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
# 1. Create a new lead
curl -X POST http://localhost:3000/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "phone": "0999888777",
    "status": "NEW"
  }'
# Note the returned ID (e.g., id: 6)

# 2. Add first activity
curl -X POST http://localhost:3000/leads/6/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Initial contact call - customer interested in Product X"
  }'

# 3. Update status to CONTACTED
curl -X PATCH http://localhost:3000/leads/6/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONTACTED"
  }'

# 4. Add follow-up activity
curl -X POST http://localhost:3000/leads/6/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "EMAIL",
    "note": "Sent detailed proposal and pricing"
  }'

# 5. Update status to QUALIFIED
curl -X PATCH http://localhost:3000/leads/6/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "QUALIFIED"
  }'

# 6. Add another activity
curl -X POST http://localhost:3000/leads/6/activities \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CALL",
    "note": "Customer approved budget, ready to proceed"
  }'

# 7. Close the deal
curl -X PATCH http://localhost:3000/leads/6/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CLOSED",
    "reason": "Contract signed successfully"
  }'

# 8. View complete lead details
curl -X GET http://localhost:3000/leads/6

# 9. View all activities (should include status change activities)
curl -X GET http://localhost:3000/leads/6/activities

# 10. List all leads
curl -X GET http://localhost:3000/leads
```

---

## 📊 Valid Status Transitions

| From | To | Valid? |
|------|-----|--------|
| NEW | CONTACTED | ✅ Yes |
| NEW | QUALIFIED | ❌ No |
| NEW | CLOSED | ❌ No |
| CONTACTED | QUALIFIED | ✅ Yes |
| CONTACTED | CLOSED | ✅ Yes |
| QUALIFIED | CLOSED | ✅ Yes |
| QUALIFIED | NEW | ❌ No |
| QUALIFIED | CONTACTED | ❌ No |
| CLOSED | (any) | ❌ No (terminal state) |

---

## 🎯 Testing Checklist

- [ ] Health check endpoint works
- [ ] Create lead with valid data
- [ ] Create lead fails with missing fields
- [ ] Create lead fails with invalid email
- [ ] Create lead fails with duplicate email
- [ ] Get all leads with pagination
- [ ] Filter leads by status
- [ ] Search leads by name/email
- [ ] Get lead by ID
- [ ] Get lead fails with invalid ID
- [ ] Update status with valid transition
- [ ] Update status fails with invalid transition
- [ ] Cannot update from CLOSED status
- [ ] Create activity for lead
- [ ] Create activity fails with invalid type
- [ ] Get all activities for lead
- [ ] Status change creates automatic activity
- [ ] Complete workflow (NEW → CONTACTED → QUALIFIED → CLOSED)

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

**Happy Testing! 🚀**
