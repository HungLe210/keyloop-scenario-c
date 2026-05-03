class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;

        // Bind methods to preserve 'this' context
        this.createActivity = this.createActivity.bind(this);
        this.getActivitiesByLeadId = this.getActivitiesByLeadId.bind(this);
    }

    async createActivity(req, res, next) {
        try {
            const leadId = req.params.leadId;
            const activityData = req.body;

            const activity = await this.activityService.createActivity(leadId, activityData);

            res.status(201).json({
                status: 'success',
                data: activity
            });
        } catch (error) {
            next(error);
        }
    }

    async getActivitiesByLeadId(req, res, next) {
        try {
            // Middleware already validated and transformed
            const { leadId } = req.params;
            const { page, limit } = req.query;

            const result = await this.activityService.findActivitiesByLeadId(leadId, {
                page,
                limit
            });

            res.status(200).json({
                status: 'success',
                data: result.activities,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ActivityController;
