const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-path';

const email = process.argv[2];

if (!email) {
  console.log('Please provide an email address.');
  console.log('Usage: node makeAdmin.js <user-email@example.com>');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ Successfully updated role for ${email} to 'admin'!`);
      console.log('Please log out and log back in on the app to see the Admin tab.');
    } else {
      console.log(`❌ User with email ${email} not found.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
