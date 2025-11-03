import mongoose from 'mongoose';

let cachedDb: typeof mongoose | null = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    const connection = await mongoose.connect("mongodb+srv://Cluster44370:rPxVwmau0taAOsUJ@cluster44370.a6jdq.mongodb.net/Perfume-commerce?authMechanism=SCRAM-SHA-1", {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedDb = connection;
    console.log("MongoDB connected");
    return connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}