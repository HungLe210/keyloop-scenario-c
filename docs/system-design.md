# 🏗️ System Design Document
**Sales Lead Management Tool (Scenario C)**

---

## 1. 📌 Overview

This system is a lightweight backend service designed to help sales teams manage incoming leads and track follow-up activities.

The system supports:
- Viewing all incoming leads
- Viewing detailed information of a lead
- Tracking chronological follow-up activities
- Logging new activities

### 1.1 Core Capabilities

The system fulfills all three core requirements from **Scenario C: The Sales Lead Management Tool**:

1. **Lead Inbox** - Display a list of all incoming sales leads
   - View all leads with pagination support
   - Efficient data retrieval for large datasets

2. **Lead Details View** - Show full lead details and chronological log of all follow-up activities
   - Complete lead information (name, email, phone, timestamps)
   - Recent activity preview (5 most recent activities)
   - Full activity history via dedicated endpoint

3. **Activity Logging** - Log new follow-up activities for leads (e.g., "Called customer")
   - Create and persist follow-up activities (CALL, EMAIL, NOTE)
   - Chronological activity tracking with timestamps
   - Paginated activity history for performance

### 1.2 Design Principles

This system is built on five key principles:

1. **Scalability**
   - Stateless API design for horizontal scaling
   - Database connection pooling for efficient resource usage
   - Pagination support to handle large datasets

2. **Performance**
   - Optimized SQL queries with proper indexing
   - Efficient data retrieval with minimal database round-trips
   - Connection pooling to reduce connection overhead

3. **Reliability**
   - Comprehensive error handling with custom error types
   - Input validation at multiple layers (schema + service)
   - Graceful shutdown for zero-downtime deployments

4. **Maintainability**
   - Clean layered architecture (6 distinct layers)
   - Separation of concerns (routing, validation, business logic, data access)
   - Consistent code patterns and naming conventions

5. **Observability**
   - Structured logging with Winston (file + console)
   - Request/response logging for debugging
   - Health check endpoint for monitoring
   - Error tracking with stack traces


---

## 2. 🧱 Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Postman / cURL / UI)             │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JSON
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      Express Application                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Middleware Layer                         │  │
│  │  • Request Logger (Morgan + Winston)                  │  │
│  │  • JSON Body Parser                                   │  │
│  │  • Validation Middleware (Zod)                        │  │
│  │  • Error Handler                                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  Routes Layer                         │  │
│  │  • /health (Health Check)                             │  │
│  │  • /leads (Lead Routes)                               │  │
│  │  • /leads/:leadId/activities (Activity Routes)        │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Controllers Layer                        │  │
│  │  • LeadController (HTTP request/response handling)    │  │
│  │  • ActivityController (HTTP request/response)         │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Services Layer                          │  │
│  │  • LeadService (Business logic)                       │  │
│  │  • ActivityService (Business logic)                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                             ↓                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Models Layer                           │  │
│  │  • Lead Model (Database queries)                      │  │
│  │  • Activity Model (Database queries)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL Queries
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                            │
│  • leads table                                               │
│  • activities table                                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Component Descriptions

#### 2.2.1 Entry Point (`src/index.js`)
Application bootstrap and lifecycle management. Initializes Express, establishes database connection, starts HTTP server, and handles graceful shutdown.

#### 2.2.2 Routes Layer (`src/routes/`)
Defines API endpoints and routes requests to controllers. Maps HTTP methods to controller methods and applies validation middleware.

#### 2.2.3 Middleware Layer (`src/middlewares/`)
Processes requests before reaching controllers. Handles validation (Zod), error handling, and request logging.

#### 2.2.4 Controllers Layer (`src/controllers/`)
Handles HTTP requests and responses. Extracts parameters, calls service methods, formats responses, and manages HTTP status codes.

#### 2.2.5 Services Layer (`src/services/`)
Implements business logic. Validates business rules, coordinates between models, handles pagination, and throws domain-specific errors.

#### 2.2.6 Models Layer (`src/models/`)
Executes database queries. Runs parameterized SQL queries, maps database rows to objects, and encapsulates all SQL logic.

#### 2.2.7 Schemas Layer (`src/schemas/`)
Defines validation rules using Zod. Validates input types, transforms data, sanitizes user input, and enforces business constraints.

#### 2.2.8 Configuration (`src/config/`)
Manages application configuration. Loads environment variables, validates required config, and creates database connection pool.

#### 2.2.9 Error Handling (`src/errors/`)
Defines custom error types (ValidationError, NotFoundError, DuplicateError) with HTTP status codes and error metadata.

#### 2.2.10 Utilities (`src/utils/`)
Provides shared utility functions for logging (Winston), input sanitization, and application constants.

#### 2.2.11 Dependency Injection (`src/container/`)
Manages dependencies and instantiates services/controllers. Injects dependencies and provides singleton instances.

### 2.3 Data Flow

#### 2.3.1 Get All Leads
```
1. Client → GET /leads?page=1&limit=10
2. Routes → validate.middleware (validate query params)
3. Routes → leadController.getAllLeads()
4. Controller → leadService.getAllLeads(page, limit)
5. Service → leadModel.findAll(offset, limit)
6. Model → Execute SQL: SELECT * FROM leads LIMIT ? OFFSET ?
7. Database → Return rows
8. Model → Return leads array
9. Service → Return { leads, pagination }
10. Controller → res.json({ status: 'success', data: {...} })
11. Client ← JSON response
```

#### 2.3.2 Get Lead Details with Activities
```
1. Client → GET /leads/:leadId
2. Routes → validate.middleware (validate leadId)
3. Routes → leadController.getLeadById()
4. Controller → leadService.getLeadById(leadId)
5. Service → leadModel.findById(leadId)
6. Service → activityService.findActivitiesByLeadId(leadId, limit=5)
7. Models → Execute SQL queries
8. Service → Combine lead + recentActivities
9. Controller → res.json({ status: 'success', data: {...} })
10. Client ← JSON response with lead + recent activities
```

#### 2.3.3 Create Activity
```
1. Client → POST /leads/:leadId/activities { type, note }
2. Routes → validate.middleware (validate params + body)
3. Middleware → Sanitize input (strip HTML from note)
4. Routes → activityController.createActivity()
5. Controller → activityService.createActivity(leadId, data)
6. Service → Verify lead exists (leadModel.findById)
7. Service → activityModel.create(leadId, type, note)
8. Model → Execute SQL: INSERT INTO activities (...)
9. Database → Return insertId
10. Model → Fetch created activity
11. Service → Return activity object
12. Controller → res.status(201).json({ status: 'success', data: {...} })
13. Client ← JSON response with created activity
```

#### 2.3.4 Get Activities (Paginated)
```
1. Client → GET /leads/:leadId/activities?page=1&limit=10
2. Routes → validate.middleware (validate params + query)
3. Routes → activityController.getActivitiesByLeadId()
4. Controller → activityService.findActivitiesByLeadId(leadId, limit, offset)
5. Service → Verify lead exists
6. Service → activityModel.findByLeadId(leadId, limit, offset)
7. Model → Execute SQL with LIMIT/OFFSET
8. Service → Calculate pagination metadata
9. Controller → res.json({ status: 'success', data: {...} })
10. Client ← JSON response with activities + pagination
```

### 2.4 Technology Stack

| Technology | Purpose | Justification |
|------------|---------|---------------|
| **Node.js (v18+)** | Runtime environment | Suitable for I/O-heavy APIs, fast setup for lightweight services |
| **Express.js (v5)** | Web framework | Lightweight, flexible, industry standard |
| **MySQL (v8)** | Relational database | Relational structure fits domain (Lead → Activities), ACID compliance ensures data integrity, supports complex queries as system scales |
| **mysql2** | MySQL client | Prepared statements (prevents SQL injection), connection pooling (performance), Promise-based API |
| **Zod** | Schema validation | Schema-first validation, type transformation (string → number), eliminates duplicate validation logic |
| **Winston** | Logging | Structured logging, multiple transports (file, console), extensible for centralized logging (ELK stack) |
| **validator** | String validation | Lightweight email/string validation |
| **dotenv** | Environment config | Standard for managing environment variables |

**Key Design Decisions:**

**MySQL vs MongoDB:**
- MongoDB offers flexible schema and faster prototyping
- However, relational integrity (foreign keys, joins) is harder to enforce
- MySQL is preferred for structured data with clear relationships

**validator vs DOMPurify/JSDOM:**
- DOMPurify/JSDOM are designed for browser or full HTML parsing
- Overkill for backend API with simple text input
- Sanitization handled via lightweight custom logic (`stripHtml`)
- For production with rich HTML input, DOMPurify would be considered

### 2.5 Database Schema

```sql
-- Leads table
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Activities table
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    type ENUM('CALL', 'EMAIL', 'NOTE') NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_created_at (created_at),
    INDEX idx_lead_created (lead_id, created_at DESC)
);
```

**Relationship**: One Lead → Many Activities (1:N)

**Indexes**:
- `leads.email` - Fast duplicate checking
- `leads.created_at` - Efficient sorting
- `activities.lead_id` - Fast activity lookup by lead
- `activities.created_at` - Chronological ordering
- `activities(lead_id, created_at)` - Composite index for paginated queries

### 2.6 Observability Strategy

#### 2.6.1 Logging

**Implementation**: Winston logger with multiple transports

**Log Levels**:
- `error` - Application errors, database failures
- `warn` - Validation failures, business rule violations
- `info` - Request logs, server lifecycle events
- `debug` - Detailed debugging information (dev only)

**Log Destinations**:
- Console (colorized, human-readable)
- `logs/error.log` (errors only)
- `logs/combined.log` (all logs)

**What We Log**:
- HTTP requests (requestId, method, path, status code, response time)
- Errors (message, stack trace, request context)
- Database events (connection status, query errors)
- Application lifecycle (startup, shutdown)
- Logs are structured in JSON format for easy ingestion by log aggregation systems

#### 2.6.2 Health Monitoring

**Endpoint**: `GET /health`

**Checks**:
- Database connectivity (connection pool ping)
- Application uptime
- Server status

**Response**:
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-04T10:30:00.000Z",
    "uptime": 3600.5,
    "database": {
      "connected": true
    }
  }
}
```

#### 2.6.3 Error Tracking

**Custom Error Classes**:
- Include HTTP status codes
- Carry error metadata
- Provide stack traces (dev mode)
- Enable error categorization

**Error Response Format**:
```json
{
  "status": "error",
  "message": "Lead not found",
  "errorCode": "LEAD_NOT_FOUND"
}
```

#### 2.6.4 Future Enhancements

- **Metrics**: Prometheus metrics (request rate, latency, error rate)
- **Distributed Tracing**: OpenTelemetry for request tracing
- **APM**: Application Performance Monitoring (New Relic, Datadog)
- **Alerting**: Alert on error rate spikes, database connection failures
- **Rate-limit**: Rate limiting to prevent abuse
- **Authentication & authorization**: Authentication andd authorization for secured endpoints

### 2.7 Security Considerations

#### 2.7.1 SQL Injection Prevention
All queries use parameterized statements to prevent SQL injection attacks.

#### 2.7.2 Input Validation
Zod schemas validate all inputs before processing, ensuring type safety and data integrity.

#### 2.7.3 Input Sanitization
- Basic HTML stripping to prevent simple XSS attacks
- For production systems handling rich HTML, a dedicated sanitizer (e.g., DOMPurify) would be recommended

#### 2.7.4 Error Messages
Generic error messages to avoid information leakage that could be exploited by attackers.

#### 2.7.5 Environment Variables
Sensitive data stored in `.env` files (excluded from git) to prevent credential exposure.

### 2.8 Scalability Considerations

#### 2.8.1 Stateless Design
No session state stored on the server, enabling horizontal scaling across multiple instances.

#### 2.8.2 Connection Pooling
Database connections are reused efficiently through connection pooling, reducing overhead.

#### 2.8.3 Pagination
Prevents large data transfers by limiting result sets, improving response times and reducing memory usage.

#### 2.8.4 Database Indexes
Strategic indexes on frequently queried columns ensure fast query performance even with large datasets.

#### 2.8.5 Caching Ready
- Frequently accessed data (e.g., lead lists) can be cached using Redis
- Reduces database load and improves response time
- Cache invalidation strategy can be implemented for data consistency

#### 2.8.6 Load Balancer Ready
Health check endpoint (`/health`) enables integration with load balancers for traffic distribution and health monitoring.

---

## 3. 🤖 AI Collaboration in Design Phase

### 3.1 Approach

GenAI was used as a supporting tool to accelerate development, not as a primary decision-maker.

All key architectural decisions (layered architecture, validation strategy, API structure) were initiated and driven by the developer, with AI used to:
- Validate ideas
- Suggest alternatives
- Speed up implementation

### 3.2 How AI Was Used

**Validation of Architecture Decisions**
- The layered architecture (Controller → Service → Model) was defined manually
- AI was used to review the structure and suggest refinements (e.g., adding schema layer, middleware separation)

**Implementation Support**
- AI helped generate boilerplate code (controllers, services, error handling)
- Accelerated repetitive tasks without affecting design ownership

**Design Refinement**
- AI suggested improvements such as:
  - Structured logging (Winston)
  - Pagination handling
  - Error handling patterns
- These suggestions were evaluated and selectively applied

### 3.3 Human Ownership

The following design aspects were fully controlled and decided manually:
- API structure and endpoint design
- Separation of concerns across layers
- Validation strategy (schema-first approach)
- Pagination behavior and edge-case handling
- Security decisions (sanitization, parameterized queries)
- Observability approach (logging structure, request tracking)

### 3.4 Verification Strategy

AI-generated outputs were not used blindly. Each suggestion was:
- Reviewed against system requirements
- Tested with real API scenarios
- Refactored to align with clean architecture principles

### 3.5 Outcome

- Faster development cycle
- Maintained full architectural ownership
- Improved code quality through iterative validation

### 3.6 Key Insight

GenAI was used as a tool for acceleration and validation, not as a source of truth. All critical design decisions were made based on system requirements and engineering judgment.

---

**Document Version**: 1.0  
**Last Updated**: May 4, 2026  
**Author**: Keyloop Technical Assessment - Scenario C
