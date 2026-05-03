const express = require('express');
const logger = require('./utils/logger');
const config = require('./config/env');
const { connectDB, closeDB } = require('./config/database');
const requestLogger = require('./middlewares/requestLogger.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/', routes);
app.use(errorHandler);

async function startServer() {
    try {
        logger.info('Starting server...');
        await connectDB();

        const server = app.listen(config.port, () => {
            logger.info(`Server started successfully`, {
                port: config.port,
                nodeEnv: config.nodeEnv,
                timestamp: new Date().toISOString()
            });
        });

        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} received, starting graceful shutdown...`);

            server.close(async () => {
                logger.info('HTTP server closed');

                try {
                    await closeDB();
                    logger.info('Graceful shutdown completed');
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during graceful shutdown', {
                        error: error.message,
                        stack: error.stack
                    });
                    process.exit(1);
                }
            });

            setTimeout(() => {
                logger.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        return server;

    } catch (error) {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
