// utils/uploadToS3.js
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `resumes/${uuidv4()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return await s3.upload(params).promise();
};