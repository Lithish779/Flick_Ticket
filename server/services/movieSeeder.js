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

  // ── 2026/2027 BLOCKBUSTER RELEASES (22 NEW MOVIES) ────────────────────
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
