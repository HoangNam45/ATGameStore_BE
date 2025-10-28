const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verifyFirebaseToken, requireOwner } = require("../middleware/auth");

// Debug middleware to check request body
router.use((req, res, next) => {
  console.log("🔍 Route debug - Method:", req.method);
  console.log("🔍 Route debug - Content-Type:", req.headers["content-type"]);
  console.log("🔍 Route debug - Body type:", typeof req.body);
  console.log("🔍 Route debug - Body:", req.body);
  next();
});

// Force JSON parsing for text/plain content-type (fix for frontend issue)
router.use(express.json({ type: ["application/json", "text/plain"] }));

router.use((req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].includes("text/plain")
  ) {
    console.log("⚠️ Detected text/plain content-type, applying JSON parser");
  }
  next();
});

// Apply authentication middleware to all routes
router.use(verifyFirebaseToken);
router.use(requireOwner);

// GET /api/products/credentials - Get all products with credentials (Owner only)
router.get("/credentials", productController.getAllProductsWithCredentials);

// GET /api/products/credentials/:productId - Get product by ID with credentials (Owner only)
router.get(
  "/credentials/:productId",
  productController.getProductByIdWithCredentials
);

// GET /api/products/credentials/code/:productCode - Get product by code with credentials (Owner only)
router.get(
  "/credentials/code/:productCode",
  productController.getProductByCodeWithCredentials
);

// POST /api/products - Add new product (Owner only)
router.post("/", productController.addProduct);

// PUT /api/products/:productId - Update product (Owner only)
router.put("/:productId", productController.updateProduct);

// DELETE /api/products/:productId - Delete product (Owner only)
router.delete("/:productId", productController.deleteProduct);

module.exports = router;
