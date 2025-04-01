require("dotenv").config();
const axios = require("axios");

let cachedGenres = {}; // Cache for genre mappings
let lastFetchTime = 0; // To track the last fetch time
const CACHE_DURATION = 24 * 60 * 60 * 1000; // Cache duration (24 hours in milliseconds)

// Fetch genres dynamically from TMDB
const fetchGenresFromTMDB = async () => {
  try {
    const response = await axios.get(
      "https://api.themoviedb.org/3/genre/movie/list",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_Read_Access_Token}`,
        },
      }
    );

    if (!response.data.genres || response.data.genres.length === 0) {
      console.warn("TMDB API returned an empty genre list.");
      cachedGenres = {}; // Reset the cache if response is empty
    } else {
      cachedGenres = response.data.genres.reduce((map, genre) => {
        map[genre.id] = genre.name;
        return map;
      }, {});
      lastFetchTime = Date.now();
      // Log successful update only in development
      if (process.env.NODE_ENV === "development") {
        console.log("Genres updated successfully from TMDB.");
      }
    }
  } catch (error) {
    console.error("Failed to fetch genres from TMDB:", error.message);
    throw new Error(
      "Unable to fetch genres from TMDB. Check API key or network."
    );
  }
};

// Get genres from cache or fetch if expired
const getGenres = async () => {
  const now = Date.now();
  if (
    Object.keys(cachedGenres).length === 0 ||
    now - lastFetchTime > CACHE_DURATION
  ) {
    if (process.env.NODE_ENV === "development") {
      console.log("Genre cache expired or empty. Fetching genres from TMDB...");
    }
    await fetchGenresFromTMDB(); // Fetch if cache is empty or expired
  }
  return cachedGenres;
};

// Map genre IDs to genre names dynamically
const mapGenres = async (genreIds) => {
  if (!genreIds) {
    console.warn("Genre IDs are undefined or empty. Defaulting to 'Unknown'.");
    return "Unknown";
  }

  const genres = await getGenres();

  // Log only in development
  if (process.env.NODE_ENV === "development") {
    console.log("Mapping genre IDs to names:", genreIds);
  }

  // Ensure genreIds is processed as an array
  const genreIdArray = Array.isArray(genreIds)
    ? genreIds
    : genreIds.split(", ");
  const genreNames = genreIdArray.map((id) => genres[id] || "Unknown");

  return genreNames.join(", ");
};

module.exports = { fetchGenresFromTMDB, getGenres, mapGenres };
