const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

function isValidProductInput(body, partial = false) {
  const fields = ["name", "description", "category", "price", "stock"];
  if (!partial && fields.some((field) => body[field] === undefined))
    return false;
  if (
    body.name !== undefined &&
    (typeof body.name !== "string" || body.name.trim().length < 2)
  )
    return false;
  if (body.description !== undefined && typeof body.description !== "string")
    return false;
  if (
    body.category !== undefined &&
    (typeof body.category !== "string" || !body.category.trim())
  )
    return false;
  if (
    body.price !== undefined &&
    (!Number.isFinite(Number(body.price)) || Number(body.price) < 0)
  )
    return false;
  if (
    body.stock !== undefined &&
    (!Number.isInteger(Number(body.stock)) || Number(body.stock) < 0)
  )
    return false;
  if (body.image !== undefined && typeof body.image !== "string") return false;
  return true;
}

class ProductController {
  static async getProducts(req, res) {
    try {
      const { category, search } = req.query;
      const filter = {};
      if (typeof category === "string" && category.trim())
        filter.category = category.trim();
      if (typeof search === "string" && search.trim()) {
        const escapedSearch = search
          .trim()
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
          { name: { $regex: escapedSearch, $options: "i" } },
          { description: { $regex: escapedSearch, $options: "i" } },
          { category: { $regex: escapedSearch, $options: "i" } },
        ];
      }
      const products = await Product.find(filter).sort({ createdAt: -1 });
      return res.json({ success: true, count: products.length, products });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load products" });
    }
  }

  static async getProduct(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID" });
      }
      const product = await Product.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      return res.json({ success: true, product });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to load product" });
    }
  }

  static async createProduct(req, res) {
    try {
      if (!isValidProductInput(req.body)) {
        return res
          .status(400)
          .json({ success: false, message: "Enter valid product details" });
      }
      const product = await Product.create({
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        category: req.body.category.trim(),
        price: Number(req.body.price),
        stock: Number(req.body.stock),
        image: req.body.image || "",
      });
      return res
        .status(201)
        .json({ success: true, message: "Product created", product });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to create product" });
    }
  }

  static async updateProduct(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID" });
      }
      if (!isValidProductInput(req.body, true)) {
        return res
          .status(400)
          .json({ success: false, message: "Enter valid product details" });
      }
      const updates = { ...req.body };
      for (const field of ["name", "description", "category", "image"]) {
        if (typeof updates[field] === "string")
          updates[field] = updates[field].trim();
      }
      if (updates.price !== undefined) updates.price = Number(updates.price);
      if (updates.stock !== undefined) updates.stock = Number(updates.stock);
      const product = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      return res.json({ success: true, message: "Product updated", product });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Unable to update product" });
    }
  }

  static async deleteProduct(req, res) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid product ID" });
      }
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      await Cart.updateMany({}, { $pull: { items: { product: product._id } } });
      return res.json({ success: true, message: "Product deleted" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to delete product" });
    }
  }
}

module.exports = ProductController;
