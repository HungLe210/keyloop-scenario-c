const { execute } = require('../config/database');

class Activity {
    /**
     * Create a new activity
     * @param {Object} data - { lead_id, type, note }
     * @returns {Promise<Object>} Created activity with id
     */
    static async create(data) {
        const { lead_id, type, note } = data;

        const result = await execute(
            `INSERT INTO activities (lead_id, type, note) 
             VALUES (?, ?, ?)`,
            [lead_id, type, note]
        );

        // Return the created activity
        const rows = await execute(
            'SELECT * FROM activities WHERE id = ?',
            [result.insertId]
        );

        return rows[0];
    }

    /**
     * Find all activities for a lead (chronological order) with optional pagination
     * @param {number} leadId - Lead ID
     * @param {Object} options - { page, limit } (already numbers or null)
     * @returns {Promise<Object>} { activities, total }
     */
    static async findByLeadId(leadId, options = {}) {
        const { page = null, limit = null } = options;

        // Get total count
        const countQuery = 'SELECT COUNT(*) as total FROM activities WHERE lead_id = ?';
        const countRows = await execute(countQuery, [leadId]);
        const total = countRows[0].total;

        // Build data query with optional pagination
        let dataQuery = `SELECT * FROM activities 
                         WHERE lead_id = ? 
                         ORDER BY created_at DESC`;
        let params = [leadId];

        // Only add LIMIT/OFFSET if pagination params are provided
        if (page !== null && limit !== null) {
            const offset = (page - 1) * limit;
            // Use direct values for LIMIT/OFFSET (already validated as numbers)
            dataQuery += ` LIMIT ${limit} OFFSET ${offset}`;
        }

        const rows = await execute(dataQuery, params);

        return {
            activities: rows,
            total
        };
    }
}

module.exports = Activity;
