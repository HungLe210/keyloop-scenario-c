const { z } = require('zod');
const sanitize = require('../utils/sanitize');
const { ACTIVITY_TYPE } = require('../utils/constants');

/**
 * Activity creation schema with validation and sanitization
 */
const createActivitySchema = z.object({
    params: z.object({
        leadId: z.string()
            .regex(/^\d+$/, 'Lead ID must be a positive integer')
            .transform(val => parseInt(val, 10))
    }).strict(),
    body: z.object({
        type: z.enum(Object.values(ACTIVITY_TYPE), {
            required_error: 'Activity type is required',
            invalid_type_error: `Activity type must be one of: ${Object.values(ACTIVITY_TYPE).join(', ')}`
        }),
        note: z.string({
            required_error: 'Note is required',
            invalid_type_error: 'Note must be a string'
        })
            .min(1, 'Note cannot be empty')
            .max(2000, 'Note cannot exceed 2000 characters')
            .transform(val => sanitize.stripHtml(val)) // Strip HTML to prevent XSS
    }).strict() // Reject any extra fields not defined in schema
});

/**
 * Get lead by ID schema with optional activity pagination
 */
const getLeadByIdSchema = z.object({
    params: z.object({
        leadId: z.string()
            .regex(/^\d+$/, 'Lead ID must be a positive integer')
            .transform(val => parseInt(val, 10))
    }).strict()
});

/**
 * Get activities by lead ID schema with pagination
 */
const getActivitiesSchema = z.object({
    params: z.object({
        leadId: z.string()
            .regex(/^\d+$/, 'Lead ID must be a positive integer')
            .transform(val => parseInt(val, 10))
    }).strict(),
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
    createActivitySchema,
    getLeadByIdSchema,
    getActivitiesSchema
};
