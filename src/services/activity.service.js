const { NotFoundError, ValidationError } = require('../errors');

class ActivityService {
    constructor(activityModel, leadModel) {
        this.Activity = activityModel;
        this.Lead = leadModel;
    }

    async createActivity(leadId, activityData) {
        // Verify lead exists
        const lead = await this.Lead.findById(leadId);
        if (!lead) {
            throw new NotFoundError('Lead', leadId);
        }

        // Data already validated by Zod middleware - trust it
        const { type, note } = activityData;

        // Create activity with lead_id (MySQL column name)
        const activity = await this.Activity.create({
            lead_id: leadId,
            type,
            note
        });

        return activity;
    }

    async findActivitiesByLeadId(leadId, options = {}) {
        // Verify lead exists
        const lead = await this.Lead.findById(leadId);
        if (!lead) {
            throw new NotFoundError('Lead', leadId);
        }

        const { page, limit } = options;

        // Validate pagination params - both or neither
        if ((page && !limit) || (!page && limit)) {
            throw new ValidationError('Both page and limit must be provided for pagination');
        }

        // page and limit are already numbers or undefined from controller
        const usePagination = page !== undefined && limit !== undefined;

        const result = await this.Activity.findByLeadId(leadId, {
            page: usePagination ? page : null,
            limit: usePagination ? limit : null
        });

        // Always return consistent pagination shape
        const response = {
            activities: result.activities,
            pagination: {
                page: usePagination ? page : null,
                limit: usePagination ? limit : null,
                total: result.total,
                totalPages: usePagination ? Math.ceil(result.total / limit) : null
            }
        };

        return response;
    }
}

module.exports = ActivityService;
