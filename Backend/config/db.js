import mongoose from "mongoose";

const connectDB = async (retries = 5) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log("mongoDB Connected ✅");
      return;
    } catch (error) {
      console.log(`Database connection error (attempt ${i}/${retries}):`, error.message);
      if (i === retries) {
        console.error("❌ Could not connect to MongoDB after", retries, "attempts.");
        console.error("Check: 1) Atlas IP whitelist  2) Internet connection  3) MONGO_URI in .env");
        process.exit(1);
      }
      // Wait 3 seconds before retrying
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

export default connectDB;
