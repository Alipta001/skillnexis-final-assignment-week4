const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true, trim: true, maxlength: 120 },
        image: { type: String, default: "" },
        price: { type: Number, required: true, min: 0 },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          validate: Number.isInteger,
        },
      },
    ],
    shippingAddress: {
      customerName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      address: { type: String, required: true, trim: true, maxlength: 300 },
      city: { type: String, required: true, trim: true, maxlength: 100 },
      postalCode: { type: String, required: true, trim: true, maxlength: 20 },
    },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery"],
      required: true,
      default: "Cash on Delivery",
    },
    totalAmount: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
