const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/health', healthRoutes);

// MongoDB URI fallback for local testing
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/threetier';
const PORT = process.env.PORT || 5000;

console.log('Connecting to MongoDB at:', mongoURI);

mongoose.connect(mongoURI)
  .then(() => {
    console.log('MongoDB Connected Successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Failed:', err.message);
    // Still start Express server so /api/health can report the DB is down
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (Database Offline)`);
    });
  });
