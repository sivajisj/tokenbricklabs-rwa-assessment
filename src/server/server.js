const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Blockchain provider setup
const provider = new ethers.providers.InfuraProvider('sepolia', process.env.INFURA_PROJECT_ID);

const LENDING_POOL_ADDRESS = '0xc2a7809322bdce4d50e12ba05efdc967948b4870';
const USER_ADDRESS = '0x3F7032d3fD8aA2380a8cc7EE1b0Ed8AB7Eb6Fcd6';

const LENDING_POOL_ABI = [
  'function getUserPosition(address user) view returns (uint256 collateralUsd, uint256 debtUsd, uint256 healthFactor, bool liquidatable)'
];

const lendingPool = new ethers.Contract(
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
  provider
);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression and logging
app.use(compression());
app.use(morgan('combined'));

// Routes
app.use('/api/assets', require('./routes/assets'));
app.use('/api/validators', require('./routes/validators'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ipfs', require('./routes/ipfs'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Blockchain API: reads a user's position from the Sepolia LendingPool contract
app.get('/api/SivajiApiTest', async (req, res) => {
  try {
    const position = await lendingPool.getUserPosition(USER_ADDRESS);

    // collateralUsd and healthFactor use 18 decimals; debtUsd uses 6
    const result = {
      collateralUsd: ethers.utils.formatUnits(position.collateralUsd, 18),
      debtUsd: ethers.utils.formatUnits(position.debtUsd, 6),
      healthFactor: ethers.utils.formatUnits(position.healthFactor, 18),
      liquidatable: position.liquidatable
    };

    console.log('Sepolia LendingPool User Position:');
    console.log(result);

    res.json({
      success: true,
      network: 'sepolia',
      contract: LENDING_POOL_ADDRESS,
      user: USER_ADDRESS,
      position: result
    });
  } catch (error) {
    console.error('Failed to fetch LendingPool position:', error);

    res.status(502).json({
      success: false,
      error: 'Failed to fetch blockchain data'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
