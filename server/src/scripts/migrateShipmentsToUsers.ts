import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Shipment } from '../models';
import User from '../models/User';

dotenv.config();

const migrateShipments = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/shipment-management';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get first user (super admin) as default owner for existing shipments
    const defaultUser = await User.findOne().sort({ createdAt: 1 });
    
    if (!defaultUser) {
      console.log('No users found. Please run seedUsers script first.');
      process.exit(1);
    }

    console.log(`Assigning existing shipments to: ${defaultUser.username} (${defaultUser.email})`);

    // Update all shipments that don't have userId
    const result = await Shipment.updateMany(
      { userId: { $exists: false } },
      { 
        $set: { 
          userId: defaultUser._id,
          createdBy: defaultUser.email,
          updatedBy: defaultUser.email
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} shipments with userId`);

    // Show summary
    const totalShipments = await Shipment.countDocuments();
    const shipmentsPerUser = await Shipment.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Shipments Distribution:');
    for (const item of shipmentsPerUser) {
      const user = await User.findById(item._id);
      console.log(`  ${user?.username || 'Unknown'}: ${item.count} shipments`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error migrating shipments:', error);
    process.exit(1);
  }
};

migrateShipments();

