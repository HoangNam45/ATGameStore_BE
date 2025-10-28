const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // File Upload Configuration
  upload: {
    maxFileSize: process.env.MAX_FILE_SIZE || "5MB",
    uploadPath: process.env.UPLOAD_PATH || "uploads/",
  },

  // Security Configuration
  security: {
    apiRateLimit: parseInt(process.env.API_RATE_LIMIT) || 100,
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

module.exports = config;
