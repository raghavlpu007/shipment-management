import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FieldsConfig } from '../models';

dotenv.config();

const updateFieldWidths = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/shipment-management';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Update all fields with new width settings
    const updates = [
      { key: 'date', width: 'third' },
      { key: 'pickupCustomerName', width: 'third' },
      { key: 'pickupCustomerMoNo', width: 'third' },
      { key: 'pickupRef', width: 'third' },
      { key: 'awb', width: 'third' },
      { key: 'awbImageUrl', width: 'third' },
      { key: 'courierPartner', width: 'third' },
      { key: 'weight', width: 'third' },
      { key: 'weightImageUrl', width: 'third' },
      { key: 'pinCode', width: 'third' },
      { key: 'city', width: 'third' },
      { key: 'state', width: 'third' },
      { key: 'bookingCode', width: 'third' },
      { key: 'baseAmount', width: 'third' },
      { key: 'royaltyMargin', width: 'third' },
      { key: 'gst', width: 'third' },
      { key: 'stickerUrl', width: 'third' },
      { key: 'saleCost', width: 'third' },
      { key: 'customerName', width: 'half' },
      { key: 'customerMoNo', width: 'third' },
      { key: 'paymentStatus', width: 'third' },
      { key: 'shipmentStatus', width: 'third' }
    ];

    for (const update of updates) {
      await FieldsConfig.findOneAndUpdate(
        { key: update.key },
        { width: update.width },
        { new: true }
      );
      console.log(`Updated ${update.key} with width: ${update.width}`);
    }

    console.log('All field widths updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating field widths:', error);
    process.exit(1);
  }
};

updateFieldWidths();

