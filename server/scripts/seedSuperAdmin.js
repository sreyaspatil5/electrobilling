const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const path = require('path');
const dotenv = require('dotenv');
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email: 'superadmin@gmail.com' });

    if (!existing) {
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        passwordHash: 'superadmin@2001',
        role: 'superadmin',
        status: 'active'
      });

      console.log('Superadmin created');
    } else {
      console.log('Superadmin already exists');
    }
  } catch (error) {
    console.error('Error seeding superadmin:', error);
  } finally {
    process.exit();
  }
})();
