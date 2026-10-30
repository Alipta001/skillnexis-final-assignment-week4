const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

class CartController {
  static async getCart(req, res) {
    try {
      let cart = await Cart.findOne({ user: req.user._id }).populate(
        "items.product",
      );
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      } else {
        const validItems = cart.items.filter((item) => item.product);
        if (validItems.length !== cart.items.length) {
          cart.items = validItems;
          await cart.save();
        }
      }
      return res.json({ success: true, cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load cart" });
    }
  }

  static async addItem(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      if (
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Choose a valid product and quantity",
        });
      }
      const product = await Product.findById(productId);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = new Cart({ user: req.user._id, items: [] });
      const item = cart.items.find(
        (entry) => entry.product.toString() === productId,
      );
      const nextQuantity = (item?.quantity || 0) + quantity;
      if (nextQuantity > product.stock) {
        return res
          .status(400)
          .json({ success: false, message: `Only ${product.stock} available` });
      }
      if (item) item.quantity = nextQuantity;
      else cart.items.push({ product: product._id, quantity });
      await cart.save();
      await cart.populate("items.product");
      return res
        .status(200)
        .json({ success: true, message: "Cart updated", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to update cart" });
    }
  }

  static async updateItem(req, res) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      if (
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Enter a valid quantity" });
      }
      const [product, cart] = await Promise.all([
        Product.findById(productId),
        Cart.findOne({ user: req.user._id }),
      ]);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      if (!cart)
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      if (quantity > product.stock) {
        return res
          .status(400)
          .json({ success: false, message: `Only ${product.stock} available` });
      }
      const item = cart.items.find(
        (entry) => entry.product.toString() === productId,
      );
      if (!item)
        return res
          .status(404)
          .json({ success: false, message: "Item not found in cart" });
      item.quantity = quantity;
      await cart.save();
      await cart.populate("items.product");
      return res.json({ success: true, message: "Cart updated", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to update cart" });
    }
  }

  static async removeItem(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.productId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID" });
      }
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart)
        return res
          .status(404)
          .json({ success: false, message: "Cart not found" });
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId,
      );
      await cart.save();
      await cart.populate("items.product");
      return res.json({ success: true, message: "Item removed", cart });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to remove item" });
    }
  }
}

module.exports = CartController;
