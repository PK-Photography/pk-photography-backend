import axios from "axios";
import sharp from "sharp";
import stream from "stream";

// Synology NAS API Details
const NAS_URL = "https://pkphotography.sg4.quickconnect.to";
const API_USER = "toshita";
const API_PASS = "4?voAWnZ";
let sessionId; // Store session ID globally to avoid multiple logins

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

        if (!sessionId) await authenticateWithNAS(); // Ensure authentication

        console.log("Step 2: Fetching images from NAS...");

        const folderPath = req.query.nasUrl || "/photo";
        const listUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(folderPath)}&additional=file_size,real_path&sort_by=name&sort_direction=asc&_sid=${sessionId}`;

        console.log("🔹 NAS List API URL:", listUrl);

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
            .filter(file => file.name.match(/\.(jpg|jpeg|png)$/i)) // Only image files
            .map(file => {
                const baseUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&size=medium&path=${encodeURIComponent(file.path)}&_sid=${sessionId}`;
                return {
                    name: file.name,
                    lowRes: `/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=medium`,
                    mediumRes: `/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=medium`,
                    highRes: `/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=medium`,
                    path: file.path,
                    shareableLink: baseUrl
                };
            });

        // Sort alphabetically
        const sortedImages = files.sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );

        const total = sortedImages.length;
        const paginated = sortedImages.slice(offset, offset + limit);

        // CORS headers
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        res.status(200).json({
            images: paginated,
            total,
            hasMore: offset + limit < total
        });
    } catch (error) {
        console.error("Error fetching NAS images:", error.message);
        res.status(500).json({ message: "Failed to fetch NAS images", error: error.message });
    }
};

// **🔹 Step 4: Proxy Image Requests (Stream Image Instead of Redirecting)**
export const serveNASImage = async (req, res) => {
    try {
      let { path, size = "medium" } = req.query;
  
      if (!path) {
        return res.status(400).json({ message: "Image path is required" });
      }
  
      if (!sessionId) await authenticateWithNAS();
  
      const encodedPath = JSON.stringify([decodeURIComponent(path)]);
  
      const imageUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Thumb&version=2&method=get&path=${encodeURIComponent(
        encodedPath
      )}&size=${size}&mode=open&_sid=${sessionId}`;
  
      const imageResponse = await axios.get(imageUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": NAS_URL,
          "Origin": NAS_URL,
        },
      });
  
      res.setHeader("Content-Type", "image/webp");
  
      // Pipe original stream → convert to .webp using sharp → pipe to client
      const transform = sharp().webp({ quality: 80 });
      imageResponse.data.pipe(transform).pipe(res);
    } catch (error) {
      console.error("Error serving NAS image as webp:", error.message);
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