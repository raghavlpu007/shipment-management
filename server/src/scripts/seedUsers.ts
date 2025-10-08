import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/shipment-management';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist. Skipping seed...');
      process.exit(0);
    }

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    
    const users = [
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: await bcrypt.hash('admin123', salt),
        role: UserRole.SUPER_ADMIN,
        isActive: true
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', salt),
        role: UserRole.ADMIN,
        isActive: true
      },
      {
        username: 'manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', salt),
        role: UserRole.MANAGER,
        isActive: true
      },
      {
        username: 'user',
        email: 'user@example.com',
        password: await bcrypt.hash('user123', salt),
        role: UserRole.USER,
        isActive: true
      }
    ];

    await User.insertMany(users);

    console.log('✅ Sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Super Admin:');
    console.log('  Email: superadmin@example.com');
    console.log('  Password: admin123');
    console.log('\nAdmin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('\nManager:');
    console.log('  Email: manager@example.com');
    console.log('  Password: manager123');
    console.log('\nUser:');
    console.log('  Email: user@example.com');
    console.log('  Password: user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

