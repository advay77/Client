require("dotenv").config()
const mongoose = require("mongoose")
const { seedDatabase } = require("../utils/seedData")

const runSeed = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce_admin", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log("Connected to MongoDB")

    // Run seed functions
    await seedDatabase()

    console.log("Seeding completed successfully")
  } catch (error) {
    console.error("Seeding failed:", error)
  } finally {
    // Close connection
    await mongoose.connection.close()
    console.log("Database connection closed")
    process.exit(0)
  }
}

// Run if called directly
if (require.main === module) {
  runSeed()
}

module.exports = runSeed
