const mongoose = require('mongoose');

let isConnected = false;
let isMockFallback = false;

// In-memory collections for zero-dependency fallback when no MongoDB daemon is running locally
const memoryStore = {
  devices: new Map(),
  readings: [],
  alerts: [],
  settings: new Map()
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smoke_detection';

  try {
    console.log(`[MongoDB] Connecting to ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isConnected = true;
    isMockFallback = false;
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to local/remote MongoDB daemon (${err.message}).`);
    console.log(`[MongoDB] Running with resilient in-memory storage fallback. Database models will operate seamlessly.`);
    isConnected = true; // resilient fallback active
    isMockFallback = true;
  }

  mongoose.connection.on('disconnected', () => {
    if (!isMockFallback) {
      console.warn('[MongoDB] Disconnected from database');
      isConnected = false;
    }
  });

  return isConnected;
};

const getStatus = () => ({
  isConnected,
  isMockFallback,
  readyState: mongoose.connection.readyState,
  host: isMockFallback ? 'in-memory-fallback' : (mongoose.connection.host || 'unknown'),
  name: isMockFallback ? 'smoke_detection_memory' : (mongoose.connection.name || 'unknown')
});

module.exports = { connectDB, getStatus, memoryStore, isFallbackActive: () => isMockFallback };
