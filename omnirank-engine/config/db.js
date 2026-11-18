import mongoose from "mongoose";

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("⚠️ Warning: MONGODB_URI is not set. Server is running without persistent database.");
    return false;
  }

  if ((process.env.NODE_ENV === "production" || process.env.RENDER) && (uri.includes("127.0.0.1") || uri.includes("localhost"))) {
    console.warn("⚠️ Warning: MONGODB_URI is pointing to localhost on a cloud server. Please provide a MongoDB Atlas cloud URI to persist audits permanently.");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ Mongo connected successfully");
    return true;
  } catch (err) {
    console.error("⚠️ MongoDB connection error:", err.message);
    console.warn("⚠️ Server will continue running, but database features will be temporarily offline until a valid MONGODB_URI is provided.");
    return false;
  }
}

export function isDbReady() {
  return isConnected && mongoose.connection.readyState === 1;
}


