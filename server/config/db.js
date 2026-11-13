const mongoose = require("mongoose");
const { seedAllMoviesAndShows } = require("../services/movieSeeder");
const { seedDefaultUsers } = require("../services/userSeeder");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cinebook");
    console.log("MongoDB Connected");
    if (process.env.NODE_ENV !== "test") {
      // Automatically seed movies across all languages and their showtimes
      await seedAllMoviesAndShows();
      // Automatically ensure all default assessment accounts (Admin, Staff, Customer) exist
      await seedDefaultUsers();
    }
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV !== "test") process.exit(1);
  }
};

module.exports = connectDB;
