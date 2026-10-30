const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

class AdminController {
  static async getDashboard(req, res) {
    try {
      const [totalProducts, totalOrders, totalUsers] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
        User.countDocuments({ role: "user" }),
      ]);
      return res.json({
        success: true,
        stats: { totalProducts, totalOrders, totalUsers },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load dashboard" });
    }
  }

  static async getProducts(req, res) {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      return res.json({ success: true, products });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load products" });
    }
  }

  static async getOrders(req, res) {
    try {
      const orders = await Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load orders" });
    }
  }

  static async updateOrder(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order ID" });
      }
      const { orderStatus } = req.body;
      if (!orderStatuses.includes(orderStatus)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order status" });
      }
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus },
        { new: true, runValidators: true },
      ).populate("user", "name email");
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      return res.json({
        success: true,
        message: "Order status updated",
        order,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to update order" });
    }
  }
}

module.exports = AdminController;
