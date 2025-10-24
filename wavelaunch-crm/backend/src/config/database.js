const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Database Configuration and Connection
 *
 * Sets up PostgreSQL connection using Sequelize ORM
 * Supports connection pooling and SSL for production
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      // Enable SSL for production
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }),
    },
  }
);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established successfully');
    return true;
  } catch (error) {
    console.error('✗ Unable to connect to database:', error.message);
    return false;
  }
};

/**
 * Initialize database (create tables)
 */
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database synchronized');
    return true;
  } catch (error) {
    console.error('✗ Database sync failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase,
};
