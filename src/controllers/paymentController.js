const PaymentService = require("../services/paymentService");
const ProductService = require("../services/productService");
const CryptoService = require("../services/cryptoService");
const EmailService = require("../services/emailService");

class PaymentController {
  constructor() {
    this.paymentService = new PaymentService();
    this.productService = new ProductService();
    this.cryptoService = new CryptoService();
    this.emailService = new EmailService();
  }

  // Create order
  async createOrder(req, res) {
    try {
      const { productCode, email, amount } = req.body;

      // Get product info WITHOUT credentials for order creation
      const product = await this.productService.getProduct(productCode);

      const result = await this.paymentService.processOrderCreation({
        productCode,
        email,
        amount,
        product,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("❌ Error creating order:", error);
      const statusCode = this.getErrorStatusCode(error.message);
      return res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Webhook handler for payment confirmation
  async handleWebhook(req, res) {
    try {
      console.log("Received webhook:", req.body);

      const { code, id, gateway } = req.body;

      const webhookResult = await this.paymentService.processWebhook({
        code,
        id,
        gateway,
      });

      if (webhookResult.message === "Order already processed") {
        console.log("Order already processed:", code);
        return res.json({ success: true, message: webhookResult.message });
      }

      // Get product with credentials and send email
      await this.processOrderFulfillment(
        webhookResult.orderData,
        webhookResult.productCode
      );

      return res.json({ success: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      const statusCode = error.message === "Order not found" ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Process order fulfillment (send email with credentials)
  async processOrderFulfillment(orderData, productCode) {
    try {
      const product =
        await this.productService.getProductWithCredentials(productCode);

      console.log("productResponse:", product);
      this.productService.logProductInfo(product);

      const gameCredentials =
        this.productService.getProductCredentials(product);

      // Decrypt game credentials
      const gameAccount =
        this.cryptoService.decryptGameAccount(gameCredentials);

      console.log("Decrypted game account successfully");

      // Send email with game account info
      await this.emailService.sendGameAccountEmail(
        orderData.email,
        orderData.orderCode,
        orderData.productName,
        gameAccount
      );

      // Update product status to out of stock after successful payment
      console.log("🔄 Marking product as sold out...");
      await this.productService.updateProductStatus(
        productCode,
        "out_of_stock"
      );
      console.log("✅ Product marked as sold out successfully");
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      throw emailError;
    }
  }

  // Check order status
  async getOrderStatus(req, res) {
    try {
      const { orderCode } = req.params;
      console.log("🔍 Checking status for order:", orderCode);

      const orderData = await this.paymentService.getOrderStatus(orderCode);

      console.log("✅ Order status:", orderData.status);

      return res.json({
        success: true,
        data: orderData,
      });
    } catch (error) {
      console.error("❌ Error checking order status:", error);
      const statusCode = error.message === "Order not found" ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Helper method to determine status code based on error message
  getErrorStatusCode(errorMessage) {
    if (
      errorMessage.includes("Missing required fields") ||
      errorMessage.includes("Invalid email format") ||
      errorMessage.includes("not available for purchase")
    ) {
      return 400;
    }
    if (errorMessage.includes("Product not found")) {
      return 404;
    }
    return 500;
  }
}

module.exports = PaymentController;
