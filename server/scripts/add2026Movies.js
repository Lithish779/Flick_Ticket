/**
 * Adds 22 Blockbuster 2025/2026/2027 Movies with Showtimes
 * Including: Dhurandhar, The Varanasi Scene, Odyssey, Avatar: Fire & Ash, Avengers: Doomsday, etc.
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const ATLAS_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://Lithish_project:Lithishkumar@cluster0.l8hi8yu.mongodb.net/flickticket?retryWrites=true&w=majority";
const LOCAL_URI = "mongodb://127.0.0.1:27017/cinebook";

const NEW_2026_MOVIES = [
  {
    title: "Dhurandhar",
    description: "Directed by Aditya Dhar, an elite Indian RAW intelligence black-ops operative (Ranveer Singh) leads a classified covert counter-terrorism operation across hostile international territories alongside Sanjay Dutt, R. Madhavan, Akshaye Khanna, and Arjun Rampal.",
    duration: 165,
    poster: "https://m.media-amazon.com/images/M/MV5BNTI4YjJjY2UtNDQ5Ny00OTBhLTg2NTktNDExNjRjZDE3OTM2XkEyXkFqcGc@._V1_.jpg",
    genre: "Action | Thriller",
    year: "2025",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil"],
    rating: 9.4,
    votes: "180K",
    certificate: "UA 16+",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "Winter 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk"
  },
  {
    title: "The Varanasi Scene",
    description: "Along the sacred ghats and labyrinthine alleys of Varanasi, a decorated homicide detective and an enigmatic local scholar unravel a sequence of ritualistic assassinations connected to an ancient cosmic manuscript.",
    duration: 148,
    poster: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    genre: "Mystery | Thriller",
    year: "2026",
    language: "Hindi",
    languages: ["Hindi", "Tamil", "Telugu", "English"],
    rating: 9.1,
    votes: "95K",
    certificate: "UA",
    formats: ["2D", "Dolby Atmos"],
    releaseDate: "Spring 2026",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  {
    title: "Odyssey: Beyond the Horizon",
    description: "An interstellar expedition embarks on humankind's most perilous deep-space voyage toward the edge of the observable universe to decode an extraterrestrial harmonic signal before Earth's magnetic core collapses.",
    duration: 162,
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    genre: "Sci-Fi | Adventure",
    year: "2026",
    language: "English",
    languages: ["English", "Hindi", "Telugu"],
    rating: 9.3,
    votes: "140K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "4DX"],
    releaseDate: "Summer 2026",
    trailerUrl: "https://www.youtube.com/watch?v=gEU2QniE6E7"
  },
  {
    title: "Avatar: Fire and Ash",
    description: "James Cameron returns to Pandora as Jake Sully and Neytiri encounter the Ash People, an aggressive volcanic clan of Na'vi led by Varang, testing their family's bond and survival against mounting RDA threats.",
    duration: 195,
    poster: "https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    genre: "Sci-Fi | Action | Adventure",
    year: "2025",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 9.7,
    votes: "650K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "4DX"],
    releaseDate: "December 19, 2025",
    trailerUrl: "https://www.youtube.com/watch?v=d9MyW72ELq0"
  },
  {
    title: "Avengers: Doomsday",
    description: "The Marvel Cinematic Universe collides across timelines as the newly assembled Avengers and Fantastic Four confront Victor Von Doom (Robert Downey Jr) in an apocalyptic multiversal battle for existence.",
    duration: 180,
    poster: "https://image.tmdb.org/t/p/original/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    genre: "Action | Sci-Fi",
    year: "2026",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 9.8,
    votes: "520K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "4DX", "Dolby Atmos"],
    releaseDate: "May 2026",
    trailerUrl: "https://www.youtube.com/watch?v=TcMBFSGVi1c"
  },
  {
    title: "Spider-Man: Beyond the Spider-Verse",
    description: "Miles Morales traverses parallel dimensions alongside Gwen Stacy and an alternate army of Spider-heroes to stop the Spot and rescue his father while escaping the ruthless clutches of Earth-42's Prowler.",
    duration: 140,
    poster: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    genre: "Action | Sci-Fi | Adventure",
    year: "2026",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 9.6,
    votes: "380K",
    certificate: "U",
    formats: ["2D", "3D", "IMAX 3D", "4DX"],
    releaseDate: "2026",
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg"
  },
  {
    title: "The Batman: Part II",
    description: "Matt Reeves expands the gritty, rain-slicked underworld of Gotham City as Bruce Wayne (Robert Pattinson) digs into the deep criminal web of the Court of Owls and Oswald Cobblepot's tightening empire.",
    duration: 172,
    poster: "https://image.tmdb.org/t/p/original/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    genre: "Action | Crime | Drama",
    year: "2026",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 9.3,
    votes: "290K",
    certificate: "A",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "October 2026",
    trailerUrl: "https://www.youtube.com/watch?v=mqqft2x_Aa4"
  },
  {
    title: "SSMB29: Garuda",
    description: "Directed by visionary filmmaker S.S. Rajamouli, Superstar Mahesh Babu stars in an epic globetrotting jungle action-adventure exploring ancient mythological treasures across the Amazon and African wilderness.",
    duration: 190,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Adventure | Mythology",
    year: "2026",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada", "English"],
    rating: 9.9,
    votes: "720K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "Dolby Atmos"],
    releaseDate: "Sankranti 2027",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk"
  },
  {
    title: "Spirit",
    description: "Directed by Sandeep Reddy Vanga, Prabhas portrays a fiercely rebellious, uncompromising IPS police commissioner tackling international drug cartels in a raw, explosive high-octane crime drama.",
    duration: 175,
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Crime | Thriller",
    year: "2026",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"],
    rating: 9.5,
    votes: "390K",
    certificate: "A",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "Mid 2026",
    trailerUrl: "https://www.youtube.com/watch?v=1F3d1qgLgHk"
  },
  {
    title: "War 2",
    description: "YRF Spy Universe explodes as Major Kabir Dhaliwal (Hrithik Roshan) faces off against a ferocious, lethal rogue intelligence commander (Jr NTR) in an adrenaline-pumping international espionage showdown directed by Ayan Mukerji.",
    duration: 160,
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Thriller",
    year: "2025",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil"],
    rating: 9.2,
    votes: "410K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "4DX"],
    releaseDate: "Independence Day 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=tQ0mzXRk-oM"
  },
  {
    title: "Toxic: A Fairy Tale for Grown-ups",
    description: "Rocking Star Yash teams up with National Award-winning director Geetu Mohandas in a dark, atmospheric vintage London-Goa drug cartel thriller infused with brutal action and noir intrigue.",
    duration: 168,
    poster: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Thriller | Crime",
    year: "2026",
    language: "Kannada",
    languages: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    rating: 9.4,
    votes: "340K",
    certificate: "A",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "April 2026",
    trailerUrl: "https://www.youtube.com/watch?v=Qah9sSIXitI"
  },
  {
    title: "Kantara: Chapter 1",
    description: "Rishab Shetty dives into the origin mythology of the divine Kadamba dynasty, exploring the ferocious ancient genesis of Panjurli and Guliga Daiva spirits in coastal Karnataka's mystic forests.",
    duration: 155,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/fdd27c502e7ba96d0a71892e476677bda52157d23a24b0d701e95767e9fcac24._SX1080_FMpng_.png",
    genre: "Mythology | Action | Drama",
    year: "2025",
    language: "Kannada",
    languages: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    rating: 9.6,
    votes: "480K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "October 2, 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=8mrVmf239GU"
  },
  {
    title: "Coolie",
    description: "Directed by Lokesh Kanagaraj, Superstar Rajinikanth commands the screen as Deva, a legendary port dockworker wielding heavy gold chains against an international gold smuggling conglomerate.",
    duration: 165,
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Thriller",
    year: "2025",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi", "Kannada", "Malayalam"],
    rating: 9.3,
    votes: "320K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "May 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=L0yEm3t81L8"
  },
  {
    title: "Thug Life",
    description: "Mani Ratnam and Kamal Haasan reunite after three decades for a sweeping gangster epic depicting Rangaraya Sakthivel Nayakar traversing the desert badlands and underbellies of crime.",
    duration: 158,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Drama | Crime",
    year: "2025",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    rating: 9.2,
    votes: "230K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "June 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk"
  },
  {
    title: "King",
    description: "Directed by Sujoy Ghosh and action by Siddharth Anand, Shah Rukh Khan plays an underworld assassin mentor guiding his daughter (Suhana Khan) through a deadly web of international syndicate hitmen.",
    duration: 152,
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Crime | Thriller",
    year: "2026",
    language: "Hindi",
    languages: ["Hindi", "Tamil", "Telugu"],
    rating: 9.5,
    votes: "460K",
    certificate: "UA 16+",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "Eid 2026",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  {
    title: "Alpha",
    description: "The YRF Spy Universe's first female-led tentpole features Alia Bhatt and Sharvari as lethal shadow commandos dismantling a rogue bioweapons operation across Eastern European snowy peaks.",
    duration: 145,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Thriller",
    year: "2025",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil"],
    rating: 9.1,
    votes: "210K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Christmas 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=tQ0mzXRk-oM"
  },
  {
    title: "L2: Empuraan",
    description: "Prithviraj Sukumaran directs Mohanlal in the grand continuation of Lucifer, unraveling the shadowy international underworld syndicate of Stephen Nedumpally (Khureshi-Ab'raam) across six countries.",
    duration: 178,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    genre: "Action | Drama | Thriller",
    year: "2025",
    language: "Malayalam",
    languages: ["Malayalam", "Hindi", "Tamil", "Telugu", "Kannada"],
    rating: 9.5,
    votes: "310K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "Dolby Atmos"],
    releaseDate: "March 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=L0yEm3t81L8"
  },
  {
    title: "Brahmāstra: Part Two – Dev",
    description: "The Astraverse deepens into ancient Vedic origins as Dev, the fiery wielder of the Brahmandastra, wages a titanic war of divine powers against the guardians of the Brahmansh.",
    duration: 170,
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    genre: "Mythology | Fantasy | Action",
    year: "2026",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"],
    rating: 9.3,
    votes: "370K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "Dolby Atmos"],
    releaseDate: "December 2026",
    trailerUrl: "https://www.youtube.com/watch?v=V5Z66p9uU5A"
  },
  {
    title: "Tron: Ares",
    description: "Directed by Joachim Rønning with an iconic Nine Inch Nails score, a highly sophisticated digital program named Ares (Jared Leto) is dispatched from the Grid into the human real world.",
    duration: 138,
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    genre: "Sci-Fi | Action",
    year: "2025",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 8.9,
    votes: "175K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "4DX"],
    releaseDate: "October 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg"
  },
  {
    title: "Mission: Impossible – The Final Reckoning",
    description: "Ethan Hunt (Tom Cruise) and his IMF team face their ultimate endgame, locating the Sevastopol submarine to destroy the rogue omniscient AI Entity before global nuclear defense networks are seized.",
    duration: 174,
    poster: "https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    genre: "Action | Thriller",
    year: "2025",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 9.5,
    votes: "420K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "4DX", "Dolby Atmos"],
    releaseDate: "May 23, 2025 / 2026",
    trailerUrl: "https://www.youtube.com/watch?v=fsQgc9pCyDU"
  },
  {
    title: "Shrek 5",
    description: "DreamWorks Animation reunites Mike Myers, Eddie Murphy, and Cameron Diaz for a riotous, heartwarming new fairy-tale adventure as Shrek and Donkey navigate parenthood and an unruly new kingdom.",
    duration: 104,
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    genre: "Animation | Comedy | Adventure",
    year: "2026",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 9.0,
    votes: "190K",
    certificate: "U",
    formats: ["2D", "3D"],
    releaseDate: "July 2026",
    trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg"
  },
  {
    title: "Stree 3",
    description: "The Maddock Supernatural Universe reaches its terrifying, side-splitting crescendo as the mystery of the nameless Chanderi maiden deepens against an ancient spectral threat.",
    duration: 145,
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    genre: "Horror | Comedy",
    year: "2027",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil"],
    rating: 9.2,
    votes: "280K",
    certificate: "UA",
    formats: ["2D", "3D"],
    releaseDate: "2027",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk"
  }
];

const THEATRES = [
  "PVR Directors Cut - Ambience Mall",
  "INOX Megaplex - Phoenix Mall",
  "Cinépolis VIP - DLF Avenue",
  "Miraj Cinemas - Grand Venice",
  "PVR Superplex - Mall of India"
];

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

async function seedConnection(uri, label) {
  console.log(`Connecting to ${label}...`);
  const conn = await mongoose.createConnection(uri).asPromise();
  const moviesCol = conn.db.collection("movies");
  const showsCol = conn.db.collection("shows");

  console.log(`Seeding ${NEW_2026_MOVIES.length} new 2026/2027 blockbusters to ${label}...`);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  for (const movieData of NEW_2026_MOVIES) {
    const res = await moviesCol.findOneAndUpdate(
      { title: movieData.title },
      { $set: movieData },
      { upsert: true, returnDocument: "after" }
    );
    const movieDoc = res || (await moviesCol.findOne({ title: movieData.title }));

    // Create showtimes
    const existingShows = await showsCol.countDocuments({ movieId: movieDoc._id });
    if (existingShows === 0) {
      const t1 = THEATRES[Math.floor(Math.random() * THEATRES.length)];
      const t2 = THEATRES[(THEATRES.indexOf(t1) + 1) % THEATRES.length];

      await showsCol.insertMany([
        {
          movieId: movieDoc._id,
          theatre: t1,
          screen: "Audi 1 - IMAX Laser 3D",
          date: todayStr,
          time: "06:30 PM",
          balconyPrice: 450,
          firstClassPrice: 320,
          secondClassPrice: 220,
          seats: generateSeats(450, 320, 220),
        },
        {
          movieId: movieDoc._id,
          theatre: t2,
          screen: "Audi 2 - Dolby Atmos 4K",
          date: tomorrowStr,
          time: "09:15 PM",
          balconyPrice: 420,
          firstClassPrice: 290,
          secondClassPrice: 200,
          seats: generateSeats(420, 290, 200),
        },
      ]);
    }
  }

  const finalMovieCount = await moviesCol.countDocuments();
  const finalShowCount = await showsCol.countDocuments();
  console.log(`✅ ${label} successfully seeded! Total movies: ${finalMovieCount}, Total shows: ${finalShowCount}`);
}

async function run() {
  await seedConnection(ATLAS_URI, "MongoDB Atlas (Cloud)");
  try {
    await seedConnection(LOCAL_URI, "Local MongoDB");
  } catch (err) {
    console.log("Local MongoDB skip:", err.message);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

