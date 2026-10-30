const cors = require("cors");
const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) =>
  res.json({ success: true, message: "E-commerce API is running" }),
);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

app.use((req, res) =>
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  }),
);

app.use((error, _req, res, _next) => {
  console.error(error.message);
  const isMalformedJson = error instanceof SyntaxError && "body" in error;
  const isMulterSizeLimit =
    error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
  const isValidationError = ["ValidationError", "CastError"].includes(
    error.name,
  );
  const status =
    error.code === 11000
      ? 409
      : isMulterSizeLimit
        ? 413
        : error.status || (isMalformedJson || isValidationError ? 400 : 500);
  return res.status(status).json({
    success: false,
    message:
      status < 500
        ? error.message || "Request failed"
        : "Internal server error",
  });
});

module.exports = app;
