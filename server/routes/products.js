const express = require("express")
const multer = require("multer")
const path = require("path")
const { body, validationResult, query } = require("express-validator")
const Product = require("../models/Product")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// @route   GET /api/products
// @desc    Get all products with pagination and search
// @access  Private (Admin)
router.get(
  "/",
  adminAuth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().isString(),
    query("category").optional().isString(),
    query("sortBy").optional().isIn(["name", "price", "createdAt", "stock"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 10
      const search = req.query.search || ""
      const category = req.query.category || ""
      const sortBy = req.query.sortBy || "createdAt"
      const sortOrder = req.query.sortOrder || "desc"

      // Build query
      const query = { isActive: true }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ]
      }

      if (category && category !== "all") {
        query.category = category
      }

      // Build sort object
      const sort = {}
      sort[sortBy] = sortOrder === "asc" ? 1 : -1

      // Execute query with pagination
      const products = await Product.find(query)
        .populate("createdBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)

      const total = await Product.countDocuments(query)

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            limit,
          },
        },
      })
    } catch (error) {
      console.error("Get products error:", error)
      res.status(500).json({
        success: false,
        message: "Server error while fetching products",
      })
    }
  },
)

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private (Admin)
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: { product },
    })
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    })
  }
})

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post(
  "/",
  adminAuth,
  upload.single("image"),
  [
    body("name").trim().isLength({ min: 1, max: 200 }),
    body("description").trim().isLength({ min: 1, max: 2000 }),
    body("category").isIn([
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
    ]),
    body("price").isFloat({ min: 0 }),
    body("stock").isInt({ min: 0 }),
    body("isBestseller").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { name, description, category, price, stock, isBestseller } = req.body

      const productData = {
        name,
        description,
        category,
        price: Number.parseFloat(price),
        stock: Number.parseInt(stock),
        isBestseller: isBestseller === "true",
        createdBy: req.user._id,
      }

      // Add image URL if uploaded
      if (req.file) {
        productData.imageUrl = `/uploads/products/${req.file.filename}`
      }

      const product = new Product(productData)
      await product.save()

      // Populate user data for response
      await product.populate("createdBy", "firstName lastName email")

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      })
    } catch (error) {
      console.error("Create product error:", error)
      res.status(500).json({
        success: false,
        message: "Server error while creating product",
      })
    }
  },
)

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put(
  "/:id",
  adminAuth,
  upload.single("image"),
  [
    body("name").optional().trim().isLength({ min: 1, max: 200 }),
    body("description").optional().trim().isLength({ min: 1, max: 2000 }),
    body("category")
      .optional()
      .isIn([
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
      ]),
    body("price").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("isBestseller").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const product = await Product.findById(req.params.id)
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      // Update fields
      const updateFields = ["name", "description", "category", "price", "stock", "isBestseller"]
      updateFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === "price") {
            product[field] = Number.parseFloat(req.body[field])
          } else if (field === "stock") {
            product[field] = Number.parseInt(req.body[field])
          } else if (field === "isBestseller") {
            product[field] = req.body[field] === "true"
          } else {
            product[field] = req.body[field]
          }
        }
      })

      // Update image if uploaded
      if (req.file) {
        product.imageUrl = `/uploads/products/${req.file.filename}`
      }

      product.updatedBy = req.user._id
      await product.save()

      // Populate user data for response
      await product.populate("createdBy", "firstName lastName email")
      await product.populate("updatedBy", "firstName lastName email")

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      })
    } catch (error) {
      console.error("Update product error:", error)
      res.status(500).json({
        success: false,
        message: "Server error while updating product",
      })
    }
  },
)

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Soft delete
    product.isActive = false
    product.updatedBy = req.user._id
    await product.save()

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    })
  }
})

// @route   GET /api/products/stats/summary
// @desc    Get product statistics
// @access  Private (Admin)
router.get("/stats/summary", adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true })
    const bestsellers = await Product.countDocuments({ isActive: true, isBestseller: true })
    const lowStock = await Product.countDocuments({ isActive: true, stock: { $lt: 10 } })
    const outOfStock = await Product.countDocuments({ isActive: true, stock: 0 })

    // Category breakdown
    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Recent products
    const recentProducts = await Product.find({ isActive: true })
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name category price createdAt")

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          bestsellers,
          lowStock,
          outOfStock,
        },
        categoryStats,
        recentProducts,
      },
    })
  } catch (error) {
    console.error("Get product stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching product statistics",
    })
  }
})

module.exports = router
