const Movie = require("../models/Movie");
const Show = require("../models/Show");

const SEED_MOVIES = [
  // ── 🌟 EPIC PREMIERE: RAMAYANA (OFFICIAL THEATRICAL POSTER) ───────────────
  {
    title: "Ramayana: Part 1",
    description: "Directed by Nitesh Tiwari, Lord Rama (Ranbir Kapoor) and Sita (Sai Pallavi) navigate divine prophecy, exile into the Dandakaranya forest, and the monumental battle against the demon king Ravana (Yash).",
    duration: 185,
    poster: "https://m.media-amazon.com/images/M/MV5BOTNjNTFhZmMtZGY2YS00OTY4LWI2M2MtNjhhZmJjZTgyNWNjXkEyXkFqcGc@._V1_.jpg",
    genre: "Mythology | Action",
    year: "2026",
    language: "Hindi",
    languages: ["Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"],
    rating: 9.9,
    votes: "480K",
    certificate: "U",
    formats: ["2D", "3D", "IMAX 3D", "Dolby Atmos"],
    releaseDate: "Diwali 2026 Premiere",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk"
  },

  // ── 🌟 PREMIERE SHOWCASE (FEATURED HERO) ──────────────────────────────────
  {
    title: "After the Hunt",
    description: "A college professor finds herself at a personal and professional crossroads when a star pupil levels an accusation against one of her colleagues, and a dark secret from her own past threatens to come to light.",
    duration: 135,
    poster: "http://www.impawards.com/2025/posters/after_the_hunt_xxlg.jpg",
    genre: "Drama",
    year: "2025",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 8.5,
    votes: "45K",
    certificate: "A",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "2025",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  {
    title: "Playdate",
    description: "A down-on-his-luck dad agrees to a playdate for his 10-year-old son with an eccentric billionaire's kid, only for the afternoon to spiral into an explosive, high-stakes action conspiracy.",
    duration: 95,
    poster: "http://www.impawards.com/2025/posters/playdate_xlg.jpg",
    genre: "Action | Comedy",
    year: "2025",
    language: "English",
    languages: ["English", "Hindi", "Tamil"],
    rating: 6.5,
    votes: "32K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "2025",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk"
  },

  // ── ENGLISH (ORIGINAL THEATRICAL POSTERS) ─────────────────────────────────
  {
    title: "Dune: Part Two",
    description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family on the desert planet of Arrakis.",
    duration: 166,
    poster: "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    genre: "Sci-Fi",
    year: "2024",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 9.1,
    votes: "310K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 70mm", "4DX"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=Way9Dexny3w"
  },
  {
    title: "Oppenheimer",
    description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    duration: 180,
    poster: "https://image.tmdb.org/t/p/original/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    genre: "Drama",
    year: "2023",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 9.3,
    votes: "390K",
    certificate: "A",
    formats: ["2D", "IMAX 70mm", "Dolby Atmos"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg"
  },
  {
    title: "Deadpool & Wolverine",
    description: "A listless Wade Wilson toils away in civilian life until a threat to his home world sends him reluctantly on a mission alongside Wolverine.",
    duration: 128,
    poster: "https://image.tmdb.org/t/p/original/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
    genre: "Action",
    year: "2024",
    language: "English",
    languages: ["English", "Hindi", "Tamil", "Telugu"],
    rating: 8.9,
    votes: "420K",
    certificate: "A",
    formats: ["2D", "3D", "IMAX 3D", "4DX"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=73_1biulkYk"
  },
  {
    title: "Interstellar",
    description: "When Earth becomes increasingly uninhabitable, a crew of astronauts travel through a mysterious wormhole near Saturn in search of a new home.",
    duration: 169,
    poster: "https://image.tmdb.org/t/p/original/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genre: "Sci-Fi",
    year: "2014",
    language: "English",
    languages: ["English"],
    rating: 9.4,
    votes: "510K",
    certificate: "UA",
    formats: ["2D", "IMAX 70mm"],
    releaseDate: "Special Rerelease",
    trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E"
  },
  {
    title: "The Dark Knight",
    description: "When the menace known as the Joker unleashes catastrophic havoc on Gotham, Batman must accept one of the greatest psychological and physical tests.",
    duration: 152,
    poster: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genre: "Action",
    year: "2008",
    language: "English",
    languages: ["English", "Hindi"],
    rating: 9.5,
    votes: "680K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Classic Showcase",
    trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY"
  },

  // ── HINDI (ORIGINAL THEATRICAL POSTERS) ───────────────────────────────────
  {
    title: "Jawan",
    description: "A high-octane emotional spectacle driven by a man's personal vendetta to rectify deep-seated corruption in society while honoring a promise.",
    duration: 169,
    poster: "https://image.tmdb.org/t/p/original/yihdXomYb5kTeSivtFndMy5iDmf.jpg",
    genre: "Action",
    year: "2023",
    language: "Hindi",
    languages: ["Hindi", "Tamil", "Telugu"],
    rating: 9.0,
    votes: "360K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D", "4DX"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=MWOlnZSnXWY"
  },
  {
    title: "Stree 2",
    description: "The folklore-haunted town of Chanderi is plagued by a menacing headless demon named Sarkata, calling upon the gang and Stree to unite.",
    duration: 149,
    poster: "https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg",
    genre: "Comedy",
    year: "2024",
    language: "Hindi",
    languages: ["Hindi"],
    rating: 8.8,
    votes: "290K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=KVnheGhaevA"
  },
  {
    title: "12th Fail",
    description: "Based on the true journey of Manoj Kumar Sharma, overcoming extreme poverty in Chambal to conquer the rigorous UPSC Civil Services examination.",
    duration: 147,
    poster: "https://image.tmdb.org/t/p/original/66A9MqXOyVFCssoloscw79z8Tew.jpg",
    genre: "Drama",
    year: "2023",
    language: "Hindi",
    languages: ["Hindi", "Tamil", "Telugu", "Kannada", "Malayalam"],
    rating: 9.6,
    votes: "210K",
    certificate: "U",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=we3X5yX_l5k"
  },
  {
    title: "Fighter",
    description: "Top Indian Air Force aviators come together in the face of imminent national threats, bonding as the elite Air Dragons squadron.",
    duration: 166,
    poster: "https://image.tmdb.org/t/p/original/zqFuriKJ6pYDvf72kXNLONnuE8k.jpg",
    genre: "Action",
    year: "2024",
    language: "Hindi",
    languages: ["Hindi", "Telugu"],
    rating: 8.7,
    votes: "160K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=6amIq_mP4xM"
  },

  // ── TAMIL (ORIGINAL THEATRICAL POSTERS) ───────────────────────────────────
  {
    title: "Leo",
    description: "Parthiban is a mild-mannered cafe owner and animal rescuer in Kashmir whose peaceful life unravels when ruthless drug kingpins mistake his identity.",
    duration: 164,
    poster: "https://image.tmdb.org/t/p/original/hUzeosd33nzE5MCNsZcCMLKDXaM.jpg",
    genre: "Action",
    year: "2023",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi", "Malayalam", "Kannada"],
    rating: 9.1,
    votes: "410K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=Po3jStA673E"
  },
  {
    title: "Jailer",
    description: "Muthuvel Pandian, a quiet retired prison warden living with family, returns to his lethal former ways when his police inspector son disappears.",
    duration: 168,
    poster: "https://image.tmdb.org/t/p/original/ownDZBS9ecoPbWjW5V5L8jknGF.jpg",
    genre: "Action",
    year: "2023",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi", "Kannada"],
    rating: 8.9,
    votes: "310K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=Y5BeWdODPqo"
  },
  {
    title: "Vikram",
    description: "A clandestine squad of masked vigilantes wages an uncompromising war against a drug syndicate led by an unhinged cartel boss named Sandhanam.",
    duration: 175,
    poster: "https://image.tmdb.org/t/p/original/774UV1aCURb4s4JfEFg3IEMu5Zj.jpg",
    genre: "Thriller",
    year: "2022",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi", "Malayalam"],
    rating: 9.3,
    votes: "340K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=OKBMCLzuvTW"
  },
  {
    title: "The Greatest of All Time (GOAT)",
    description: "An elite anti-terrorist agent who handled top secret global operations confronts a deadly clone operative from his own past.",
    duration: 179,
    poster: "https://image.tmdb.org/t/p/original/avhTPLXG3Gedvu5nc7nFt2eXTNy.jpg",
    genre: "Sci-Fi",
    year: "2024",
    language: "Tamil",
    languages: ["Tamil", "Telugu", "Hindi"],
    rating: 8.8,
    votes: "230K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=bC36d8e3vp0"
  },

  // ── TELUGU (ORIGINAL THEATRICAL POSTERS) ──────────────────────────────────
  {
    title: "RRR",
    description: "A fictionalized tale of two legendary Indian revolutionaries, Alluri Sitarama Raju and Komaram Bheem, joining forces against colonial British tyranny.",
    duration: 187,
    poster: "https://image.tmdb.org/t/p/original/z9YIo2qscyaXYgRqIdRJtND3bw8.jpg",
    genre: "Action",
    year: "2022",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada", "English"],
    rating: 9.5,
    votes: "540K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D", "Dolby Cinema"],
    releaseDate: "Blockbuster Special",
    trailerUrl: "https://www.youtube.com/watch?v=GY4BgdUSpbE"
  },
  {
    title: "Kalki 2898 AD",
    description: "Set in a post-apocalyptic dystopian Kasi, an ancient warrior Ashwatthama defends a divine child against the supreme ruler Supreme Yaskin.",
    duration: 181,
    poster: "https://image.tmdb.org/t/p/original/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
    genre: "Sci-Fi",
    year: "2024",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"],
    rating: 9.0,
    votes: "390K",
    certificate: "UA",
    formats: ["2D", "3D", "IMAX 3D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=kQDd1AhGIHk"
  },
  {
    title: "Pushpa: The Rule",
    description: "Pushpa Raj establishes undisputed dominion over the red sanders smuggling syndicate while engaging in a fierce psychological duel with SP Shekhawat.",
    duration: 175,
    poster: "https://image.tmdb.org/t/p/original/eUe5M3D0lLskjirOJ11R6xd7XB0.jpg",
    genre: "Action",
    year: "2024",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada"],
    rating: 9.2,
    votes: "430K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=1kVK0MZlbI4"
  },
  {
    title: "Salaar: Part 1 – Ceasefire",
    description: "In the lawless walled city-state of Khansaar, a hardened mercenary Deva rises to protect his childhood friend Varadha in a bloody throne battle.",
    duration: 175,
    poster: "https://image.tmdb.org/t/p/original/nlu9WbcetNFRGXXPWITr30ob7W6.jpg",
    genre: "Action",
    year: "2023",
    language: "Telugu",
    languages: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"],
    rating: 8.9,
    votes: "280K",
    certificate: "A",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=4GPvYMKtrtI"
  },

  // ── MALAYALAM (ORIGINAL THEATRICAL POSTERS) ───────────────────────────────
  {
    title: "Manjummel Boys",
    description: "Based on a real incident from 2006, a band of young friends from Kochi embark on an adventurous trip to Kodaikanal, where one slips into a perilous cave pit.",
    duration: 135,
    poster: "https://image.tmdb.org/t/p/original/awOxXBZHh3jvFEOLJvTaJOX5urU.jpg",
    genre: "Thriller",
    year: "2024",
    language: "Malayalam",
    languages: ["Malayalam", "Tamil", "Telugu", "Hindi"],
    rating: 9.3,
    votes: "210K",
    certificate: "U",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=1F3d1qgLgHk"
  },
  {
    title: "Aavesham",
    description: "Three engineering college students in Bengaluru encounter Ranga, an eccentric and unpredictable local don dressed in flamboyant white silk.",
    duration: 158,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/5d97c72b8340983c4a728c97973a2b91734013b880b3d67b130801b757747999._SX1080_FMjpg_.jpg",
    genre: "Comedy",
    year: "2024",
    language: "Malayalam",
    languages: ["Malayalam", "Hindi", "Tamil", "Telugu"],
    rating: 9.1,
    votes: "175K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=L0yEm3t81L8"
  },
  {
    title: "Premalu",
    description: "A charming, hilarious romantic comedy about Sachin, an unassuming Kerala youth in Hyderabad, who falls for Reenu, an independent IT professional.",
    duration: 156,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/24da6f641ca4930f576265047e41197ed4be9e7cdd2026abbf8ffde2c62c4738._SX1080_FMjpg_.jpg",
    genre: "Comedy",
    year: "2024",
    language: "Malayalam",
    languages: ["Malayalam", "Telugu", "Tamil"],
    rating: 8.9,
    votes: "130K",
    certificate: "U",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=r0bQ9aL7d_A"
  },
  {
    title: "Bramayugam",
    description: "Set in 17th-century Malabar, an escaped folk singer takes refuge in a decaying traditional manor inhabited by an enigmatic chieftain.",
    duration: 139,
    poster: "https://image.tmdb.org/t/p/original/3Y5pOfxMrG8SqbIcGhYy497eOXc.jpg",
    genre: "Horror",
    year: "2024",
    language: "Malayalam",
    languages: ["Malayalam", "Tamil", "Telugu", "Kannada", "Hindi"],
    rating: 9.0,
    votes: "105K",
    certificate: "A",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=68E6XjZ1u-g"
  },

  // ── KANNADA (ORIGINAL THEATRICAL POSTERS) ─────────────────────────────────
  {
    title: "KGF: Chapter 2",
    description: "The blood-soaked land of Kolar Gold Fields has a new overlord: Rocky. But deadly adversaries Adheera and Inayat Khalil conspire to wrest control.",
    duration: 168,
    poster: "https://image.tmdb.org/t/p/original/khNVygolU0TxLIDWff5tQlAhZ23.jpg",
    genre: "Action",
    year: "2022",
    language: "Kannada",
    languages: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    rating: 9.2,
    votes: "450K",
    certificate: "UA",
    formats: ["2D", "IMAX 2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=Qah9sSIXitI"
  },
  {
    title: "Kantara",
    description: "In the coastal forests of Karnataka, a fiery Kambala champion battles greed and an upright forest ranger amidst deep-rooted Bhoota Kola divine lore.",
    duration: 148,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/fdd27c502e7ba96d0a71892e476677bda52157d23a24b0d701e95767e9fcac24._SX1080_FMpng_.png",
    genre: "Thriller",
    year: "2022",
    language: "Kannada",
    languages: ["Kannada", "Hindi", "Telugu", "Tamil", "Malayalam"],
    rating: 9.3,
    votes: "340K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=8mrVmf239GU"
  },

  // ── MARATHI (ORIGINAL THEATRICAL POSTERS) ─────────────────────────────────
  {
    title: "Sairat",
    description: "A spirited, poignant love story between Parshya, a fisherman's bright son, and Archie, the self-willed daughter of a wealthy political landlord.",
    duration: 174,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/cb9d4b80440798a33de14e1d7f29e985eee8f9249c5d9d3a5afca7f1614f7a3e._SX1080_FMjpg_.jpg",
    genre: "Drama",
    year: "2016",
    language: "Marathi",
    languages: ["Marathi", "Hindi"],
    rating: 9.1,
    votes: "125K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Special Showcase",
    trailerUrl: "https://www.youtube.com/watch?v=wMr_Nq_x2c4"
  },

  // ── PUNJABI (ORIGINAL THEATRICAL POSTERS) ─────────────────────────────────
  {
    title: "Carry On Jatta 3",
    description: "Jass wishes to marry Meet, but her brothers have outlandish conditions that set off an uncontrollable comedy of errors and mistaken identities.",
    duration: 139,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/fa4fd7714e38a97bec0e55c1a635c1e40bcc06a12f86756bbda9319cd86f8670._SX1080_FMjpg_.jpg",
    genre: "Comedy",
    year: "2023",
    language: "Punjabi",
    languages: ["Punjabi"],
    rating: 8.6,
    votes: "95K",
    certificate: "U",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=84L9jX2Ym1I"
  },

  // ── BENGALI (ORIGINAL THEATRICAL POSTERS) ─────────────────────────────────
  {
    title: "Dawshom Awbotaar",
    description: "Two seasoned Kolkata police detectives team up to crack down on an intelligent, elusive serial killer executing crimes inspired by Dashavatara.",
    duration: 154,
    poster: "https://m.media-amazon.com/images/S/pv-target-images/709821e6d0802a98e1361a8d03cf470ba6217613c4a3695302cada4eca12251f._SX1080_FMjpg_.jpg",
    genre: "Thriller",
    year: "2023",
    language: "Bengali",
    languages: ["Bengali"],
    rating: 8.8,
    votes: "82K",
    certificate: "UA",
    formats: ["2D"],
    releaseDate: "Now Playing",
    trailerUrl: "https://www.youtube.com/watch?v=H7yV2p4mQ4E"
  }
];

const THEATRES_LIST = [
  "FlickTicket IMAX Grand, Screen 1",
  "PVR Select Citywalk, Delhi",
  "PVR Luxe Cinemas, Audi 3",
  "INOX Megaplex, Audi 2",
  "Cinepolis VIP Lounge"
];

const SHOWTIMES_LIST = ["10:00 AM", "01:30 PM", "05:00 PM", "08:30 PM", "11:45 PM"];

const generateStandardSeats = (balconyPrice, firstPrice, secondPrice) => {
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

/**
 * Ensures comprehensive movie catalog across all languages exists in DB
 */
async function seedAllMoviesAndShows() {
  try {
    console.log("🎬 Checking Movie database across all languages...");

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    for (const movieData of SEED_MOVIES) {
      // Upsert movie document
      const movie = await Movie.findOneAndUpdate(
        { title: movieData.title },
        { $set: movieData },
        { upsert: true, new: true }
      );

      // Check if shows exist for this movie
      const existingShowCount = await Show.countDocuments({ movieId: movie._id });
      if (existingShowCount === 0) {
        // Create 2 showtimes across top theatres
        const t1 = THEATRES_LIST[Math.floor(Math.random() * THEATRES_LIST.length)];
        const t2 = THEATRES_LIST[(THEATRES_LIST.indexOf(t1) + 1) % THEATRES_LIST.length];

        const show1Seats = generateStandardSeats(380, 260, 180);
        const show2Seats = generateStandardSeats(420, 290, 200);

        await Show.create([
          {
            movieId: movie._id,
            theatre: t1,
            screen: "Audi 1 - Dolby 7.1",
            date: todayStr,
            time: "05:00 PM",
            balconyPrice: 380,
            firstClassPrice: 260,
            secondClassPrice: 180,
            seats: show1Seats,
          },
          {
            movieId: movie._id,
            theatre: t2,
            screen: "Audi 2 - Laser IMAX",
            date: tomorrowStr,
            time: "08:30 PM",
            balconyPrice: 420,
            firstClassPrice: 290,
            secondClassPrice: 200,
            seats: show2Seats,
          }
        ]);
      }
    }

    const totalCount = await Movie.countDocuments();
    console.log(`✅ Movie Catalog Ready: ${totalCount} movies loaded with all languages.`);
  } catch (err) {
    console.error("Movie seeding error:", err);
  }
}

module.exports = { seedAllMoviesAndShows, SEED_MOVIES };
