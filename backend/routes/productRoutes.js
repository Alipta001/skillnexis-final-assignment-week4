const router = require("express").Router();
const ProductController = require("../controllers/ProductController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProduct);
router.post(
  "/",
  AuthMiddleware.protect,
  AuthMiddleware.requireAdmin,
  ProductController.createProduct,
);
router.put(
  "/:id",
  AuthMiddleware.protect,
  AuthMiddleware.requireAdmin,
  ProductController.updateProduct,
);
router.delete(
  "/:id",
  AuthMiddleware.protect,
  AuthMiddleware.requireAdmin,
  ProductController.deleteProduct,
);

module.exports = router;
