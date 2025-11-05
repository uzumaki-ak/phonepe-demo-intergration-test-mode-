import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';

// Loading environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/payment', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'PhonePe Payment Gateway API',
    version: '1.0.0',
    mode: 'LIVE',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(` Payment Mode: LIVE`);
  console.log(`Health check: http://localhost:${PORT}/api/payment/health`);
});