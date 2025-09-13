require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('Starting admin setup...');
console.log('MongoDB URI:', process.env.MONGODB_URI);
console.log('Admin Email:', process.env.ADMIN_EMAIL);

// User model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function setupAdmin() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Connect to MongoDB with more options for better debugging
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Successfully connected to MongoDB');

    // Check if admin already exists
    console.log('Checking for existing admin user...');
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log('Admin email:', existingAdmin.email);
      console.log('Admin ID:', existingAdmin._id);
      process.exit(0);
    }

    // Hash the password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    // Create admin user
    console.log('Creating admin user...');
    const admin = new User({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully');
    console.log('Admin email:', admin.email);
    console.log('Admin ID:', admin._id);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:');
    console.error(error.message);
    console.error('Error stack:', error.stack);
    
    // Additional MongoDB connection error details
    if (error.name === 'MongoNetworkError') {
      console.error('\n🔌 MongoDB Connection Error:');
      console.error('1. Make sure MongoDB is running on your system');
      console.error('2. Check if the MongoDB service is started');
      console.error('3. Verify the connection string in .env file');
      console.error('4. Try running MongoDB with: mongod --dbpath="C:\\data\\db"');
    }
    
    process.exit(1);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

setupAdmin();
