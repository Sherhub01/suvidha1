import mongoose from "mongoose";

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/suvidha1";

const connectDB = async (retries = 5) => {
  const isProduction = process.env.NODE_ENV === "production";
  const primaryUri = process.env.MONGO_URI;

  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(primaryUri, {
        dbName: "suvidha1",
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("mongoDB Connected ✅ (db: suvidha1)");
      return { usingLocalDatabase: false };
    } catch (error) {
      console.log(`Database connection error (attempt ${i}/${retries}):`, error.message);
      if (!isProduction && i === 1) {
        try {
          await mongoose.connect(LOCAL_MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          });
          console.warn("Using local MongoDB fallback at 127.0.0.1:27017.");
          return { usingLocalDatabase: true };
        } catch (localError) {
          console.log("Local MongoDB fallback unavailable:", localError.message);
        }
      }
      if (i === retries) {
        console.error("❌ Could not connect to MongoDB after", retries, "attempts.");
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

export default connectDB;
