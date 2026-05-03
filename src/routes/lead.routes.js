const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const { getLeadsSchema } = require('../schemas/lead.schema');
const { getLeadByIdSchema } = require('../schemas/activity.schema');
const { leadController } = require('../container');

// All routes here are prefixed with /leads from parent router

router.get('/', validate(getLeadsSchema), leadController.getAllLeads);
router.get('/:leadId', validate(getLeadByIdSchema), leadController.getLeadById);

module.exports = router;
