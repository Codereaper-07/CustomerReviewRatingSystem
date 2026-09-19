import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../modules/users/user.model.js';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'Password@123';
const ADMIN_NAME = 'Admin User';

async function seedAdmin() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`[seed:admin] Updated existing user ${ADMIN_EMAIL} to role 'admin'.`);
    } else {
      console.log(`[seed:admin] Admin account ${ADMIN_EMAIL} already exists.`);
    }
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
    });
    console.log(`[seed:admin] Created admin user:`);
    console.log(`Email:    ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  }
}

seedAdmin()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed:admin] Failed:', err);
    try {
      await disconnectDB();
    } catch {
      // ignore
    }
    process.exit(1);
  });
