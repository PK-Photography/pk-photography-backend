import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import morgan from 'morgan';
import moment from 'moment-timezone';
import passport from "passport";
import session from "express-session";
import "./services/passport.js";


const app = express();

dotenv.config({
  path: './.env'
});

// app.use('./services/passport.js')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
const __filename = fileURLToPath(import.meta.url);


// Custom format string with the IST timestamp token
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


app.use(cors(
  {
    origin: '*',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json({
  limit: '50mb'
}));

app.use('/api/v1', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
app.get('/', (req, res) => {
  res.send('Server is runnning...');
})

connectDB();

export default app;
