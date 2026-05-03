const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const config = require('./env');

let pool = null;

async function createPool() {
    if (pool) {
        return pool;
    }

    try {
        pool = mysql.createPool({
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
            timezone: '+00:00',
            charset: 'utf8mb4'
        });

        logger.info('MySQL connection pool created successfully');
        return pool;
    } catch (error) {
        logger.error('Failed to create MySQL connection pool', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

async function connectDB(maxRetries = 5, initialDelay = 1000) {
    let retries = 0;
    let delay = initialDelay;

    while (retries < maxRetries) {
        try {
            logger.info(`Attempting to connect to MySQL... (attempt ${retries + 1}/${maxRetries})`);

            await createPool();

            // Test connection
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();

            logger.info('MySQL connected successfully', {
                host: config.db.host,
                database: config.db.database
            });
            return;

        } catch (error) {
            retries++;

            if (retries >= maxRetries) {
                logger.error('Failed to connect to MySQL after maximum retries', {
                    error: error.message,
                    attempts: retries
                });
                throw new Error(`Database connection failed after ${maxRetries} attempts: ${error.message}`);
            }

            logger.warn(`MySQL connection failed, retrying in ${delay}ms...`, {
                error: error.message,
                attempt: retries,
                nextRetryIn: delay
            });

            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
        }
    }
}

async function closeDB() {
    if (!pool) {
        logger.info('Database pool already closed');
        return;
    }

    try {
        await pool.end();
        pool = null;
        logger.info('MySQL connection pool closed gracefully');
    } catch (error) {
        logger.error('Error closing MySQL connection pool', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call connectDB() first.');
    }
    return pool;
}

/**
 * Execute a query with prepared statement (use this in models)
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Query parameters (can be empty array)
 * @returns {Promise<Array>} Query results
 */
async function execute(sql, params = []) {
    const connection = await getPool().getConnection();
    try {
        // Always use execute with params array (even if empty)
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        logger.error('Query execution error', {
            error: error.message,
            sql: sql,
            params: params
        });
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Execute a transaction
 * @param {Function} callback - Transaction callback function
 * @returns {Promise<any>}
 */
async function transaction(callback) {
    const connection = await getPool().getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        logger.error('Transaction error', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    connectDB,
    closeDB,
    getPool,
    execute,
    transaction
};
