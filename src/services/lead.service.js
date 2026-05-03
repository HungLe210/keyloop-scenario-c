const { NotFoundError, ValidationError } = require('../errors');

class LeadService {
    constructor(leadModel, activityService) {
        this.Lead = leadModel;
        this.activityService = activityService;
    }

    async findAllLeads(options = {}) {
        const { page, limit } = options;

        // Validate pagination params - both or neither
        if ((page && !limit) || (!page && limit)) {
            throw new ValidationError('Both page and limit must be provided for pagination');
        }

        // page and limit are already numbers or undefined from controller
        const usePagination = page !== undefined && limit !== undefined;

        const { leads, total } = await this.Lead.findAll({
            page: usePagination ? page : null,
            limit: usePagination ? limit : null
        });

        // Always return consistent pagination shape
        const response = {
            leads,
            pagination: {
                page: usePagination ? page : null,
                limit: usePagination ? limit : null,
                total,
                totalPages: usePagination ? Math.ceil(total / limit) : null
            }
        };

        return response;
    }

    async findLeadById(leadId) {
        const lead = await this.Lead.findById(leadId);

        if (!lead) {
            throw new NotFoundError('Lead', leadId);
        }

        // Get 5 most recent activities as preview
        const activityResult = await this.activityService.findActivitiesByLeadId(leadId, {
            page: 1,
            limit: 5
        });

        return {
            ...lead,
            recentActivities: activityResult.activities
        };
    }
}

module.exports = LeadService;
