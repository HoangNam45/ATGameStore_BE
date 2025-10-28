const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} = require("firebase/firestore");
const nodemailer = require("nodemailer");

class OTPService {
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

    // Cấu hình nodemailer
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Tạo OTP 6 số
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Gửi OTP qua email
  async sendOTPEmail(email, otp, username) {
    const mailOptions = {
      from: `"QTAT Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Mã xác thực tài khoản - QTAT Shop",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; text-align: center;">Xác thực tài khoản</h2>
          <p>Xin chào <strong>${username}</strong>,</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại QTAT Shop. Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực sau:</p>
          <div style="background-color: #fdf2f8; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px solid #fce7f3;">
            <h1 style="color: #ec4899; font-size: 32px; margin: 0; letter-spacing: 8px; text-shadow: 0 2px 4px rgba(236, 72, 153, 0.2);">${otp}</h1>
          </div>
          <p><strong>Lưu ý:</strong> Mã xác thực này sẽ hết hạn sau 10 phút.</p>
          <p>Nếu bạn không yêu cầu đăng ký tài khoản, vui lòng bỏ qua email này.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Email này được gửi tự động, vui lòng không trả lời.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Lưu OTP vào Firestore
  async saveOTP(email, otp, username) {
    const otpRef = doc(this.db, "otps", email);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await setDoc(otpRef, {
      otp,
      email,
      username,
      createdAt: new Date(),
      expiresAt,
      verified: false,
      attempts: 0,
    });
  }

  // Xác thực OTP
  async verifyOTP(email, inputOTP) {
    const otpRef = doc(this.db, "otps", email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      throw new Error("OTP không tồn tại hoặc đã hết hạn");
    }

    const otpData = otpDoc.data();

    // Kiểm tra hết hạn
    if (new Date() > otpData.expiresAt.toDate()) {
      await deleteDoc(otpRef);
      throw new Error("OTP đã hết hạn");
    }

    // Kiểm tra số lần thử
    if (otpData.attempts >= 3) {
      await deleteDoc(otpRef);
      throw new Error("Đã vượt quá số lần thử cho phép");
    }

    // Kiểm tra OTP
    if (otpData.otp !== inputOTP) {
      await updateDoc(otpRef, {
        attempts: otpData.attempts + 1,
      });
      throw new Error("OTP không đúng");
    }

    // OTP đúng - đánh dấu đã xác thực
    await updateDoc(otpRef, {
      verified: true,
      verifiedAt: new Date(),
    });

    return { success: true, email, username: otpData.username };
  }

  // Kiểm tra email có tồn tại trong users collection không
  async checkEmailInUsers(email) {
    try {
      const usersRef = collection(this.db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      console.log(
        `Checking email ${email} in users collection:`,
        querySnapshot.size > 0
      );
      return querySnapshot.size > 0; // True nếu có user với email này
    } catch (error) {
      console.error("Error checking users collection:", error);
      return false;
    }
  }

  // Kiểm tra trạng thái email (bao gồm cả users collection)
  async getEmailStatus(email) {
    // Trước tiên kiểm tra users collection
    const existsInUsers = await this.checkEmailInUsers(email);
    if (existsInUsers) {
      return { exists: true, status: "registered_in_users" };
    }

    // Nếu không có trong users collection, kiểm tra OTP collection
    const otpRef = doc(this.db, "otps", email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return { exists: false, status: "available" }; // Email chưa từng đăng ký
    }

    const otpData = otpDoc.data();

    // Đã hoàn thành đăng ký
    if (otpData.completed === true) {
      return { exists: true, status: "completed" };
    }

    // Đã verify OTP nhưng chưa hoàn thành
    if (otpData.verified === true) {
      return { exists: true, status: "verified_pending" };
    }

    // Đang trong quá trình đăng ký (có OTP chưa verify)
    if (new Date() <= otpData.expiresAt.toDate()) {
      return {
        exists: true,
        status: "pending",
        remainingTime: Math.floor(
          (otpData.expiresAt.toDate() - new Date()) / 1000
        ),
      };
    }

    // OTP đã hết hạn
    return { exists: true, status: "expired" };
  }

  // Kiểm tra trạng thái xác thực (để dùng cho đăng nhập)
  async isEmailVerified(email) {
    const status = await this.getEmailStatus(email);
    console.log(`Email ${email} verification status:`, status);
    const isVerified =
      status.exists &&
      (status.status === "completed" ||
        status.status === "verified_pending" ||
        status.status === "registered_in_users");
    console.log(`Email ${email} is verified:`, isVerified);
    return isVerified;
  }

  // Gửi lại OTP
  async resendOTP(email) {
    const otpRef = doc(this.db, "otps", email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      throw new Error("Không tìm thấy yêu cầu OTP");
    }

    const otpData = otpDoc.data();

    // Kiểm tra thời gian gửi lại (ít nhất 1 phút)
    const lastSent = otpData.createdAt.toDate
      ? otpData.createdAt.toDate()
      : new Date(otpData.createdAt);
    const now = new Date();
    const timeDiff = (now - lastSent) / 1000; // giây

    if (timeDiff < 60) {
      throw new Error(
        `Vui lòng đợi ${60 - Math.floor(timeDiff)} giây trước khi gửi lại`
      );
    }

    // Tạo OTP mới
    const newOTP = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Cập nhật OTP mới
    await updateDoc(otpRef, {
      otp: newOTP,
      createdAt: now,
      expiresAt,
      attempts: 0,
    });

    // Gửi email
    await this.sendOTPEmail(email, newOTP, otpData.username);
  }

  // Đánh dấu hoàn tất đăng ký (không xóa, để có thể kiểm tra lại)
  async completeRegistration(email) {
    const otpRef = doc(this.db, "otps", email);
    await updateDoc(otpRef, {
      completed: true,
      completedAt: new Date(),
    });
  }

  // Xóa OTP sau khi đăng ký thành công (dành cho cleanup sau này)
  async cleanupOTP(email) {
    const otpRef = doc(this.db, "otps", email);
    await deleteDoc(otpRef);
  }

  // Lấy thời gian countdown cho resend OTP
  async getResendCountdown(email) {
    const otpRef = doc(this.db, "otps", email);
    const otpDoc = await getDoc(otpRef);

    if (!otpDoc.exists()) {
      return 0; // Không có OTP, có thể gửi ngay
    }

    const otpData = otpDoc.data();
    const lastSent = otpData.createdAt.toDate
      ? otpData.createdAt.toDate()
      : new Date(otpData.createdAt);
    const now = new Date();
    const timeDiff = (now - lastSent) / 1000; // giây

    const remainingTime = 60 - Math.floor(timeDiff);
    return remainingTime > 0 ? remainingTime : 0;
  }
}

module.exports = OTPService;
