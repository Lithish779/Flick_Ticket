const mongoose = require("mongoose");
const { seedAllMoviesAndShows } = require("../services/movieSeeder");
const { seedDefaultUsers } = require("../services/userSeeder");

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb+srv://Lithish_project:Lithishkumar@cluster0.l8hi8yu.mongodb.net/flickticket?retryWrites=true&w=majority";
    
    if (!process.env.MONGO_URI) {
      console.warn("⚠️ Warning: MONGO_URI is not set in environment variables! Using localhost fallback.");
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");

    if (process.env.NODE_ENV !== "test") {
      // Automatically seed movies across all languages and their showtimes
      await seedAllMoviesAndShows();
      // Automatically ensure all default assessment accounts (Admin, Staff, Customer) exist
      await seedDefaultUsers();
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    if (!process.env.MONGO_URI) {
      console.error("👉 Please add MONGO_URI in your Render Environment Variables (e.g. from MongoDB Atlas).");
    }
  }
};

module.exports = connectDB;
