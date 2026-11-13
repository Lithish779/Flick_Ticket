require("dotenv").config();
const mongoose = require("mongoose");
const Movie = require("./models/Movie");
const Show = require("./models/Show");
const Snack = require("./models/Snack");
const Parking = require("./models/Parking");
const { seedDefaultUsers } = require("./services/userSeeder");

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Seed/verify default accounts regardless of movie state
    await seedDefaultUsers();

    const movieCount = await Movie.countDocuments();
    if (movieCount > 0) {
      console.log(`Database already has ${movieCount} movies. Skipping seed.`);
      process.exit(0);
    }

    console.log("Seeding initial movies and shows...");

    const movies = await Movie.insertMany([
      {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        duration: 166,
        poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        genre: "Sci-Fi",
        trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
      },
      {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
        genre: "Drama",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
      },
      {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft along with a team of researchers.",
        duration: 169,
        poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
        genre: "Sci-Fi",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        duration: 152,
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80",
        genre: "Action",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
      }
    ]);

    const generateSeats = (balconyPrice, firstPrice, secondPrice) => {
      const seats = [];
      ["A", "B", "C", "D"].forEach((row) => {
        for (let i = 1; i <= 10; i++) {
          seats.push({
            seatNumber: `${row}${i}`,
            category: "Balcony",
            price: Number(balconyPrice),
            isBooked: false,
          });
        }
      });
      ["E", "F", "G", "H"].forEach((row) => {
        for (let i = 1; i <= 12; i++) {
          seats.push({
            seatNumber: `${row}${i}`,
            category: "First Class",
            price: Number(firstPrice),
            isBooked: false,
          });
        }
      });
      ["I", "J", "K", "L"].forEach((row) => {
        for (let i = 1; i <= 12; i++) {
          seats.push({
            seatNumber: `${row}${i}`,
            category: "Second Class",
            price: Number(secondPrice),
            isBooked: false,
          });
        }
      });
      return seats;
    };

    const todayStr = new Date().toISOString().split("T")[0];

    for (const movie of movies) {
      await Show.create({
        movieId: movie._id,
        theatre: "FlickTicket IMAX Grand, Screen 1",
        date: todayStr,
        time: "07:00 PM",
        balconyPrice: 400,
        firstClassPrice: 280,
        secondClassPrice: 180,
        seats: generateSeats(400, 280, 180),
      });

      await Show.create({
        movieId: movie._id,
        theatre: "PVR Luxe Cinemas, Audi 3",
        date: todayStr,
        time: "10:15 PM",
        balconyPrice: 350,
        firstClassPrice: 250,
        secondClassPrice: 150,
        seats: generateSeats(350, 250, 150),
      });
    }

    await Snack.insertMany([
      { name: "Caramel Gourmet Popcorn (Large)", price: 290, theatre: "FlickTicket IMAX Grand, Screen 1" },
      { name: "Salted Butter Popcorn (Regular)", price: 210, theatre: "FlickTicket IMAX Grand, Screen 1" },
      { name: "Loaded Cheese Nachos with Salsa", price: 240, theatre: "FlickTicket IMAX Grand, Screen 1" },
      { name: "Cold Brew Iced Coffee", price: 180, theatre: "FlickTicket IMAX Grand, Screen 1" },
      { name: "Classic Coke (Fountain 500ml)", price: 150, theatre: "PVR Luxe Cinemas, Audi 3" },
      { name: "Cheese Burst Burger", price: 260, theatre: "PVR Luxe Cinemas, Audi 3" },
    ]);

    await Parking.insertMany([
      { theatre: "FlickTicket IMAX Grand, Screen 1", priceBike: 30, priceCar: 80 },
      { theatre: "PVR Luxe Cinemas, Audi 3", priceBike: 25, priceCar: 60 },
    ]);

    console.log("✅ Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seedData();

