const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function runMigrations() {
    let connection;

    try {
        console.log('🔌 Connecting to MySQL server...');
        // Connect without database selection first
        connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            multipleStatements: true
        });
        console.log('✅ Connected to MySQL server successfully\n');

        // Drop existing database for clean setup
        console.log('🗑️  Dropping existing database (if exists)...');
        await connection.query('DROP DATABASE IF EXISTS sales_lead_management');
        console.log('✅ Database dropped\n');

        // Read and execute migration files in order
        const migrationFiles = [
            '001_create_tables.sql',
            '002_seed_data.sql'
        ];

        for (const file of migrationFiles) {
            const filePath = path.join(__dirname, '..', 'migrations', file);

            console.log(`📄 Running migration: ${file}`);

            try {
                const sql = await fs.readFile(filePath, 'utf8');
                await connection.query(sql);
                console.log(`✅ ${file} executed successfully\n`);
            } catch (error) {
                console.error(`❌ Error executing ${file}:`, error.message);
                throw error;
            }
        }

        console.log('🎉 All migrations completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run migrations
runMigrations();
