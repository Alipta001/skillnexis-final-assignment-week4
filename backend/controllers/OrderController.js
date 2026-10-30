const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

class OrderController {
  static async createOrder(req, res) {
    const decremented = [];
    let order;
    try {
      const { customerName, address, city, postalCode, phone, paymentMethod } =
        req.body;
      if (
        typeof customerName !== "string" ||
        typeof address !== "string" ||
        typeof city !== "string" ||
        typeof postalCode !== "string" ||
        typeof phone !== "string" ||
        !customerName.trim() ||
        !address.trim() ||
        !city.trim() ||
        !postalCode.trim() ||
        !phone.trim() ||
        (paymentMethod && paymentMethod !== "Cash on Delivery")
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Enter valid shipping details" });
      }

      const cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product",
      );
      if (!cart || !cart.items.length) {
        return res
          .status(400)
          .json({ success: false, message: "Your cart is empty" });
      }

      const orderItems = [];
      for (const item of cart.items) {
        const product = item.product;
        if (!product) {
          const error = new Error();
          error.publicMessage = "A product in your cart is no longer available";
          throw error;
        }
        const updated = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
          { new: true },
        );
        if (!updated) {
          const error = new Error();
          error.publicMessage = `${product.name} does not have enough stock`;
          throw error;
        }
        decremented.push({ productId: product._id, quantity: item.quantity });
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity,
        });
      }

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress: {
          customerName: customerName.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        },
        phone: phone.trim(),
        paymentMethod: "Cash on Delivery",
        totalAmount,
      });

      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
      );
      return res
        .status(201)
        .json({ success: true, message: "Order placed", order });
    } catch (error) {
      if (order) await Order.findByIdAndDelete(order._id);
      if (decremented.length) {
        await Promise.all(
          decremented.map(({ productId, quantity }) =>
            Product.updateOne(
              { _id: productId },
              { $inc: { stock: quantity } },
            ),
          ),
        );
      }
      return res.status(400).json({
        success: false,
        message: error.publicMessage || "Unable to place order",
      });
    }
  }

  static async getMyOrders(req, res) {
    try {
      const orders = await Order.find({ user: req.user._id }).sort({
        createdAt: -1,
      });
      return res.json({ success: true, orders });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load orders" });
    }
  }

  static async getOrder(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order ID" });
      }
      const filter = { _id: req.params.id };
      if (req.user.role !== "admin") filter.user = req.user._id;
      const order = await Order.findOne(filter).populate("user", "name email");
      if (!order)
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      return res.json({ success: true, order });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load order" });
    }
  }
}

module.exports = OrderController;
