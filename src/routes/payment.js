const express = require("express");
const PaymentController = require("../controllers/paymentController");

const router = express.Router();
const paymentController = new PaymentController();

// Create order
router.post("/create", (req, res) => paymentController.createOrder(req, res));

// Webhook handler for payment confirmation
router.post("/webhook", (req, res) =>
  paymentController.handleWebhook(req, res)
);

// Check order status
router.get("/status/:orderCode", (req, res) =>
  paymentController.getOrderStatus(req, res)
);

module.exports = router;
