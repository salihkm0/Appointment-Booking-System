const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

//! Load env vars
dotenv.config();

//! Connect to database
connectDB();

//! Route files
const auth = require('./routes/auth');
const services = require('./routes/services');
const availability = require('./routes/availability');
const appointments = require('./routes/appointments');
const reports = require('./routes/reports');
const dashboard = require('./routes/dashboard');

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


//! Mount routers
app.use('/api/auth', auth);
app.use('/api/services', services);
app.use('/api/availability', availability);
app.use('/api/appointments', appointments);
app.use('/api/reports', reports);
app.use('/api/dashboard', dashboard);

//! Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

//! Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5005;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://localhost:5173`);
});

//! Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});