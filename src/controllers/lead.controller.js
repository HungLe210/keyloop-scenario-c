class LeadController {
    constructor(leadService) {
        this.leadService = leadService;

        // Bind methods to preserve 'this' context
        this.getAllLeads = this.getAllLeads.bind(this);
        this.getLeadById = this.getLeadById.bind(this);
    }

    async getAllLeads(req, res, next) {
        try {
            // Middleware already validated and transformed to numbers
            const { page, limit } = req.query;

            const result = await this.leadService.findAllLeads({
                page,
                limit
            });

            res.status(200).json({
                status: 'success',
                data: result.leads,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    async getLeadById(req, res, next) {
        try {
            // Middleware already validated and transformed
            const { leadId } = req.params;

            const lead = await this.leadService.findLeadById(leadId);

            res.status(200).json({
                status: 'success',
                data: lead
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = LeadController;
