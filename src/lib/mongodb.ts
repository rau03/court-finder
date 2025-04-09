import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/pickleball_courts";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

let isConnected = false;

async function dbConnect() {
  if (isConnected) {
    return;
  }

  try {
    // For mongodb+srv URIs, we don't need to remove port numbers as they aren't valid
    // For standard mongodb:// URIs, port numbers are valid
    let uri = MONGODB_URI;

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export default dbConnect;
