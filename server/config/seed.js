const User = require('../models/User');
const logger = require('./logger');

/**
 * Auto-seeds the admin account from environment variables on server startup.
 * Runs only if no admin user exists yet — safe to call every time.
 */
const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || 'Admin';

    if (!email || !password) {
      logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed');
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      logger.info(`Admin account already exists: ${email}`);
      return;
    }

    // Create admin — the User model's pre-save hook hashes the password
    await User.create({ name, email, passwordHash: password, role: 'admin' });
    logger.info(`✅ Admin account seeded: ${email}`);
  } catch (err) {
    logger.error('Admin seed failed:', err);
  }
};

module.exports = seedAdmin;
