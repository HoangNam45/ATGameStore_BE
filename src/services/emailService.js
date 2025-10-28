const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendGameAccountEmail(email, orderCode, productName, gameAccount) {
    const mailOptions = {
      from: `"QTAT Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🌸 Thông tin tài khoản game - Đơn hàng ${orderCode} | QTAT Shop`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fdf2f8 0%, #f9fafb 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(236, 72, 153, 0.1);">
          <!-- Header với sakura theme -->
          <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 30px 20px; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; font-size: 60px; opacity: 0.2; transform: rotate(15deg);">🌸</div>
            <div style="position: absolute; bottom: -10px; left: -10px; font-size: 40px; opacity: 0.3; transform: rotate(-15deg);">🌸</div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
              Thanh toán thành công!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Cảm ơn bạn đã tin tưởng QTAT Shop
            </p>
          </div>

          <!-- Content area -->
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #ec4899; margin: 0 0 10px 0; font-size: 24px;">Xin chào! </h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0;">
                Đơn hàng <strong style="color: #ec4899;">${orderCode}</strong> của bạn đã được xử lý thành công.<br>
                Dưới đây là thông tin chi tiết của bạn.
              </p>
            </div>
            
            <!-- Thông tin sản phẩm -->
            <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; border: 2px solid #fce7f3; box-shadow: 0 4px 6px rgba(236, 72, 153, 0.05);">
              <div style="display: flex; align-items: center; margin-bottom: 15px;">

                <h3 style="color: #1f2937; margin: 0; font-size: 18px;">Thông tin đơn hàng</h3>
              </div>
              <div style="border-left: 3px solid #ec4899; padding-left: 15px;">
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>Sản phẩm:</strong> <span style="color: #ec4899;">${productName}</span></p>
                <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>Mã đơn hàng:</strong> <span style="color: #ec4899; font-family: 'Courier New', monospace;">${orderCode}</span></p>
              </div>
            </div>

            <!-- Thông tin tài khoản game -->
            <div style="background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); padding: 25px; border-radius: 12px; border: 2px solid #fbbf24; position: relative; overflow: hidden;">
              <div style="position: absolute; top: 10px; right: 15px; font-size: 30px; opacity: 0.3;">🎮</div>
              <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #92400e; margin: 0; font-size: 18px;">Thông tin tài khoản game</h3>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 15px;">
                <div style="display: grid; gap: 12px;">
                  <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Tài khoản</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: bold; font-family: 'Courier New', monospace;">${gameAccount.username}</p>
                  </div>
                  <div style="background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Mật khẩu</p>
                    <p style="margin: 5px 0 0 0; color: #111827; font-size: 16px; font-weight: bold; font-family: 'Courier New', monospace;">${gameAccount.password}</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: bold;">
                  ⚠️ <strong>Lưu ý bảo mật:</strong>
                </p>
                <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;">
                  Vui lòng đổi mật khẩu ngay sau khi đăng nhập để đảm bảo an toàn tài khoản của bạn.
                </p>
              </div>
            </div>

            <!-- Footer sakura -->
            <div style="margin-top: 30px; padding: 25px; background: linear-gradient(135deg, #fdf2f8 0%, #f1f5f9 100%); border-radius: 12px; text-align: center; border: 1px solid #e2e8f0;">
              <div style="margin-bottom: 15px;">
                <span style="font-size: 24px; margin: 0 5px;">🌸</span>
                <span style="font-size: 20px; margin: 0 3px;">✨</span>
                <span style="font-size: 24px; margin: 0 5px;">🌸</span>
              </div>
              <h3 style="color: #ec4899; margin: 0 0 10px 0; font-size: 18px;">Cảm ơn bạn đã chọn QTAT Shop!</h3>
              <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                Nếu bạn có bất kỳ thắc mắc nào về sản phẩm hoặc dịch vụ,<br>
                đừng ngần ngại liên hệ với chúng tôi.<br>
                <strong style="color: #ec4899;">Chúc bạn chơi game vui vẻ! </strong>
              </p>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  Email này được gửi tự động từ QTAT Shop • Vui lòng không trả lời email này
                </p>
              </div>
            </div>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async testEmailConnection() {
    try {
      await this.transporter.verify();
      console.log("Email server connection verified");
      return true;
    } catch (error) {
      console.error("Email server connection failed:", error);
      return false;
    }
  }
}

module.exports = EmailService;
