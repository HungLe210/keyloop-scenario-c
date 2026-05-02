# Implementation Plan: Sales Lead Management Backend

## Overview

This implementation plan breaks down the Sales Lead Management Backend into discrete, incremental coding tasks. The system will be built using Node.js, Express.js, and MongoDB with Mongoose, following clean architecture principles with clear separation across routes, controllers, services, models, middlewares, and utilities.

The implementation follows a bottom-up approach: starting with foundational components (models, utilities, error handling), then building business logic (services, validators), and finally wiring everything together through controllers and routes. Each task builds on previous work, with checkpoints to ensure stability before proceeding.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js project with package.json
  - Install dependencies: express, mongoose, winston, dotenv
  - Install dev dependencies: jest, supertest, fast-check, mongodb-memory-server, nodemon
  - Create folder structure: src/{routes,controllers,services,models,middlewares,utils,config}, tests/{unit,integration,properties,smoke}
  - Create .env.example with NODE_ENV, PORT, MONGODB_URI, LOG_LEVEL
  - Create .gitignore for node_modules, .env, logs
  - _Requirements: 9.1, 14.6_

- [x] 2. Implement core utilities and configuration
  - [x] 2.1 Create logger utility (utils/logger.js)
    - Implement Winston logger with console and file transports
    - Configure log levels and formatting (timestamp, JSON, colorize)
    - Support LOG_LEVEL environment variable
    - _Requirements: 13.5, 13.6_

  - [x] 2.2 Create constants file (utils/constants.js)
    - Define LEAD_STATUS enum: NEW, CONTACTED, QUALIFIED, CLOSED
    - Define ACTIVITY_TYPE enum: CALL, EMAIL, NOTE
    - Define valid status transitions map
    - _Requirements: 1.4, 4.3, 7.2_

  - [x] 2.3 Create environment configuration (config/env.js)
    - Load and validate environment variables using dotenv
    - Export configuration object with defaults
    - _Requirements: 14.6, 15.5_

  - [x] 2.4 Create database connection module (config/database.js)
    - Implement connectDB function with retry logic and exponential backoff
    - Implement closeDB function for graceful shutdown
    - Add connection event handlers (connected, disconnected, error)
    - Log connection status changes
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.6_

- [x] 3. Define database models and schemas
  - [x] 3.1 Create Lead model (models/Lead.js)
    - Define Mongoose schema with fields: name, email, phone, status, reason, timestamps
    - Add schema validation: required fields, email format, status enum, string lengths
    - Create indexes: email (unique), status, createdAt
    - Export Lead model
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.8_

  - [x] 3.2 Create Activity model (models/Activity.js)
    - Define Mongoose schema with fields: leadId (ObjectId ref), type, note, createdAt
    - Add schema validation: required fields, type enum, note max length
    - Create indexes: leadId, createdAt, compound (leadId + createdAt desc)
    - Export Activity model
    - _Requirements: 5.2, 5.3, 5.6, 5.7_

- [x] 4. Implement custom error classes
  - Create error classes in middlewares/errorHandler.js: ValidationError, NotFoundError, DuplicateError, InvalidTransitionError, DatabaseError
  - Each error class should include: name, message, statusCode, errorCode, relevant context fields
  - _Requirements: 10.3, 10.4, 10.7_

- [ ] 5. Implement validation middleware
  - [x] 5.1 Create validation utilities (middlewares/validateRequest.js)
    - Implement isValidEmail function using regex pattern
    - Implement validateObjectId middleware factory
    - Implement validateLeadCreation middleware
    - Implement validateActivityCreation middleware
    - Implement validateStatusUpdate middleware
    - All validators should throw ValidationError on failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ]* 5.2 Write property test for email validation
    - **Property 1: Email Format Validation**
    - **Validates: Requirements 1.3, 11.3**

  - [ ]* 5.3 Write property test for enum field validation
    - **Property 2: Enum Field Validation**
    - **Validates: Requirements 1.4, 4.3, 11.4**

  - [ ]* 5.4 Write property test for required field validation
    - **Property 3: Required Field Validation**
    - **Validates: Requirements 1.2, 4.2, 11.2**

  - [ ]* 5.5 Write property test for ObjectId format validation
    - **Property 9: ObjectId Format Validation**
    - **Validates: Requirements 11.5**

- [x] 6. Implement status validator service
  - [x] 6.1 Create StatusValidator class (services/statusValidator.js)
    - Implement validateTransition method that checks valid transitions
    - Implement getAllowedTransitions method
    - Use constants from utils/constants.js
    - Throw InvalidTransitionError for invalid transitions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8_

  - [ ]* 6.2 Write property test for valid status transitions
    - **Property 4: Valid Status Transitions Accepted**
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 6.3 Write property test for invalid status transitions
    - **Property 5: Invalid Status Transitions Rejected**
    - **Validates: Requirements 7.1, 7.4**

  - [ ]* 6.4 Write property test for CLOSED terminal state
    - **Property 6: CLOSED Terminal State**
    - **Validates: Requirements 7.3**

  - [ ]* 6.5 Write unit tests for StatusValidator
    - Test each valid transition individually
    - Test each invalid transition individually
    - Test CLOSED terminal state behavior
    - Test getAllowedTransitions for each status
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Activity service layer
  - [x] 8.1 Create ActivityService class (services/activityService.js)
    - Implement constructor with dependency injection (Activity model, Lead model)
    - Implement createActivity method (verify lead exists, create activity, return activity)
    - Implement findActivitiesByLeadId method (verify lead exists, query activities sorted by createdAt desc)
    - Implement createStatusChangeActivity method (create NOTE activity with status change message)
    - Throw NotFoundError if lead doesn't exist
    - Throw ValidationError for invalid activity data
    - _Requirements: 4.1, 4.4, 4.5, 4.8, 6.1, 6.2, 6.3, 7.7, 9.5_

  - [ ]* 8.2 Write unit tests for ActivityService
    - Test createActivity with valid data
    - Test createActivity throws NotFoundError for non-existent lead
    - Test findActivitiesByLeadId returns activities sorted by createdAt desc
    - Test findActivitiesByLeadId throws NotFoundError for non-existent lead
    - Test createStatusChangeActivity creates NOTE with correct message
    - Mock Activity and Lead models
    - _Requirements: 4.1, 4.6, 6.1, 6.5, 7.7_

- [ ] 9. Implement Lead service layer
  - [ ] 9.1 Create LeadService class (services/leadService.js)
    - Implement constructor with dependency injection (Lead model, ActivityService, StatusValidator)
    - Implement createLead method (validate, save, handle duplicate email error)
    - Implement findAllLeads method with pagination and filtering logic
    - Implement findLeadById method (query by ID, throw NotFoundError if not found)
    - Implement updateLeadStatus method (validate transition, update status, create activity)
    - Handle Mongoose duplicate key error (code 11000) and throw DuplicateError
    - _Requirements: 1.1, 1.6, 2.1, 2.2, 2.5, 2.6, 3.1, 3.2, 7.1, 7.6, 7.7, 9.4_

  - [ ]* 9.2 Write property test for pagination subset correctness
    - **Property 7: Pagination Subset Correctness**
    - **Validates: Requirements 2.5**

  - [ ]* 9.3 Write property test for filter correctness
    - **Property 8: Filter Correctness**
    - **Validates: Requirements 2.6**

  - [ ]* 9.4 Write unit tests for LeadService
    - Test createLead with valid data
    - Test createLead throws DuplicateError for existing email
    - Test findAllLeads returns paginated results with correct metadata
    - Test findAllLeads filters by status correctly
    - Test findAllLeads filters by search term correctly
    - Test findLeadById returns lead for valid ID
    - Test findLeadById throws NotFoundError for non-existent ID
    - Test updateLeadStatus validates transition and creates activity
    - Test updateLeadStatus throws InvalidTransitionError for invalid transition
    - Mock Lead model, ActivityService, and StatusValidator
    - _Requirements: 1.1, 1.5, 2.1, 2.5, 2.6, 3.1, 3.5, 7.1, 7.5, 7.7_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement controllers
  - [ ] 11.1 Create LeadController class (controllers/leadController.js)
    - Implement constructor with dependency injection (LeadService)
    - Implement createLead method (extract body, call service, return 201 with success response)
    - Implement getAllLeads method (extract query params, call service, return 200 with pagination)
    - Implement getLeadById method (extract ID param, call service, return 200 with success response)
    - Implement updateLeadStatus method (extract ID and body, call service, return 200 with success response)
    - All methods should pass errors to next(error)
    - _Requirements: 1.1, 1.7, 2.1, 2.4, 2.7, 3.1, 3.7, 7.1, 9.2, 9.3_

  - [ ] 11.2 Create ActivityController class (controllers/activityController.js)
    - Implement constructor with dependency injection (ActivityService)
    - Implement createActivity method (extract leadId and body, call service, return 201 with success response)
    - Implement getActivitiesByLeadId method (extract leadId, call service, return 200 with success response)
    - All methods should pass errors to next(error)
    - _Requirements: 4.1, 4.10, 6.1, 6.4, 9.2, 9.3_

- [ ] 12. Implement middleware components
  - [ ] 12.1 Create error handler middleware (middlewares/errorHandler.js)
    - Implement errorHandler function (err, req, res, next)
    - Log error with context (message, stack, statusCode, path, method, timestamp)
    - Map error types to HTTP status codes
    - Format error response: {status: "error", message, errorCode}
    - Don't expose stack traces in production
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.8, 12.2, 12.8, 13.2, 13.4_

  - [ ] 12.2 Create request logger middleware (middlewares/requestLogger.js)
    - Implement requestLogger function that logs method, path, timestamp for each request
    - Use logger utility
    - _Requirements: 13.1_

- [x] 13. Implement routes
  - [x] 13.1 Create lead routes (routes/lead.routes.js)
    - Define POST /leads with validateLeadCreation middleware
    - Define GET /leads (no validation needed for query params)
    - Define GET /leads/:id with validateObjectId middleware
    - Define PATCH /leads/:id/status with validateObjectId and validateStatusUpdate middlewares
    - Map routes to controller methods
    - _Requirements: 1.1, 2.1, 3.1, 7.1, 9.1, 9.2, 14.7_

  - [x] 13.2 Create activity routes (routes/activity.routes.js)
    - Define POST /leads/:id/activities with validateObjectId and validateActivityCreation middlewares
    - Define GET /leads/:id/activities with validateObjectId middleware
    - Map routes to controller methods
    - _Requirements: 4.1, 6.1, 9.1, 9.2, 14.7_

- [ ] 14. Create application entry point
  - [ ] 14.1 Implement main application file (src/index.js)
    - Initialize Express app
    - Apply middleware: express.json(), requestLogger
    - Mount routes: /leads (lead.routes and activity.routes)
    - Apply error handler middleware (must be last)
    - Implement startServer function with database connection
    - Implement graceful shutdown handler (SIGTERM)
    - Start server on configured PORT
    - Export app for testing
    - _Requirements: 9.1, 9.2, 10.1, 13.1, 14.7, 15.1, 15.6_

  - [ ] 14.2 Add health check endpoint
    - Implement GET /health endpoint
    - Return status, timestamp, uptime, database connection state
    - _Requirements: 15.3_

- [ ] 15. Write integration tests
  - [ ]* 15.1 Write integration tests for POST /leads
    - Test successful lead creation returns 201 with correct format
    - Test missing required fields returns 400 with VALIDATION_ERROR
    - Test invalid email format returns 400
    - Test duplicate email returns 409 with DUPLICATE_ENTRY
    - Test invalid status value returns 400
    - Use mongodb-memory-server for test database
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7, 12.1, 12.3, 12.4, 12.5_

  - [ ]* 15.2 Write integration tests for GET /leads
    - Test successful retrieval returns 200 with array and pagination metadata
    - Test pagination with different page and limit values
    - Test filtering by status
    - Test filtering by search term (name and email)
    - Test empty results return 200 with empty array
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 12.1, 12.3_

  - [ ]* 15.3 Write integration tests for GET /leads/:id
    - Test successful retrieval returns 200 with lead object
    - Test invalid ID format returns 400
    - Test non-existent ID returns 404 with LEAD_NOT_FOUND
    - Test response does not include activities array
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 12.1, 12.3, 12.6_

  - [ ]* 15.4 Write integration tests for PATCH /leads/:id/status
    - Test valid status transition returns 200 with updated lead
    - Test invalid transition returns 400 with INVALID_STATUS_TRANSITION
    - Test transition to CLOSED with reason saves reason field
    - Test status change creates automatic activity
    - Test non-existent lead returns 404
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 12.1, 12.5_

  - [ ]* 15.5 Write integration tests for POST /leads/:id/activities
    - Test successful activity creation returns 201 with activity object
    - Test missing required fields returns 400
    - Test invalid activity type returns 400
    - Test non-existent lead returns 404
    - Test invalid lead ID format returns 400
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.10, 12.1, 12.4, 12.5_

  - [ ]* 15.6 Write integration tests for GET /leads/:id/activities
    - Test successful retrieval returns 200 with activities array sorted by createdAt desc
    - Test non-existent lead returns 404
    - Test invalid lead ID format returns 400
    - Test empty activities return 200 with empty array
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 12.1, 12.3_

  - [ ]* 15.7 Write integration tests for error response consistency
    - Test all error responses follow {status: "error", message, errorCode} format
    - Test correct HTTP status codes for different error types
    - Test stack traces are not exposed in production mode
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 16. Write database schema tests
  - [ ]* 16.1 Write smoke tests for database schemas
    - Test Lead model has required indexes (email, status, createdAt)
    - Test Activity model has required indexes (leadId, createdAt, compound)
    - Test email uniqueness is enforced at database level
    - Test Lead schema validation rejects invalid data
    - Test Activity schema validation rejects invalid data
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Run complete test suite (unit, property, integration, smoke tests)
  - Verify all requirements are covered by tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Create documentation
  - [ ] 18.1 Create README.md
    - Document project overview and features
    - Document installation and setup instructions
    - Document environment variables
    - Document API endpoints with examples
    - Document testing instructions
    - _Requirements: 14.6_

  - [ ] 18.2 Create architecture.md
    - Document design trade-offs (embedded vs separate collections)
    - Document clean architecture layer responsibilities
    - Document status state machine
    - Document error handling strategy
    - Document performance and scalability considerations
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end API behavior
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- All tests use Jest as the test runner
- Property tests use fast-check library with minimum 100 iterations
- Integration tests use mongodb-memory-server for isolated test database
- The implementation follows clean architecture with strict layer separation
- Services are framework-agnostic and use dependency injection for testability
