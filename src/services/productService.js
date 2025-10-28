const { db, isClientMode } = require("../config/firebase");
const { doc, getDoc } = require("firebase/firestore");

class ProductService {
  constructor() {
    this.db = db;
    this.isAdmin = !isClientMode;
    console.log(
      `✅ ProductService using ${this.isAdmin ? "Firebase Admin SDK" : "Firebase Client SDK"}`
    );
  }

  // Get product info only (without credentials) - for order creation
  async getProduct(productCode) {
    if (!this.db) {
      throw new Error("Firebase not initialized");
    }

    console.log("🔍 Fetching product info:", productCode);

    try {
      let productData;

      if (this.isAdmin) {
        // Using Admin SDK - Query by productCode field
        const productsRef = this.db.collection("products");
        const querySnapshot = await productsRef
          .where("productCode", "==", productCode)
          .get();

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        productData = { id: productDoc.id, ...productDoc.data() };
      } else {
        // Using Client SDK - Query by productCode field
        const {
          collection,
          query,
          where,
          getDocs,
        } = require("firebase/firestore");
        const productsRef = collection(this.db, "products");
        const q = query(productsRef, where("productCode", "==", productCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        productData = { id: productDoc.id, ...productDoc.data() };
      }

      // Remove gameAccount to avoid exposing credentials
      const { gameAccount, ...productWithoutCredentials } = productData;

      console.log("✅ Product found:", productWithoutCredentials.name);

      return productWithoutCredentials;
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      throw error;
    }
  }

  // Get product from Firebase directly with credentials - ONLY for completed payments
  async getProductWithCredentials(productCode) {
    if (!this.db) {
      throw new Error("Firebase not initialized");
    }

    console.log("🔍 Fetching product with credentials:", productCode);

    try {
      let productData;

      if (this.isAdmin) {
        // Using Admin SDK - Query by productCode field
        const productsRef = this.db.collection("products");
        const querySnapshot = await productsRef
          .where("productCode", "==", productCode)
          .get();

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        productData = { id: productDoc.id, ...productDoc.data() };
      } else {
        // Using Client SDK - Query by productCode field
        const {
          collection,
          query,
          where,
          getDocs,
        } = require("firebase/firestore");
        const productsRef = collection(this.db, "products");
        const q = query(productsRef, where("productCode", "==", productCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        productData = { id: productDoc.id, ...productDoc.data() };
      }

      console.log("✅ Product found:", productData.name);
      console.log("🔑 Has credentials:", !!productData.gameAccount);

      return productData;
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      throw error;
    }
  }

  // Check if product is available for purchase
  isProductAvailable(product) {
    return product.type === "available" && product.status === "in_stock";
  }

  // Get product credentials
  getProductCredentials(product) {
    if (!product.gameAccount) {
      console.error("❌ Product has no game credentials");
      return null;
    }

    return product.gameAccount;
  }

  // Log product information for debugging
  logProductInfo(product) {
    console.log("📦 Product data:", {
      name: product.name,
      hasCredentials: !!product.gameAccount,
      credentialsType: typeof product.gameAccount,
    });
  }

  // Update product status - for marking as sold out
  async updateProductStatus(productCode, status) {
    if (!this.db) {
      throw new Error("Firebase not initialized");
    }

    console.log(`🔄 Updating product ${productCode} status to:`, status);

    try {
      if (this.isAdmin) {
        // Using Admin SDK - Query by productCode field first
        const productsRef = this.db.collection("products");
        const querySnapshot = await productsRef
          .where("productCode", "==", productCode)
          .get();

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        await productDoc.ref.update({
          status: status,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Using Client SDK
        const {
          collection,
          query,
          where,
          getDocs,
          updateDoc,
        } = require("firebase/firestore");
        const productsRef = collection(this.db, "products");
        const q = query(productsRef, where("productCode", "==", productCode));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`Product ${productCode} not found`);
        }

        const productDoc = querySnapshot.docs[0];
        await updateDoc(productDoc.ref, {
          status: status,
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`✅ Product ${productCode} status updated to:`, status);
    } catch (error) {
      console.error(`❌ Error updating product status:`, error);
      throw error;
    }
  }
}

module.exports = ProductService;
