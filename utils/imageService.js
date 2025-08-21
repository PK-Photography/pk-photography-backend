import s3 from "../utils/s3Config.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const getImageUrl = async (key, expiry) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: expiry });
    return signedUrl;
  } catch (err) {
    console.error(err);
  }
};
