require('dotenv').config();

const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
    isProd: process.env.NODE_ENV === 'production',
    isDev: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sales_lead_management'
    }
};

function validateConfig() {
    const requiredVars = [];

    if (config.isProd) {
        if (!process.env.DB_HOST) requiredVars.push('DB_HOST');
        if (!process.env.DB_USER) requiredVars.push('DB_USER');
        if (!process.env.DB_PASSWORD) requiredVars.push('DB_PASSWORD');
        if (!process.env.DB_NAME) requiredVars.push('DB_NAME');
    }

    if (requiredVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${requiredVars.join(', ')}\n` +
            'Please check your .env file or environment configuration.'
        );
    }
}

validateConfig();

module.exports = config;
