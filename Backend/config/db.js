import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        dbName: "suvidha1",
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("mongoDB Connected ✅ (db: suvidha1)");
      return;
    } catch (error) {
      console.log(`Database connection error (attempt ${i}/${retries}):`, error.message);
      if (i === retries) {
        console.error("❌ Could not connect to MongoDB after", retries, "attempts.");
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

export default connectDB;
