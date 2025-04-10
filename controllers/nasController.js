import axios from "axios";

// Synology NAS API Details
const NAS_URL = "https://pkphotography.sg4.quickconnect.to";
const API_USER = "toshita";
const API_PASS = "4?voAWnZ";
let sessionId; // Store session ID globally to avoid multiple logins
import sharp from "sharp";

// **🔹 Step 1: Authenticate with Synology NAS**
const authenticateWithNAS = async () => {
    try {
        console.log("Step 1: Authenticating with Synology NAS...");

        const authUrl = `${NAS_URL}/webapi/auth.cgi?api=SYNO.API.Auth&version=6&method=login&account=${API_USER}&passwd=${encodeURIComponent(API_PASS)}&session=FileStation&format=sid`;

        console.log("🔹 Authentication URL:", authUrl);

        const authResponse = await axios.get(authUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        console.log("Authentication Response:", JSON.stringify(authResponse.data, null, 2));

        if (!authResponse.data.success) {
            throw new Error("Authentication failed! Check credentials or API permissions.");
        }

        sessionId = authResponse.data.data.sid;
        console.log("Authentication successful! Session ID:", sessionId);
    } catch (error) {
        console.error("Error during NAS authentication:", error.message);
        throw new Error("Failed to authenticate with NAS");
    }
};

// **🔹 Step 2: Fetch Images from NAS Folder**
export const fetchImagesFromNAS = async (req, res) => {
    try {
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 20;

        if (!sessionId) await authenticateWithNAS();

        const folderPath = req.query.nasUrl || "/photo";
        const listUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(folderPath)}&additional=file_size,real_path&sort_by=name&sort_direction=asc&_sid=${sessionId}`;

        const listResponse = await axios.get(listUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        if (!listResponse.data.success) {
            throw new Error("Failed to list images from NAS!");
        }

        const files = listResponse.data.data.files
            .filter(file => file.name.match(/\.(jpg|jpeg|png)$/i))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

        const paginated = files.slice(offset, offset + limit).map(file => {
            const baseUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&size=large&path=${encodeURIComponent(file.path)}&_sid=${sessionId}`;
            return {
                name: file.name,
                lowRes: `/pk-photography-images?path=${encodeURIComponent(file.path)}&size=large`,
                mediumRes: `/pk-photography-images?path=${encodeURIComponent(file.path)}&size=large`,
                highRes: `/pk-photography-images?path=${encodeURIComponent(file.path)}&size=large`,
                path: file.path,
                shareableLink: baseUrl
            };
        });

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.status(200).json({ images: paginated, total: files.length });
    } catch (error) {
        console.error("Error fetching NAS images:", error.message);
        res.status(500).json({ message: "Failed to fetch NAS images", error: error.message });
    }
};

// **🔹 Step 4: Proxy Image Requests (Stream Image Instead of Redirecting)**
const { fileTypeFromBuffer } = await import('file-type');

export const serveNASImage = async (req, res) => {
    try {
      let { path, size = "original" } = req.query;
  
      if (!path) {
        return res.status(400).json({ message: "Image path is required" });
      }
  
      if (!sessionId) await authenticateWithNAS();
  
      const encodedPath = JSON.stringify([decodeURIComponent(path)]);
      const thumbUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Thumb&version=2&method=get&path=${encodeURIComponent(encodedPath)}&size=${size}&mode=open&_sid=${sessionId}`;
      const downloadUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(encodedPath)}&_sid=${sessionId}`;
  
      let imageBuffer;
  
      try {
        const thumbResponse = await axios.get(thumbUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": NAS_URL,
            "Origin": NAS_URL,
          },
        });

        console.log(thumbUrl);
  
        imageBuffer = thumbResponse.data;
      } catch (thumbErr) {
        console.warn("⚠️ Thumbnail failed, trying original download:", thumbErr.message);
  
        const fallbackResponse = await axios.get(downloadUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Referer": NAS_URL,
            "Origin": NAS_URL,
          },
        });
  
        imageBuffer = fallbackResponse.data;
      }
  
      const { fileTypeFromBuffer } = await import('file-type');
      const type = await fileTypeFromBuffer(imageBuffer);
  
      if (!type || !type.mime.startsWith("image/")) {
        console.error("❌ Invalid image format. File type detected:", type?.mime);
        return res.status(400).json({ message: "Unsupported image format", type: type?.mime });
      }
  
      console.log("✅ Detected type:", type.mime);
  
      // Supported input types for sharp conversion
      const sharpSupportedTypes = ['image/png', 'image/webp', 'image/tiff'];
  
      if (sharpSupportedTypes.includes(type.mime)) {
        const webpBuffer = await sharp(imageBuffer).webp({ quality: 85 }).toBuffer();
  
        res.setHeader("Content-Type", "image/webp");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.status(200).send(webpBuffer);
      } else {
        // Serve original if format is not supported by sharp
        res.setHeader("Content-Type", type.mime);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.status(200).send(imageBuffer);
      }
    } catch (error) {
      console.error("❌ Error serving NAS image:", error.message);
      res.status(500).json({ message: "Failed to serve NAS image", error: error.message });
    }
  };

export const downloadNASImage = async (req, res) => {
    try {
        let { path } = req.query;

        if (!path) {
            return res.status(400).json({ message: "Image or folder path is required" });
        }

        console.log("🔹 Downloading from NAS:", path);

        if (!sessionId) await authenticateWithNAS();

        // Encode path correctly for NAS API
        const encodedPath = JSON.stringify([decodeURIComponent(path)]);
        const downloadUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(encodedPath)}&_sid=${sessionId}`;

        console.log("Fetching from:", downloadUrl);

        const response = await axios.get(downloadUrl, {
            responseType: "stream",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        // Set filename dynamically
        const fileName = path.match(/\.(jpg|jpeg|png|mp3|mp4|pdf)$/i) ? path.split("/").pop() : "NAS_Download.zip";
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", path.match(/\.(jpg|jpeg|png|gif)$/i) ? "image/jpeg" : "application/zip");

        response.data.pipe(res);
    } catch (error) {
        console.error("❌ Error downloading NAS file:", error.message);
        res.status(500).json({ message: "Failed to download NAS file", error: error.message });
    }
};