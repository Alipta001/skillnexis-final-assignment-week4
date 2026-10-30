const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = allowedTypes.get(file.mimetype);
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error("Upload a JPEG, PNG or WEBP image");
      error.status = 400;
      return callback(error);
    }
    return callback(null, true);
  },
}).single("image");
