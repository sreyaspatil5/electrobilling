require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.development') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Business = require('../models/Business');
const Counter = require('../models/Counter');
const connectDB = require('../config/db');

async function migrateData() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // 1. Find the Superadmin
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) {
      console.log('No superadmin found. Please run seedSuperAdmin.js first.');
      process.exit(1);
    }
    const adminId = superadmin._id;
    console.log(`Migrating data to Superadmin ID: ${adminId}`);

    // 2. Migrate Customers
    const customers = await Customer.updateMany({ adminId: { $exists: false } }, { $set: { adminId } });
    console.log(`Migrated ${customers.modifiedCount} customers.`);

    // 3. Migrate Products
    const products = await Product.updateMany({ adminId: { $exists: false } }, { $set: { adminId } });
    console.log(`Migrated ${products.modifiedCount} products.`);

    // 4. Migrate Invoices
    const invoices = await Invoice.updateMany({ adminId: { $exists: false } }, { $set: { adminId } });
    console.log(`Migrated ${invoices.modifiedCount} invoices.`);

    // 5. Migrate Businesses
    const businesses = await Business.updateMany({ adminId: { $exists: false } }, { $set: { adminId } });
    console.log(`Migrated ${businesses.modifiedCount} businesses.`);

    // 6. Migrate Counters
    const counters = await Counter.updateMany({ adminId: { $exists: false } }, { $set: { adminId } });
    console.log(`Migrated ${counters.modifiedCount} counters.`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateData();
