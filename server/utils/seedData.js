const User = require("../models/User")
const Product = require("../models/Product")

const seedUsers = async () => {
  try {
    const userCount = await User.countDocuments()
    if (userCount > 0) {
      console.log("Users already exist, skipping seed")
      return
    }

    const users = [
      {
        email: "admin@example.com",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
      {
        email: "superadmin@example.com",
        password: "superadmin123",
        firstName: "Super",
        lastName: "Admin",
        role: "super_admin",
      },
    ]

    for (const userData of users) {
      const user = new User(userData)
      await user.save()
      console.log(`Created user: ${user.email}`)
    }
  } catch (error) {
    console.error("Error seeding users:", error)
  }
}

const seedProducts = async () => {
  try {
    const productCount = await Product.countDocuments()
    if (productCount > 0) {
      console.log("Products already exist, skipping seed")
      return
    }

    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: "admin" })
    if (!adminUser) {
      console.log("No admin user found, skipping product seed")
      return
    }

    const products = [
      {
        name: "Wireless Bluetooth Headphones",
        description: "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
        category: "Electronics",
        price: 199.99,
        stock: 50,
        isBestseller: true,
        createdBy: adminUser._id,
      },
      {
        name: "Organic Cotton T-Shirt",
        description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors.",
        category: "Clothing",
        price: 29.99,
        stock: 100,
        isBestseller: false,
        createdBy: adminUser._id,
      },
      {
        name: "Smart Home Security Camera",
        description: "1080p HD security camera with night vision and mobile app integration.",
        category: "Electronics",
        price: 149.99,
        stock: 25,
        isBestseller: true,
        createdBy: adminUser._id,
      },
      {
        name: "Yoga Mat Premium",
        description: "Non-slip premium yoga mat with carrying strap, perfect for all yoga practices.",
        category: "Sports & Outdoors",
        price: 49.99,
        stock: 75,
        isBestseller: false,
        createdBy: adminUser._id,
      },
      {
        name: "Coffee Maker Deluxe",
        description: "Programmable coffee maker with built-in grinder and thermal carafe.",
        category: "Home & Garden",
        price: 299.99,
        stock: 15,
        isBestseller: true,
        createdBy: adminUser._id,
      },
      {
        name: "JavaScript Programming Book",
        description: "Complete guide to modern JavaScript programming with practical examples.",
        category: "Books",
        price: 39.99,
        stock: 200,
        isBestseller: false,
        createdBy: adminUser._id,
      },
      {
        name: "Moisturizing Face Cream",
        description: "Hydrating face cream with natural ingredients for all skin types.",
        category: "Health & Beauty",
        price: 24.99,
        stock: 80,
        isBestseller: false,
        createdBy: adminUser._id,
      },
      {
        name: "Building Blocks Set",
        description: "Creative building blocks set for children ages 3-10, promotes STEM learning.",
        category: "Toys & Games",
        price: 59.99,
        stock: 40,
        isBestseller: true,
        createdBy: adminUser._id,
      },
    ]

    for (const productData of products) {
      const product = new Product(productData)
      await product.save()
      console.log(`Created product: ${product.name}`)
    }

    console.log(`Seeded ${products.length} products`)
  } catch (error) {
    console.error("Error seeding products:", error)
  }
}

const seedDatabase = async () => {
  console.log("Starting database seeding...")
  await seedUsers()
  await seedProducts()
  console.log("Database seeding completed")
}

module.exports = {
  seedUsers,
  seedProducts,
  seedDatabase,
}
