const mongoose = require("mongoose");
const { seedAllMoviesAndShows } = require("../services/movieSeeder");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    // Automatically seed movies across all languages and their showtimes
    await seedAllMoviesAndShows();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
