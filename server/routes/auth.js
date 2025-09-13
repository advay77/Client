const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const LoginAttempt = require("../models/LoginAttempt")
const { auth } = require("../middleware/auth")
const requestIp = require('request-ip')

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_ATTEMPTS: 5,
  BLOCK_DURATION: 3600000 // 1 hour in milliseconds
}

// In-memory store for rate limiting (in production, use Redis)
const loginAttempts = new Map()

// Clean up old entries
setInterval(() => {
  const now = Date.now()
  for (const [key, { timestamp }] of loginAttempts.entries()) {
    if (now - timestamp > RATE_LIMIT.WINDOW_MS) {
      loginAttempts.delete(key)
    }
  }
}, RATE_LIMIT.WINDOW_MS)

// Middleware to check rate limiting
const checkRateLimit = (req, res, next) => {
  const ip = requestIp.getClientIp(req)
  const key = `login:${ip}`
  
  const now = Date.now()
  const attempt = loginAttempts.get(key) || { count: 0, timestamp: now }
  
  // Reset count if window has passed
  if (now - attempt.timestamp > RATE_LIMIT.WINDOW_MS) {
    attempt.count = 0
    attempt.timestamp = now
  }
  
  // Check if blocked
  if (attempt.count >= RATE_LIMIT.MAX_ATTEMPTS) {
    const timeLeft = Math.ceil((RATE_LIMIT.WINDOW_MS - (now - attempt.timestamp)) / 1000 / 60)
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${timeLeft} minutes.`
    })
  }
  
  // Increment attempt count
  attempt.count++
  loginAttempts.set(key, attempt)
  
  // Add remaining attempts to response headers
  res.set('X-RateLimit-Remaining', RATE_LIMIT.MAX_ATTEMPTS - attempt.count)
  res.set('X-RateLimit-Reset', new Date(attempt.timestamp + RATE_LIMIT.WINDOW_MS).toISOString())
  
  next()
}

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

// @route   POST /api/auth/register
// @desc    Register admin user
// @access  Public (but should be restricted in production)
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").trim().isLength({ min: 1 }),
    body("lastName").trim().isLength({ min: 1 }),
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

      const { email, password, firstName, lastName } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        })
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: "admin",
      })

      await user.save()

      // Generate token
      const token = generateToken(user._id)

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during registration",
      })
    }
  },
)

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
  ],
  checkRateLimit, // Apply rate limiting
  async (req, res) => {
    const ipAddress = requestIp.getClientIp(req)
    const userAgent = req.headers['user-agent'] || 'unknown'
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email, password } = req.body

      // Check if user exists
      const user = await User.findOne({ email })
      if (!user) {
        // Log failed login attempt
        await LoginAttempt.logAttempt({
          email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'invalid_credentials'
        })
        
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        // Log failed login attempt
        await LoginAttempt.logAttempt({
          email: user.email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'invalid_credentials',
          userId: user._id
        })
        
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Check if user is active
      if (!user.isActive) {
        await LoginAttempt.logAttempt({
          email: user.email,
          ipAddress,
          userAgent,
          success: false,
          failureReason: 'account_inactive',
          userId: user._id
        })
        
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact support.",
        })
      }

      // Generate JWT token
      const token = generateToken(user._id)

      // Log successful login
      await LoginAttempt.logAttempt({
        email: user.email,
        ipAddress,
        userAgent,
        success: true,
        userId: user._id
      })

      // Set HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Server error during authentication",
      })
    }
  },
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  })
})

module.exports = router
