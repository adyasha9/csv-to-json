const express = require('express');
const cors = require('cors');
const converterController = require('./controllers/converter');
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/api/convert', converterController.convertCsvToJson);
app.get('/api/process-file', converterController.processFile);
app.get('/api/age-distribution', converterController.getAgeDistribution);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong',
  });
});

module.exports = app;