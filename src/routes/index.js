const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const logger = require('../utils/logger');
const leadRoutes = require('./lead.routes');
const activityRoutes = require('./activity.routes');

router.get('/health', async (req, res) => {
    let dbConnected = false;

    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        dbConnected = true;
    } catch (error) {
        logger.error({
            message: 'Health check failed',
            error: error.message
        });
    }

    const statusCode = dbConnected ? 200 : 500;
    res.status(statusCode).json({
        status: dbConnected ? 'success' : 'error',
        data: {
            status: dbConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: {
                connected: dbConnected
            }
        }
    });
});

router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            version: '1.0.0',
            description: 'Sales Lead Management API',
            endpoints: {
                health: 'GET /health',
                leads: {
                    list: 'GET /leads',
                    listPaginated: 'GET /leads?page=1&limit=10',
                    getById: 'GET /leads/:leadId (includes activities)'
                },
                activities: {
                    create: 'POST /leads/:leadId/activities'
                }
            }
        }
    });
});

// Mount lead routes with /leads prefix
router.use('/leads', leadRoutes);

// Mount activity routes with /leads prefix (activity routes handle /:leadId/activities)
router.use('/leads', activityRoutes);

module.exports = router;
