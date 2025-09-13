const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Electronics",
        "Clothing",
        "Home & Garden",
        "Sports & Outdoors",
        "Books",
        "Health & Beauty",
        "Toys & Games",
        "Automotive",
        "Food & Beverages",
        "Other",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

// Generate SKU before saving
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const prefix = this.category.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-6)
    this.sku = `${prefix}-${timestamp}`
  }
  next()
})

// Index for search functionality
productSchema.index({ name: "text", description: "text", category: "text" })

module.exports = mongoose.model("Product", productSchema)
