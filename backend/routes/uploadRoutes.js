const router = require("express").Router();
const UploadController = require("../controllers/UploadController");
const AuthMiddleware = require("../middleware/authMiddleware");
const uploadImage = require("../middleware/uploadMiddleware");

router.post(
  "/image",
  AuthMiddleware.protect,
  AuthMiddleware.requireAdmin,
  (req, res, next) =>
    uploadImage(req, res, (error) => (error ? next(error) : next())),
  UploadController.uploadImage,
);

module.exports = router;
