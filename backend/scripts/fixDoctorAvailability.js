import mongoose from 'mongoose';
import { DoctorAvailability } from '../models/doctorAvailabilityModel.js';

const fixDoctorAvailability = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/weHeal');
    console.log('Connected to MongoDB');

    // Drop the existing collection
    await DoctorAvailability.collection.drop();
    console.log('Dropped existing DoctorAvailability collection');

    // Recreate the collection with proper schema
    await DoctorAvailability.createCollection();
    console.log('Recreated DoctorAvailability collection');

    // Ensure the correct index is created
    await DoctorAvailability.collection.createIndex({ userId: 1, dayOfWeek: 1 }, { unique: true });
    console.log('Created correct compound index on userId and dayOfWeek');

    console.log('Successfully fixed DoctorAvailability collection');
  } catch (error) {
    console.error('Error fixing DoctorAvailability:', error);
  } finally {
    await mongoose.connection.close();
  }
};

fixDoctorAvailability(); 