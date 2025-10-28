const express = require("express");
const ImageController = require("../controllers/imageController");
const UploadService = require("../services/uploadService");

const router = express.Router();
const imageController = new ImageController();
const uploadService = new UploadService();

// Upload single image
router.post("/upload", uploadService.getSingleUploadMiddleware(), (req, res) =>
  imageController.uploadSingle(req, res)
);

// Upload multiple images
router.post(
  "/upload-multiple",
  uploadService.getMultipleUploadMiddleware(),
  (req, res) => imageController.uploadMultiple(req, res)
);

// Get list of uploaded images
router.get("/", (req, res) => imageController.getImageList(req, res));

// Delete image
router.delete("/:filename", (req, res) =>
  imageController.deleteImage(req, res)
);

// Get image info
router.get("/:filename", (req, res) => imageController.getImageInfo(req, res));

module.exports = router;
