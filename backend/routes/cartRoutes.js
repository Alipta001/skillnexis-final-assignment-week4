const router = require("express").Router();
const CartController = require("../controllers/CartController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.use(AuthMiddleware.protect);
router.get("/", CartController.getCart);
router.post("/", CartController.addItem);
router.put("/:productId", CartController.updateItem);
router.delete("/:productId", CartController.removeItem);

module.exports = router;
