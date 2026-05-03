const { execute } = require('../config/database');

class Lead {
    /**
     * Find lead by ID
     * @param {number} id - Lead ID
     * @returns {Promise<Object|null>} Lead object or null
     */
    static async findById(id) {
        const rows = await execute(
            'SELECT * FROM leads WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    }

    /**
     * Find all leads with optional pagination
     * @param {Object} options - { page, limit } (already numbers or null)
     * @returns {Promise<Object>} { leads: [], total: number }
     */
    static async findAll(options = {}) {
        const {
            page = null,
            limit = null
        } = options;

        const params = [];

        // Get total count
        const countQuery = 'SELECT COUNT(*) as total FROM leads';
        const countRows = await execute(countQuery);
        const total = countRows[0].total;

        // Build data query with optional pagination
        let dataQuery = 'SELECT * FROM leads ORDER BY created_at DESC';

        // Only add LIMIT/OFFSET if pagination params are provided
        if (page !== null && limit !== null) {
            // page and limit are already numbers from service
            const offset = (page - 1) * limit;
            dataQuery += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
        }

        const rows = await execute(dataQuery, params);

        return {
            leads: rows,
            total
        };
    }
}

module.exports = Lead;
