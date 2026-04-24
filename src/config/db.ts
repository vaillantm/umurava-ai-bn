import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      family: 4,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      directConnection: false,
      ssl: true,
    };

    console.log('Connecting to MongoDB Atlas...');

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB connected successfully');
  } catch (err: any) {
    console.error(`MongoDB connection error: ${err.message}`);

    if (err.message.includes('IP') || err.message.includes('whitelist')) {
      console.log('\nFix: Add your IP to MongoDB Atlas Network Access:');
      console.log('1. Go to https://cloud.mongodb.com');
      console.log('2. Navigate to Network Access');
      console.log('3. Click "Add IP Address"');
      console.log('4. Add IP: 197.157.187.244 or 0.0.0.0/0 for all IPs\n');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('DNS')) {
      console.log('\nDNS resolution issue. Try these fixes:');
      console.log('1. Check your internet connection');
      console.log('2. Try different DNS servers in .env file');
      console.log('3. Disable VPN if using one');
      console.log('4. Flush DNS cache: ipconfig /flushdns\n');
    }

    process.exit(1);
  }
};

export default connectDB;
