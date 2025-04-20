const csvParser = require('../utils/csv-parser');
const db = require('../db/db');

/**
 * Parse CSV file and return JSON objects
 * @param {string} filePath 
 * @returns {Promise<Array>} 
 */
exports.parseCsvFile = async (filePath) => {
  try {
    return await csvParser.parseFile(filePath);
  } catch (error) {
    throw new Error(`Error parsing CSV file: ${error.message}`);
  }
};

/**
 * Process CSV data and store in database
 * @param {Array} data 
 * @returns {number} 
 */
exports.processCsvData = async (data) => {
  try {
    let processedRecords = 0;
    
    for (const record of data) {
      const firstName = record['name.firstName'] || '';
      const lastName = record['name.lastName'] || '';
      const age = parseInt(record.age) || 0;
      
      const fullName = `${firstName} ${lastName}`.trim();
      
      const addressFields = Object.keys(record).filter(key => key.startsWith('address.'));
      const address = {};
      
      for (const field of addressFields) {
        const addressKey = field.replace('address.', '');
        address[addressKey] = record[field];
        delete record[field]; 
      }
      
      delete record['name.firstName'];
      delete record['name.lastName'];
      delete record.age;
      
      const additionalInfo = processNestedProperties(record);
      
      await db.insertUser(fullName, age, address, additionalInfo);
      processedRecords++;
    }
    
    return processedRecords;
  } catch (error) {
    throw new Error(`Error processing CSV data: ${error.message}`);
  }
};

/**
 * Calculate age distribution of users
 * @returns {Object} 
 */
exports.calculateAgeDistribution = async () => {
  try {
    const userCount = await db.getUserCount();
    
    if (userCount === 0) {
      return {
        '<20': 0,
        '20-40': 0,
        '40-60': 0,
        '>60': 0
      };
    }
    
    const ageCounts = await db.getAgeCounts();
    
    const distribution = {
      '<20': Math.round((ageCounts.under20 / userCount) * 100),
      '20-40': Math.round((ageCounts.between20And40 / userCount) * 100),
      '40-60': Math.round((ageCounts.between40And60 / userCount) * 100),
      '>60': Math.round((ageCounts.over60 / userCount) * 100)
    };
    
    const total = distribution['<20'] + distribution['20-40'] + distribution['40-60'] + distribution['>60'];
    
    if (total !== 100 && total > 0) {
      const keys = Object.keys(distribution);
      const largestKey = keys.reduce((max, key) => 
        distribution[key] > distribution[max] ? key : max, keys[0]);
      
      distribution[largestKey] += (100 - total);
    }
    
    return distribution;
  } catch (error) {
    throw new Error(`Error calculating age distribution: ${error.message}`);
  }
};

/**
 * Process nested properties into a structured object
 * @param {Object} record 
 * @returns {Object} 
 */
function processNestedProperties(record) {
  const result = {};
  
  for (const key in record) {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      
      current[parts[parts.length - 1]] = record[key];
    } else {
      result[key] = record[key];
    }
  }
  
  return result;
}