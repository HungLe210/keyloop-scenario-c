/**
 * Dependency Injection Container
 * Centralized place to instantiate and manage all dependencies
 * 
 * Note: Models are imported here for dependency injection,
 * but NOT exported to maintain proper layer separation
 */

// Models (used internally for DI, not exported)
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');

// Services
const ActivityService = require('../services/activity.service');
const LeadService = require('../services/lead.service');

// Controllers
const ActivityController = require('../controllers/activity.controller');
const LeadController = require('../controllers/lead.controller');

// Instantiate services (singleton pattern)
const activityService = new ActivityService(Activity, Lead);
const leadService = new LeadService(Lead, activityService);

// Instantiate controllers
const activityController = new ActivityController(activityService);
const leadController = new LeadController(leadService);

// Export only services and controllers (NOT models)
module.exports = {
    // Services
    activityService,
    leadService,

    // Controllers
    activityController,
    leadController
};
