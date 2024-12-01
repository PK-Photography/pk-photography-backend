import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cardRoutes from './routes/cardRoutes.js';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
const app = express();

dotenv.config({
  path: './.env'
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const __filename = fileURLToPath(import.meta.url);


app.use(cors(
  {
    origin: "https://www.pkphotography.io",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }
));
app.use(express.json({
  limit: '50mb'
}));


app.use('/api', cardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});
app.get('/', (req, res) => {
  res.send('Hello World!');
})

connectDB();

export default app;
