const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: error.message,
    endpoint: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      auth: [
        "POST /api/auth/register",
        "POST /api/auth/login",
        "POST /api/auth/logout",
        "GET /api/auth/profile",
      ],
      users: [
        "GET /api/users",
        "GET /api/users/:id",
        "PUT /api/users/:id",
        "DELETE /api/users/:id",
      ],
      products: [
        "GET /api/products",
        "POST /api/products",
        "GET /api/products/:id",
        "PUT /api/products/:id",
        "DELETE /api/products/:id",
      ],
    },
  });
};

module.exports = notFound;
