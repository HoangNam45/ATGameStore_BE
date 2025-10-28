const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

class UploadService {
  constructor() {
    this.setupMulter();
  }

  // Configure multer for file upload
  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../../uploads");
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = crypto.randomBytes(16).toString("hex");
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueName}${extension}`);
      },
    });

    // File filter for images only
    const fileFilter = (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(
          new Error(
            "Only image files (jpeg, jpg, png, gif, webp) are allowed!"
          ),
          false
        );
      }
    };

    // Configure multer
    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: fileFilter,
    });
  }

  // Get upload middleware for single file
  getSingleUploadMiddleware() {
    return this.upload.single("image");
  }

  // Get upload middleware for multiple files
  getMultipleUploadMiddleware() {
    return this.upload.array("images", 10);
  }
}

module.exports = UploadService;
