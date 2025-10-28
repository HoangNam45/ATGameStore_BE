const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();
const authController = new AuthController();

// Đăng ký - Gửi OTP
router.post("/register", async (req, res) => {
  await authController.register(req, res);
});

// Xác thực OTP
router.post("/verify-otp", async (req, res) => {
  await authController.verifyOTP(req, res);
});

// Gửi lại OTP
router.post("/resend-otp", async (req, res) => {
  await authController.resendOTP(req, res);
});

// Kiểm tra trạng thái xác thực
router.get("/check-verification", async (req, res) => {
  await authController.checkVerification(req, res);
});

// Lấy thời gian countdown cho resend OTP
router.get("/resend-countdown", async (req, res) => {
  await authController.getResendCountdown(req, res);
});

// Hoàn tất đăng ký
router.post("/complete-registration", async (req, res) => {
  await authController.completeRegistration(req, res);
});

module.exports = router;
