const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./data/connection/connection');
require('./data/modelList.js'); // Import all models

const app = express();

app.use(cors());
app.use(express.json());


// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User Management System API is running'
  });
});

app.use('/api', require('./routes'))


// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log('Database connection successful');

    await sequelize.sync({ alter: true  });   // false 

    console.log('Database models synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

startServer();
