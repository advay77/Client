const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  failureReason: {
    type: String,
    enum: ['invalid_credentials', 'account_locked', 'account_inactive', null],
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for faster queries
loginAttemptSchema.index({ email: 1, createdAt: 1 });
loginAttemptSchema.index({ ipAddress: 1, createdAt: 1 });

// Static method to log a login attempt
loginAttemptSchema.statics.logAttempt = async function(attemptData) {
  try {
    const attempt = new this(attemptData);
    await attempt.save();
    
    // Clean up old attempts (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await this.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
    
    return attempt;
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Static method to check if an IP should be blocked
loginAttemptSchema.statics.shouldBlockIP = async function(ipAddress) {
  try {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const recentAttempts = await this.countDocuments({
      ipAddress,
      success: false,
      createdAt: { $gt: oneHourAgo }
    });
    
    // Block if more than 5 failed attempts in the last hour
    return recentAttempts >= 5;
  } catch (error) {
    console.error('Error checking IP block status:', error);
    return false;
  }
};

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema);
