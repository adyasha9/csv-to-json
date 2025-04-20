require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'csvconverter',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  csvFilePath: process.env.CSV_FILE_PATH || './data/users.csv'
};