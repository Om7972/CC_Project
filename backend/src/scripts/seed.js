/* eslint-disable no-console */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seed() {
  await connectDB();
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@cloudmart.local';
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      email: adminEmail,
      displayName: 'CloudMart Admin',
      role: 'admin',
      isEmailVerified: true,
      plan: 'enterprise',
      loginProvider: 'local',
    });
    console.log('Seeded admin user');
  } else {
    console.log('Admin already exists');
  }
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
