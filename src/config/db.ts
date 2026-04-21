import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

// Force Google DNS to resolve MongoDB Atlas SRV records reliably
dns.setDefaultResultOrder('ipv4first');
if (process.env.MONGODB_DNS_SERVER) {
  dns.setServers([process.env.MONGODB_DNS_SERVER]);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

export default connectDB;