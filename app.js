import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import morgan from 'morgan';
import moment from 'moment-timezone';

const app = express();

dotenv.config({ path: './.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const __filename = fileURLToPath(import.meta.url);

// Custom morgan format for logging
const morganFormat = '":method :url HTTP/:http-version" :status :res[content-length] ":referrer"';

// Middleware to log HTTP requests using morgan
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => {
      console.log(message); // Use console.log to output logs
    }
  }
}));

// Custom token to log timestamp in IST
morgan.token('istDate', (req, res) => {
  return moment().tz('Asia/Kolkata').format('DD/MMM/YYYY:HH:mm:ss ZZ');
});

// CORS configuration to allow all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true // Enable credentials if necessary
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api/v1', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.get('/', (req, res) => {
  res.send('Server is running...');
});

connectDB();

export default app;
