const express = require('express');
const router = express.Router();
const { processCsvFile, getAgeDistribution } = require('../controllers/csvController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.CSV_UPLOAD_PATH || 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== '.csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/process-csv', upload.single('csvFile'), processCsvFile);

router.get('/age-distribution', getAgeDistribution);

module.exports = router;