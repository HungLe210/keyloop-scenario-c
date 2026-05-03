const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const { createActivitySchema, getActivitiesSchema } = require('../schemas/activity.schema');
const { activityController } = require('../container');

// All routes here are prefixed with /leads from parent router

router.get('/:leadId/activities', validate(getActivitiesSchema), activityController.getActivitiesByLeadId);
router.post('/:leadId/activities', validate(createActivitySchema), activityController.createActivity);

module.exports = router;
