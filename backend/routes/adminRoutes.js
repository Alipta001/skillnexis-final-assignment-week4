const router = require("express").Router();
const AdminController = require("../controllers/AdminController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.use(AuthMiddleware.protect, AuthMiddleware.requireAdmin);
router.get("/dashboard", AdminController.getDashboard);
router.get("/orders", AdminController.getOrders);
router.put("/orders/:id", AdminController.updateOrder);
router.get("/products", AdminController.getProducts);

module.exports = router;
