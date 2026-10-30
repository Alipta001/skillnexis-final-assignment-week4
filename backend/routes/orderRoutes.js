const router = require("express").Router();
const OrderController = require("../controllers/OrderController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.use(AuthMiddleware.protect);
router.post("/", OrderController.createOrder);
router.get("/my-orders", OrderController.getMyOrders);
router.get("/:id", OrderController.getOrder);

module.exports = router;
