const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password
});

/**
 * Connect to the database
 */
exports.connect = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        age INT NOT NULL,
        address JSONB NULL,
        additional_info JSONB NULL
      );
    `);
    
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

/**
 * Insert a user into the database
 * @param {string} name 
 * @param {number} age 
 * @param {Object} address 
 * @param {Object} additionalInfo 
 * @returns {Object} 
 */
exports.insertUser = async (name, age, address, additionalInfo) => {
  const client = await pool.connect();
  
  try {
    const query = `
      INSERT INTO public.users (name, age, address, additional_info)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const values = [name, age, JSON.stringify(address), JSON.stringify(additionalInfo)];
    const result = await client.query(query, values);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error inserting user:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get the total count of users
 * @returns {number} 
 */
exports.getUserCount = async () => {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT COUNT(*) FROM public.users');
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Error getting user count:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get counts of users in different age groups
 * @returns {Object} 
 */
exports.getAgeCounts = async () => {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT
        SUM(CASE WHEN age < 20 THEN 1 ELSE 0 END) AS under20,
        SUM(CASE WHEN age >= 20 AND age < 40 THEN 1 ELSE 0 END) AS between20And40,
        SUM(CASE WHEN age >= 40 AND age < 60 THEN 1 ELSE 0 END) AS between40And60,
        SUM(CASE WHEN age >= 60 THEN 1 ELSE 0 END) AS over60
      FROM public.users;
    `;
    
    const result = await client.query(query);
    return {
      under20: parseInt(result.rows[0].under20) || 0,
      between20And40: parseInt(result.rows[0].between20and40) || 0,
      between40And60: parseInt(result.rows[0].between40and60) || 0,
      over60: parseInt(result.rows[0].over60) || 0
    };
  } catch (error) {
    console.error('Error getting age counts:', error);
    throw error;
  } finally {
    client.release();
  }
};