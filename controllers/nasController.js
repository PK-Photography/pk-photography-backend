import axios from "axios";

// Synology NAS API Details
const NAS_URL = "https://pkphotography.sg4.quickconnect.to";
const API_USER = "toshita";
const API_PASS = "4?voAWnZ";
let sessionId; // Store session ID globally to avoid multiple logins

// **🔹 Step 1: Authenticate with Synology NAS**
const authenticateWithNAS = async () => {
    try {
        console.log("🔹 Step 1: Authenticating with Synology NAS...");

        const authUrl = `${NAS_URL}/webapi/auth.cgi?api=SYNO.API.Auth&version=6&method=login&account=${API_USER}&passwd=${encodeURIComponent(API_PASS)}&session=FileStation&format=sid`;

        console.log("🔹 Authentication URL:", authUrl);

        const authResponse = await axios.get(authUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        console.log("🔹 Authentication Response:", JSON.stringify(authResponse.data, null, 2));

        if (!authResponse.data.success) {
            throw new Error("❌ Authentication failed! Check credentials or API permissions.");
        }

        sessionId = authResponse.data.data.sid;
        console.log("✅ Authentication successful! Session ID:", sessionId);
    } catch (error) {
        console.error("❌ Error during NAS authentication:", error.message);
        throw new Error("Failed to authenticate with NAS");
    }
};

// **🔹 Step 2: Fetch Images from NAS Folder**
export const fetchImagesFromNAS = async (req, res) => {
    try {
        if (!sessionId) await authenticateWithNAS(); // Ensure authentication

        console.log("🔹 Step 2: Fetching images from NAS...");

        const folderPath = req.query.nasUrl || "/photo"; // Default folder
        const listUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(folderPath)}&session=FileStation&_sid=${sessionId}`;

        console.log("🔹 NAS List API URL:", listUrl);

        const listResponse = await axios.get(listUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        console.log("🔹 NAS List Response:", JSON.stringify(listResponse.data, null, 2));

        if (!listResponse.data.success) {
            throw new Error("❌ Failed to list images from NAS!");
        }

        // **🔹 Step 3: Process images for different resolutions**
        const images = listResponse.data.data.files
            .filter(file => file.name.match(/\.(jpg|jpeg|png)$/i)) // Only image files
            .map(file => {
                const baseUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(file.path)}&_sid=${sessionId}`;
                
                return {
                    name: file.name,
                    lowRes: `/api/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=low`,  // Small thumbnail
                    mediumRes: `/api/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=medium`, // Medium resolution
                    highRes: `/api/nas-image-proxy?path=${encodeURIComponent(file.path)}&size=high`, // Full resolution
                    path: file.path,
                    shareableLink: baseUrl // Direct link to download
                };
            });

        console.log(`✅ Found ${images.length} images! Sending response...`);

        // ✅ Add CORS Headers to Allow Frontend Requests
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");

        res.status(200).json({ images });
    } catch (error) {
        console.error("❌ Error fetching NAS images:", error.message);
        res.status(500).json({ message: "Failed to fetch NAS images", error: error.message });
    }
};



// export const fetchImagesFromNAS = async (req, res) => {
//     try {
//         console.log("🔹 Step 1: Checking NAS authentication...");
//         if (!sessionId) {
//             console.log("🔹 No active session. Authenticating with NAS...");
//             await authenticateWithNAS();
//         } else {
//             console.log("✅ Already authenticated with NAS. Session ID:", sessionId);
//         }

//         console.log("🔹 Step 2: Fetching images from NAS...");

//         const folderPath = req.query.nasUrl || "/photo"; 
//         console.log(`🔹 Target Folder Path: ${folderPath}`);

//         const listUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.List&version=2&method=list&folder_path=${encodeURIComponent(folderPath)}&session=FileStation&_sid=${sessionId}`;
//         console.log(`🔹 NAS List API URL: ${listUrl}`);

//         const listResponse = await axios.get(listUrl, {
//             headers: {
//                 "User-Agent": "Mozilla/5.0",
//                 "Referer": NAS_URL,
//                 "Origin": NAS_URL
//             }
//         });

//         console.log("🔹 Step 3: Processing NAS API Response...");
//         console.log("🔹 Full Response from NAS API:", JSON.stringify(listResponse.data, null, 2));

//         if (!listResponse.data.success) {
//             console.error("❌ NAS API Response indicates failure!");
//             throw new Error("❌ Failed to list images from NAS!");
//         }

//         if (!listResponse.data.data || !listResponse.data.data.files) {
//             console.error("❌ No files found in NAS response!");
//             throw new Error("❌ No images found in NAS directory!");
//         }

//         console.log(`✅ NAS API returned ${listResponse.data.data.files.length} files.`);

//         const images = listResponse.data.data.files
//             .filter(file => {
//                 const isImage = file.name.match(/\.(jpg|jpeg|png|JPG)$/i);
//                 console.log(`🔍 Checking file: ${file.name} - ${isImage ? "✅ Image detected" : "❌ Not an image"}`);
//                 return isImage;
//             })
//             .map(file => {
//                 const thumbnailUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Thumb&version=2&method=get&path=${encodeURIComponent(file.path)}&_sid=${sessionId}`;
                
//                 console.log(`📸 Processed Image: ${file.name}`);
//                 console.log(`   🔹 LowRes Thumbnail: ${thumbnailUrl}`);
//                 console.log(`   🔹 HighRes Download Path: /api/nas-download?path=${encodeURIComponent(file.path)}`);

//                 return {
//                     id: file.name,
//                     lowRes: thumbnailUrl, // ✅ Display a lightweight thumbnail
//                     highRes: `/api/nas-download?path=${encodeURIComponent(file.path)}`, // ✅ High-Resolution download
//                     path: file.path,
//                 };
//             });

//         console.log(`✅ Successfully processed ${images.length} images.`);
//         console.log("🔹 Sending JSON response to client...");

//         res.status(200).json({ images });
//     } catch (error) {
//         console.error("❌ Error fetching NAS images:", error.message);
//         res.status(500).json({ message: "Failed to fetch NAS images", error: error.message });
//     }
// };

// **🔹 Step 4: Proxy Image Requests (Stream Image Instead of Redirecting)**
export const serveNASImage = async (req, res) => {
    try {
        let { path } = req.query; 

        if (!path) {
            return res.status(400).json({ message: "Image path is required" });
        }

        console.log("🔹 Fetching image from NAS:", path);

        if (!sessionId) await authenticateWithNAS();

        // Correctly encode path as JSON array for NAS API
        const encodedPath = JSON.stringify([decodeURIComponent(path)]);  

        const imageUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(encodedPath)}&mode=open&_sid=${sessionId}`;

        console.log("✅ Fetching Image from:", imageUrl);

        const imageResponse = await axios.get(imageUrl, {
            responseType: "stream", 
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        res.setHeader("Content-Type", "image/jpeg"); 
        imageResponse.data.pipe(res);
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

        // ✅ Encode path correctly for NAS API
        const encodedPath = JSON.stringify([decodeURIComponent(path)]);
        const downloadUrl = `${NAS_URL}/webapi/entry.cgi?api=SYNO.FileStation.Download&version=2&method=download&path=${encodeURIComponent(encodedPath)}&_sid=${sessionId}`;

        console.log("✅ Fetching from:", downloadUrl);

        const response = await axios.get(downloadUrl, {
            responseType: "stream",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": NAS_URL,
                "Origin": NAS_URL
            }
        });

        // ✅ Set filename dynamically
        const fileName = path.match(/\.(jpg|jpeg|png|mp3|mp4|pdf)$/i) ? path.split("/").pop() : "NAS_Download.zip";
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Type", path.match(/\.(jpg|jpeg|png|gif)$/i) ? "image/jpeg" : "application/zip");

        response.data.pipe(res);
    } catch (error) {
        console.error("❌ Error downloading NAS file:", error.message);
        res.status(500).json({ message: "Failed to download NAS file", error: error.message });
    }
};