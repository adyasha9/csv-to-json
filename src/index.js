require('dotenv').config();
const app = require('./app');
const db = require('./db/db');

const PORT = process.env.PORT || 3000;


db.connect()
  .then(() => {
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });