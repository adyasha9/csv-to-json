const converterService = require('../services/converter');
const db = require('../db/db');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');

exports.convertCsvToJson = async (req, res, next) => {
  try {
    const filePath = req.body.filePath || config.csvFilePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    const results = await converterService.parseCsvFile(filePath);
    res.status(200).json({
      message: 'CSV file successfully converted to JSON',
      count: results.length,
      results: results 
    });
  } catch (error) {
    next(error);
  }
};


exports.processFile = async (req, res, next) => {
  try {
    const filePath = req.query.filePath || config.csvFilePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'CSV file not found' });
    }
    
    const results = await converterService.parseCsvFile(filePath);
    const processedRecords = await converterService.processCsvData(results);
    
    const ageDistribution = await converterService.calculateAgeDistribution();
    
    console.log("==== Age Distribution Report ====");
    console.log("Age-Group   % Distribution");
    console.log("< 20        ", ageDistribution["<20"]);
    console.log("20 to 40    ", ageDistribution["20-40"]);
    console.log("40 to 60    ", ageDistribution["40-60"]);
    console.log("> 60        ", ageDistribution[">60"]);
    console.log("================================");
    
    res.status(200).json({
      message: 'CSV file processed and data stored in database',
      recordsProcessed: processedRecords,
      ageDistribution: ageDistribution
    });
  } catch (error) {
    next(error);
  }
};


exports.getAgeDistribution = async (req, res, next) => {
  try {
    const ageDistribution = await converterService.calculateAgeDistribution();
    
    res.status(200).json({
      ageDistribution: ageDistribution
    });
  } catch (error) {
    next(error);
  }
};