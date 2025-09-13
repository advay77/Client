const { body, validationResult } = require("express-validator")

// Common validation rules
const emailValidation = body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address")

const passwordValidation = body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long")

const nameValidation = (field) =>
  body(field).trim().isLength({ min: 1, max: 50 }).withMessage(`${field} must be between 1 and 50 characters`)

// Product validation rules
const productValidationRules = () => {
  return [
    body("name").trim().isLength({ min: 1, max: 200 }).withMessage("Product name must be between 1 and 200 characters"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("Description must be between 1 and 2000 characters"),
    body("category")
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
      ])
      .withMessage("Please select a valid category"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    body("isBestseller").optional().isBoolean().withMessage("Bestseller must be a boolean value"),
  ]
}

// Auth validation rules
const registerValidationRules = () => {
  return [emailValidation, passwordValidation, nameValidation("firstName"), nameValidation("lastName")]
}

const loginValidationRules = () => {
  return [emailValidation, body("password").exists().withMessage("Password is required")]
}

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

module.exports = {
  productValidationRules,
  registerValidationRules,
  loginValidationRules,
  validate,
}
