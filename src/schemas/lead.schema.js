const { z } = require('zod');

/**
 * Query parameters for getting leads
 */
const getLeadsSchema = z.object({
    query: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .transform(val => parseInt(val, 10))
            .refine(val => val > 0, 'Page must be greater than 0')
            .optional(),

        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .transform(val => parseInt(val, 10))
            .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
            .optional()
    }).strict()
});

module.exports = {
    getLeadsSchema
};
