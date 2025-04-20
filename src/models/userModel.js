/**
 * Save parsed users to the database
 * @param {Object} db 
 * @param {Array} users 
 * @returns {Promise<number>} 
 */
exports.saveUsersToDB = async (db, users) => {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      let savedCount = 0;
      
      const batchSize = 1000;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const placeholders = batch.map(() => "(?, ?, ?, ?)").join(', ');
        
        const params = batch.flatMap(user => [
          user.name,
          user.age,
          JSON.stringify(user.address),
          JSON.stringify(user.additional_info)
        ]);
        
        const query = `
          INSERT INTO users (name, age, address, additional_info)
          VALUES ${placeholders}
        `;
        
        const [result] = await connection.query(query, params);
        savedCount += result.affectedRows;
      }
      
      await connection.commit();
      
      return savedCount;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  };
  
  /**
   * Get all users from database
   * @param {Object} db 
   * @returns {Promise<Array>} 
   */
  exports.getAllUsers = async (db) => {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  };
  
  /**
   * Get age distribution statistics
   * @param {Object} db 
   * @returns {Promise<Object>} 
   */
  exports.getAgeDistribution = async (db) => {
    const query = `
      SELECT
        SUM(age < 20) AS less_than_20,
        SUM(age >= 20 AND age < 40) AS between_20_and_40,
        SUM(age >= 40 AND age < 60) AS between_40_and_60,
        SUM(age >= 60) AS greater_than_60,
        COUNT(*) AS total
      FROM users
    `;
    
    const [rows] = await db.query(query);
    return rows[0];
  };