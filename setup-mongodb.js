const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

async function setupMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxe_admin';
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const users = db.collection('users');

    // Check if admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxe.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await users.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      console.log(`Email: ${existingAdmin.email}`);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const result = await users.insertOne({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('✅ Admin user created successfully');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔌 MongoDB Connection Error:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Try starting MongoDB with:');
      console.log('   mongod --dbpath="C:\\data\\db"');
      console.log('3. Or start MongoDB as a service:');
      console.log('   net start MongoDB');
    }
  } finally {
    await client.close();
  }
}

setupMongoDB();
