const mongoose = require("mongoose")

// Database connection with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5
  let retries = 0

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce_admin", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      })

      console.log("MongoDB connected successfully")
      return
    } catch (error) {
      retries++
      console.error(`Database connection attempt ${retries} failed:`, error.message)

      if (retries === maxRetries) {
        console.error("Max retries reached. Exiting...")
        process.exit(1)
      }

      console.log(`Retrying in 5 seconds...`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

// Database health check
const checkDatabaseHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping()
    return { status: "healthy", message: "Database connection is active" }
  } catch (error) {
    return { status: "unhealthy", message: error.message }
  }
}

// Graceful shutdown
const gracefulShutdown = () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed through app termination")
    process.exit(0)
  })
}

// Connection event handlers
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB")
})

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB")
})

// Handle process termination
process.on("SIGINT", gracefulShutdown)
process.on("SIGTERM", gracefulShutdown)

module.exports = {
  connectWithRetry,
  checkDatabaseHealth,
  gracefulShutdown,
}
