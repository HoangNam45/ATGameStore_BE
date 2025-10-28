const ImageService = require("../services/imageService");

class ImageController {
  constructor() {
    this.imageService = new ImageService();
  }

  // Upload single image
  uploadSingle(req, res) {
    try {
      const result = this.imageService.processSingleUpload(
        req.file,
        req.protocol,
        req.get("host")
      );

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  }

  // Upload multiple images
  uploadMultiple(req, res) {
    try {
      const result = this.imageService.processMultipleUpload(
        req.files,
        req.protocol,
        req.get("host")
      );

      res.status(200).json({
        success: true,
        message: `${result.length} images uploaded successfully`,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
  }

  // Get list of uploaded images
  getImageList(req, res) {
    try {
      const result = this.imageService.getImageList(
        req.protocol,
        req.get("host")
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving image list",
        error: error.message,
      });
    }
  }

  // Delete image
  deleteImage(req, res) {
    try {
      const filename = req.params.filename;
      this.imageService.deleteFile(filename);

      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
        data: { filename },
      });
    } catch (error) {
      const statusCode = error.message === "Image not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get image info
  getImageInfo(req, res) {
    try {
      const filename = req.params.filename;
      const result = this.imageService.getImageInfo(
        filename,
        req.protocol,
        req.get("host")
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const statusCode = error.message === "Image not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ImageController;
