import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed =
    /^(image\/|video\/|application\/pdf|application\/msword|application\/vnd\.|text\/plain)/;
  if (allowed.test(file.mimetype) || file.mimetype === "application/octet-stream") {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type."));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export { uploadDir };
