// middleware/uploadMiddleware.js
import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../utils/s3Config.js";

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, `blogs/${uniqueName}`);
    },
  }),
});

export default upload;
