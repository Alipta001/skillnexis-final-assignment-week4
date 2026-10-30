const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
