const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthMiddleware {
  static async protect(req, res, next) {
    let payload;
    try {
      const [scheme, token] = (req.headers.authorization || "").split(" ");
      if (scheme !== "Bearer" || !token) {
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });
      }

      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    try {
      const user = await User.findById(payload.userId).select(
        "_id name email role",
      );
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User no longer exists" });
      }

      req.user = user;
      return next();
    } catch (error) {
      return next(error);
    }
  }

  static requireAdmin(req, res, next) {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Administrator access required" });
    }
    return next();
  }
}

module.exports = AuthMiddleware;
