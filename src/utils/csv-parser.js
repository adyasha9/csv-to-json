const fs = require('fs');
const csv = require('csv-parser');

/**
 * Parse CSV file and convert to array of JSON objects
 * @param {string} filePath 
 * @returns {Promise<Array>} 
 */
exports.parseFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .on('error', (error) => {
        reject(new Error(`Error reading CSV file: ${error.message}`));
      })
      .pipe(csv({ trim: true }))
      .on('data', (data) => {
        const cleanData = {};
        for (const key in data) {
          const cleanKey = key.trim();
          cleanData[cleanKey] = data[key];
        }
        results.push(cleanData);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(new Error(`Error parsing CSV data: ${error.message}`));
      });
  });
};

/**
 * Parse CSV file with stream processing for large files
 * @param {string} filePath 
 * @param {Function} processChunk 
 * @param {number} batchSize 
 * @returns {Promise<number>} 
 */
exports.parseFileWithStreaming = (filePath, processChunk, batchSize = 1000) => {
  return new Promise((resolve, reject) => {
    let batch = [];
    let totalProcessed = 0;
    
    fs.createReadStream(filePath)
      .on('error', (error) => {
        reject(new Error(`Error reading CSV file: ${error.message}`));
      })
      .pipe(csv({ trim: true }))
      .on('data', async (data) => {
        const cleanData = {};
        for (const key in data) {
          const cleanKey = key.trim();
          cleanData[cleanKey] = data[key];
        }
        
        batch.push(cleanData);
        
        // Process in batches to avoid memory issues with large files
        if (batch.length >= batchSize) {
          // Pause the stream while processing the batch
          this.pause();
          
          try {
            await processChunk(batch);
            totalProcessed += batch.length;
            batch = [];
            this.resume();
          } catch (error) {
            this.destroy(error);
          }
        }
      })
      .on('end', async () => {
        // Process any remaining records
        if (batch.length > 0) {
          try {
            await processChunk(batch);
            totalProcessed += batch.length;
          } catch (error) {
            return reject(error);
          }
        }
        
        resolve(totalProcessed);
      })
      .on('error', (error) => {
        reject(new Error(`Error parsing CSV data: ${error.message}`));
      });
  });
};