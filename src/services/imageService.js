const path = require("path");
const fs = require("fs");

class ImageService {
  constructor() {
    this.uploadsPath = path.join(__dirname, "../../uploads");
  }

  // Ensure uploads directory exists
  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsPath)) {
      fs.mkdirSync(this.uploadsPath, { recursive: true });
    }
  }

  // Generate file URL
  generateFileUrl(protocol, host, filename) {
    return `${protocol}://${host}/uploads/${filename}`;
  }

  // Get image files from uploads directory
  getImageFiles() {
    if (!fs.existsSync(this.uploadsPath)) {
      return [];
    }

    const files = fs.readdirSync(this.uploadsPath);
    return files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
    });
  }

  // Get file stats
  getFileStats(filename) {
    const filePath = path.join(this.uploadsPath, filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.statSync(filePath);
  }

  // Check if file exists
  fileExists(filename) {
    const filePath = path.join(this.uploadsPath, filename);
    return fs.existsSync(filePath);
  }

  // Delete file
  deleteFile(filename) {
    const filePath = path.join(this.uploadsPath, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("Image not found");
    }
    fs.unlinkSync(filePath);
  }

  // Process single upload response
  processSingleUpload(file, protocol, host) {
    if (!file) {
      throw new Error("No image file provided");
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: this.generateFileUrl(protocol, host, file.filename),
    };
  }

  // Process multiple upload response
  processMultipleUpload(files, protocol, host) {
    if (!files || files.length === 0) {
      throw new Error("No image files provided");
    }

    return files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: this.generateFileUrl(protocol, host, file.filename),
    }));
  }

  // Get image list with metadata
  getImageList(protocol, host) {
    const imageFiles = this.getImageFiles();

    return imageFiles.map((filename) => {
      const stats = this.getFileStats(filename);
      return {
        filename,
        size: stats.size,
        uploadDate: stats.ctime,
        url: this.generateFileUrl(protocol, host, filename),
      };
    });
  }

  // Get image info
  getImageInfo(filename, protocol, host) {
    const stats = this.getFileStats(filename);
    if (!stats) {
      throw new Error("Image not found");
    }

    return {
      filename,
      size: stats.size,
      uploadDate: stats.ctime,
      url: this.generateFileUrl(protocol, host, filename),
    };
  }
}

module.exports = ImageService;
