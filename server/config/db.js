import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('⚠️ [Database] No MONGO_URI provided in .env.');
    console.warn('👉 Please add your MongoDB Atlas connection string to server/.env to enable database operations.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`===============================================`);
    console.log(`🍃 [Database] MongoDB Connected to: ${conn.connection.host}`);
    console.log(`===============================================`);
  } catch (error) {
    console.error(`❌ [Database Connection Error]: ${error.message}`);
    console.warn('👉 Please verify your MONGO_URI, network connection, or Atlas IP whitelist (0.0.0.0/0).');
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
};
