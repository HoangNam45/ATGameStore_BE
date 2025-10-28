const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Import routes
const imageRoutes = require("./routes/images");
const paymentRoutes = require("./routes/payment");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/images", imageRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to ShopAcc Backend Server",
    version: "1.0.0",

    endpoints: {
      images: {
        upload: "POST /api/images/upload",
        delete: "DELETE /api/images/:filename",
        list: "GET /api/images",
      },
      payment: {
        create: "POST /api/payment/create",
        status: "GET /api/payment/status/:orderId",
        confirm: "POST /api/payment/confirm/:transactionId",
        testConfirm: "POST /api/payment/test-confirm/:transactionId",
        all: "GET /api/payment/all",
        monitor: "GET /api/payment/monitor",
      },
      auth: {
        register: "POST /api/auth/register",
        verifyOTP: "POST /api/auth/verify-otp",
        resendOTP: "POST /api/auth/resend-otp",
        checkVerification: "GET /api/auth/check-verification",
        completeRegistration: "POST /api/auth/complete-registration",
      },
    },
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
