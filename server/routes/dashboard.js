const express = require("express")
const { query, validationResult } = require("express-validator")
const Product = require("../models/Product")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get("/stats", adminAuth, [query("range").optional().isIn(["7d", "30d", "90d"])], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const range = req.query.range || "30d"
    const days = Number.parseInt(range.replace("d", ""))
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get product statistics
    const totalProducts = await Product.countDocuments({ isActive: true })
    const newProducts = await Product.countDocuments({
      isActive: true,
      createdAt: { $gte: startDate },
    })

    // Get sales data (mock for now - replace with actual order data)
    const salesData = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      salesData.push({
        date: date.toISOString().split("T")[0],
        sales: Math.floor(Math.random() * 1000) + 500,
        revenue: Math.floor(Math.random() * 5000) + 2000,
      })
    }

    // Get category performance
    const categoryPerformance = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalStock: { $sum: "$stock" },
        },
      },
      { $sort: { count: -1 } },
    ])

    // Get recent activity
    const recentProducts = await Product.find({
      isActive: true,
      createdAt: { $gte: startDate },
    })
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name category price createdAt")

    // Calculate growth metrics
    const previousPeriodStart = new Date(startDate)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days)

    const previousProducts = await Product.countDocuments({
      isActive: true,
      createdAt: { $gte: previousPeriodStart, $lt: startDate },
    })

    const growthRate = previousProducts > 0 ? ((newProducts - previousProducts) / previousProducts) * 100 : 0

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          newProducts,
          growthRate: Math.round(growthRate * 100) / 100,
          range,
        },
        salesData,
        categoryPerformance,
        recentActivity: recentProducts,
        metrics: {
          totalRevenue: salesData.reduce((sum, day) => sum + day.revenue, 0),
          totalSales: salesData.reduce((sum, day) => sum + day.sales, 0),
          avgOrderValue:
            salesData.length > 0
              ? salesData.reduce((sum, day) => sum + day.revenue, 0) /
                salesData.reduce((sum, day) => sum + day.sales, 0)
              : 0,
        },
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard statistics",
    })
  }
})

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics data
// @access  Private (Admin)
router.get("/analytics", adminAuth, async (req, res) => {
  try {
    // Top performing products
    const topProducts = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name category price stock isBestseller")

    // Stock alerts
    const lowStockProducts = await Product.find({
      isActive: true,
      stock: { $lt: 10, $gt: 0 },
    })
      .sort({ stock: 1 })
      .limit(10)
      .select("name stock category")

    const outOfStockProducts = await Product.find({
      isActive: true,
      stock: 0,
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name category updatedAt")

    // Category insights
    const categoryInsights = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          bestsellers: {
            $sum: { $cond: [{ $eq: ["$isBestseller", true] }, 1, 0] },
          },
        },
      },
      { $sort: { totalProducts: -1 } },
    ])

    res.json({
      success: true,
      data: {
        topProducts,
        stockAlerts: {
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
        categoryInsights,
      },
    })
  } catch (error) {
    console.error("Dashboard analytics error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics data",
    })
  }
})

module.exports = router
