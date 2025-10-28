const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
} = require("firebase/firestore");

class PaymentService {
  constructor() {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    };
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  randomOrderCode() {
    return "ORD" + Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  async generateUniqueOrderCode() {
    let code;
    let exists = true;
    while (exists) {
      code = this.randomOrderCode();
      const q = query(
        collection(this.db, "orders"),
        where("orderCode", "==", code)
      );
      const snap = await getDocs(q);
      exists = !snap.empty;
    }
    return code;
  }

  validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async createOrder(orderData) {
    const orderRef = doc(collection(this.db, "orders"));
    await setDoc(orderRef, { ...orderData, id: orderRef.id });
    return orderRef.id;
  }

  generateSepayQRUrl(amount, orderCode) {
    return `${process.env.SEPAY_QR_API_URL}?acc=${process.env.SEPAY_VIRTUAL_ACCOUNT}&bank=${process.env.SEPAY_BANK_CODE}&amount=${amount}&des=${encodeURIComponent(orderCode)}&template=compact`;
  }

  async findOrderByCode(orderCode) {
    const q = query(
      collection(this.db, "orders"),
      where("orderCode", "==", orderCode)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { doc: snap.docs[0], data: snap.docs[0].data() };
  }

  async updateOrderStatus(orderId, updateData) {
    await updateDoc(doc(this.db, "orders", orderId), updateData);
  }

  // Process order creation
  async processOrderCreation({ productCode, email, amount, product }) {
    console.log("📥 Processing order creation:", {
      productCode,
      email,
      amount,
    });

    // Validate required fields
    if (!productCode || !email || !amount) {
      throw new Error("Missing required fields: productCode, email, amount");
    }

    // Validate email format
    if (!this.validateEmailFormat(email)) {
      throw new Error("Invalid email format");
    }

    // Check if product is available
    if (product.type !== "available" || product.status !== "in_stock") {
      throw new Error("Product is not available for purchase");
    }

    // Generate unique order code
    const orderCode = await this.generateUniqueOrderCode();
    console.log("🔢 Generated order code:", orderCode);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    // Create order data
    const orderData = {
      orderCode,
      productCode,
      productId: product.id,
      productName: product.name,
      email,
      amount: parseInt(amount),
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      paymentMethod: "bank_transfer",
    };

    // Save order to Firebase
    await this.createOrder(orderData);
    console.log("💾 Order saved to Firebase:", orderCode);

    // Generate QR code
    const qrCode = this.generateSepayQRUrl(amount, orderCode);

    return {
      orderCode,
      amount,
      expiresAt: expiresAt.toISOString(),
      qrCode,
      bankInfo: {
        bankName: "BIDV",
        accountName: "Tài khoản ảo Sepay",
        accountNo: process.env.SEPAY_VIRTUAL_ACCOUNT,
        amount: amount,
        content: orderCode,
      },
    };
  }

  // Process webhook
  async processWebhook({ code, id, gateway }) {
    console.log("📥 Processing webhook:", { code, id, gateway });

    // Find order
    const orderResult = await this.findOrderByCode(code);
    if (!orderResult) {
      throw new Error("Order not found");
    }

    const { doc: orderDoc, data: orderData } = orderResult;

    // Check if order is already processed
    if (orderData.status === "completed") {
      return { message: "Order already processed", orderData };
    }

    // Update order status
    await this.updateOrderStatus(orderDoc.id, {
      status: "completed",
      paidAt: new Date().toISOString(),
      transactionId: id || null,
      gateway: gateway || "manual",
    });

    return { orderData, productCode: orderData.productCode };
  }

  // Get order status
  async getOrderStatus(orderCode) {
    const orderResult = await this.findOrderByCode(orderCode);
    if (!orderResult) {
      throw new Error("Order not found");
    }
    return orderResult.data;
  }
}

module.exports = PaymentService;
