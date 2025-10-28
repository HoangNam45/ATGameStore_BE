const { db, isClientMode } = require("../config/firebase");

class ProductController {
  // Get all products with credentials (Owner only)
  async getAllProductsWithCredentials(req, res) {
    try {
      let snapshot;

      if (isClientMode) {
        // Use Firebase Client SDK
        const { collection, getDocs } = require("firebase/firestore");
        const productsRef = collection(db, "products");
        snapshot = await getDocs(productsRef);
      } else {
        // Use Firebase Admin SDK
        const productsRef = db.collection("products");
        snapshot = await productsRef.get();
      }

      if (snapshot.empty || snapshot.docs.length === 0) {
        return res.json({
          success: true,
          data: [],
          message: "No products found",
        });
      }

      const products = [];
      snapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Retrieved ${products.length} products with credentials`);

      res.json({
        success: true,
        data: products,
        message: `Retrieved ${products.length} products`,
      });
    } catch (error) {
      console.error("❌ Error getting products with credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get products",
        error: error.message,
      });
    }
  }

  // Get product by ID with credentials (Owner only)
  async getProductByIdWithCredentials(req, res) {
    try {
      const { productId } = req.params;
      console.log(
        "📦 Getting product with credentials:",
        productId,
        "for owner:",
        req.user.uid
      );

      let productDoc;

      if (isClientMode) {
        // Use Firebase Client SDK
        const { doc, getDoc } = require("firebase/firestore");
        const productRef = doc(db, "products", productId);
        productDoc = await getDoc(productRef);

        if (!productDoc.exists()) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }
      } else {
        // Use Firebase Admin SDK
        const productRef = db.collection("products").doc(productId);
        productDoc = await productRef.get();

        if (!productDoc.exists) {
          return res.status(404).json({
            success: false,
            message: "Product not found",
          });
        }
      }

      const product = {
        id: productDoc.id,
        ...productDoc.data(),
      };

      console.log("✅ Product with credentials retrieved:", product.name);

      res.json({
        success: true,
        data: product,
        message: "Product retrieved successfully",
      });
    } catch (error) {
      console.error("❌ Error getting product with credentials:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get product",
        error: error.message,
      });
    }
  }

  // Get product by product code with credentials (Owner only)
  async getProductByCodeWithCredentials(req, res) {
    try {
      const { productCode } = req.params;
      console.log(
        "📦 Getting product by code with credentials:",
        productCode,
        "for owner:",
        req.user.uid
      );

      const productsRef = db.collection("products");
      const snapshot = await productsRef
        .where("productCode", "==", productCode)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Should only be one product with this code
      const productDoc = snapshot.docs[0];
      const product = {
        id: productDoc.id,
        ...productDoc.data(),
      };

      console.log(
        "✅ Product with credentials retrieved by code:",
        product.name
      );

      res.json({
        success: true,
        data: product,
        message: "Product retrieved successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error getting product by code with credentials:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to get product",
        error: error.message,
      });
    }
  }

  // Add new product (Owner only)
  async addProduct(req, res) {
    try {
      console.log("➕ Adding new product for owner:", req.user.uid);

      // Debug request details
      console.log("📋 Request details:");
      console.log("- Content-Type:", req.headers["content-type"]);
      console.log("- Body type:", typeof req.body);
      console.log("- Body keys:", req.body ? Object.keys(req.body) : "No keys");
      console.log("- Raw body:", req.body);

      let productData = req.body;

      // If body is undefined or not parsed, try to handle raw data
      if (!productData || typeof productData !== "object") {
        console.log("⚠️ Body not parsed as JSON, attempting manual parse...");

        // Check if we have raw string data
        if (typeof req.body === "string") {
          try {
            productData = JSON.parse(req.body);
          } catch (e) {
            console.error("Failed to parse body as JSON:", e);
          }
        }
      }

      console.log("Product data:", productData);

      // Validate required fields
      if (
        !productData ||
        !productData.name ||
        !productData.productCode ||
        !productData.price
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, productCode, price",
        });
      }

      // Check if product code already exists
      const existingProduct = await db
        .collection("products")
        .where("productCode", "==", productData.productCode)
        .get();

      if (!existingProduct.empty) {
        return res.status(400).json({
          success: false,
          message: "Product code already exists",
        });
      }

      const productRef = db.collection("products").doc();
      const now = new Date().toISOString();

      const product = {
        id: productRef.id,
        ...productData,
        createdAt: now,
        updatedAt: now,
        createdBy: req.user.uid,
      };

      await productRef.set(product);

      console.log("✅ Product added successfully:", product.name);

      res.status(201).json({
        success: true,
        data: product,
        message: "Product added successfully",
      });
    } catch (error) {
      console.error("❌ Error adding product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add product",
        error: error.message,
      });
    }
  }

  // Update product (Owner only)
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      console.log(
        "🔄 Updating product:",
        productId,
        "for owner:",
        req.user.uid
      );

      // Check if product exists
      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // If updating product code, check for duplicates
      if (updateData.productCode) {
        const existingProduct = await db
          .collection("products")
          .where("productCode", "==", updateData.productCode)
          .get();

        // Check if there's another product with the same code (excluding current one)
        const duplicateExists = existingProduct.docs.some(
          (doc) => doc.id !== productId
        );

        if (duplicateExists) {
          return res.status(400).json({
            success: false,
            message: "Product code already exists",
          });
        }
      }

      const updatedData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      await productRef.update(updatedData);

      // Get updated product
      const updatedProductDoc = await productRef.get();
      const updatedProduct = {
        id: updatedProductDoc.id,
        ...updatedProductDoc.data(),
      };

      console.log("✅ Product updated successfully:", updatedProduct.name);

      res.json({
        success: true,
        data: updatedProduct,
        message: "Product updated successfully",
      });
    } catch (error) {
      console.error("❌ Error updating product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: error.message,
      });
    }
  }

  // Delete product (Owner only)
  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;
      console.log(
        "🗑️ Deleting product:",
        productId,
        "for owner:",
        req.user.uid
      );

      // Check if product exists
      const productRef = db.collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const productData = productDoc.data();
      await productRef.delete();

      console.log("✅ Product deleted successfully:", productData.name);

      res.json({
        success: true,
        message: "Product deleted successfully",
        data: { id: productId, name: productData.name },
      });
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error: error.message,
      });
    }
  }
}

module.exports = new ProductController();
