const router = require("express").Router();
const AuthController = require("../controllers/AuthController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", AuthMiddleware.protect, AuthController.me);

module.exports = router;
