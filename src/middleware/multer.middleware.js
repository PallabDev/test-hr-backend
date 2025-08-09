import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Always point to /public/temp in project root
        const uploadPath = path.join(__dirname, "..", "..", "public", "temp");

        // Create folder if missing
        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const uniqueName = `${name}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    },
});

export const upload = multer({ storage });
