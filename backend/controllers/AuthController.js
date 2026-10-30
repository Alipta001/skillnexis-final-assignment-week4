const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthController {
  static createToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }

  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        name.trim().length < 2 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        password.length < 8
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enter a valid name, email and password of at least 8 characters",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12),
        role: "user",
      });

      return res.status(201).json({
        success: true,
        message: "Account created",
        token: AuthController.createToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      }
      return res
        .status(500)
        .json({ success: false, message: "Unable to register" });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("+password");
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      return res.json({
        success: true,
        message: "Login successful",
        token: AuthController.createToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to log in" });
    }
  }

  static async me(req, res) {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  }
}

module.exports = AuthController;
