const OTPService = require("../services/otpService");

class AuthController {
  constructor() {
    this.otpService = new OTPService();
  }

  // Đăng ký - Gửi OTP
  async register(req, res) {
    try {
      const { email, username } = req.body;

      // Validate input
      if (!email || !username) {
        return res.status(400).json({
          success: false,
          message: "Email và username không được để trống",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ",
        });
      }

      if (username.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Username phải có ít nhất 3 ký tự",
        });
      }

      // Kiểm tra trạng thái email
      const emailStatus = await this.otpService.getEmailStatus(email);
      console.log(`Register attempt for ${email}:`, emailStatus);

      if (emailStatus.exists) {
        switch (emailStatus.status) {
          case "registered_in_users":
            return res.status(400).json({
              success: false,
              message:
                "Email đã được sử dụng để đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng email khác.",
            });

          case "completed":
            return res.status(400).json({
              success: false,
              message:
                "Email đã được sử dụng để đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng email khác.",
            });

          case "verified_pending":
            return res.status(400).json({
              success: false,
              message:
                "Email này đang trong quá trình hoàn tất đăng ký. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
            });

          case "pending":
            // Đang có OTP chưa hết hạn - cho phép gửi lại
            await this.otpService.resendOTP(email);
            return res.json({
              success: true,
              message: "OTP mới đã được gửi đến email của bạn",
              data: { email, isResend: true },
            });

          case "expired":
            // OTP cũ đã hết hạn - xóa và tạo mới
            await this.otpService.cleanupOTP(email);
            break; // Tiếp tục tạo OTP mới bên dưới
        }
      }

      // Tạo và gửi OTP mới (cho trường hợp email chưa đăng ký hoặc OTP đã hết hạn)
      const otp = this.otpService.generateOTP();
      await this.otpService.saveOTP(email, otp, username);
      await this.otpService.sendOTPEmail(email, otp, username);

      res.json({
        success: true,
        message: "OTP đã được gửi đến email của bạn",
        data: { email, isResend: false },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi server",
      });
    }
  }

  // Xác thực OTP
  async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email và OTP không được để trống",
        });
      }

      // Xác thực OTP
      const result = await this.otpService.verifyOTP(email, otp);

      res.json({
        success: true,
        message: "Xác thực OTP thành công",
        data: result,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Xác thực OTP thất bại",
      });
    }
  }

  // Gửi lại OTP
  async resendOTP(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email không được để trống",
        });
      }

      await this.otpService.resendOTP(email);

      res.json({
        success: true,
        message: "OTP mới đã được gửi đến email của bạn",
      });
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gửi lại OTP thất bại",
      });
    }
  }

  // Kiểm tra trạng thái xác thực email
  async checkVerification(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email không được để trống",
        });
      }

      const isVerified = await this.otpService.isEmailVerified(email);

      res.json({
        success: true,
        data: { email, verified: isVerified },
      });
    } catch (error) {
      console.error("Check verification error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi kiểm tra trạng thái xác thực",
      });
    }
  }

  // Lấy thời gian countdown cho resend OTP
  async getResendCountdown(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email không được để trống",
        });
      }

      const countdown = await this.otpService.getResendCountdown(email);

      res.json({
        success: true,
        data: { email, countdown },
      });
    } catch (error) {
      console.error("Get resend countdown error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi lấy thời gian countdown",
      });
    }
  }

  // Hoàn tất đăng ký (sau khi verify OTP)
  async completeRegistration(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email không được để trống",
        });
      }

      // Kiểm tra đã verify OTP chưa
      const isVerified = await this.otpService.isEmailVerified(email);
      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: "Email chưa được xác thực",
        });
      }

      // Đánh dấu hoàn tất đăng ký (không xóa OTP ngay)
      await this.otpService.completeRegistration(email);

      res.json({
        success: true,
        message: "Đăng ký hoàn tất thành công",
        data: { email },
      });
    } catch (error) {
      console.error("Complete registration error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Lỗi hoàn tất đăng ký",
      });
    }
  }
}

module.exports = AuthController;
