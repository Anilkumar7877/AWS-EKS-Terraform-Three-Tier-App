const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'unknown';
  
  switch(dbState) {
    case 0:
      dbStatus = 'disconnected';
      break;
    case 1:
      dbStatus = 'connected';
      break;
    case 2:
      dbStatus = 'connecting';
      break;
    case 3:
      dbStatus = 'disconnecting';
      break;
  }

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: 'UP',
    timestamp: new Date(),
    services: {
      api: {
        status: 'UP'
      },
      database: {
        status: isHealthy ? 'UP' : 'DOWN',
        details: dbStatus
      }
    }
  });
});

module.exports = router;
