const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    poster: {
      type: String,
      required: true
    },
    genre: {
      type: String,
      required: true
    },
    language: {
      type: String,
      default: "English"
    },
    languages: {
      type: [String],
      default: ["English"]
    },
    rating: {
      type: Number,
      default: 9.0
    },
    votes: {
      type: String,
      default: "128K"
    },
    certificate: {
      type: String,
      default: "UA"
    },
    year: {
      type: String,
      default: "2025"
    },
    formats: {
      type: [String],
      default: ["2D", "3D"]
    },
    releaseDate: {
      type: String,
      default: "In Cinemas Now"
    },
    trailerUrl: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", movieSchema);
