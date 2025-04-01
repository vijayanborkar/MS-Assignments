require("dotenv").config();
const axios = require("axios");
const { movie: movieModel } = require("../models");

const searchMovie = async (query) => {
  const url = `https://api.themoviedb.org/3/search/movie`;
  const apiKey = process.env.TMDB_API_Read_Access_Token;

  try {
    const response = await axios.get(url, {
      params: { query: query },
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return response.data.results;
  } catch (error) {
    console.error("Error fetching data from TMDB API:", error.message);
    throw new Error("Error fetching data from TMDB API");
  }
};

const fetchMovieCredits = async (movieId) => {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits`;
  const apiKey = process.env.TMDB_API_Read_Access_Token;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return response.data.cast;
  } catch (error) {
    console.error("Error fetching credits from TMDB API:", error.message);
    throw new Error("Error fetching credits from TMDB API");
  }
};

const movieExistsInDB = async (tmdbId) => {
  try {
    const movie = await movieModel.findOne({ where: { tmdbId } });
    return movie; // Return the movie object if it exists, or null if not
  } catch (error) {
    console.error("Error while checking if movie exists in DB:", error.message);
    throw new Error("Database query failed.");
  }
};

const fetchMovieAndCastDetails = async (movieId) => {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_Read_Access_Token}`,
      },
    });

    return {
      movieDetails: response.data,
      castDetails: response.data.credits.cast,
    };
  } catch (error) {
    console.error("Failed to fetch movie details from TMDB:", error.message);
    return null; // Return null to handle errors gracefully
  }
};

module.exports = {
  searchMovie,
  fetchMovieCredits,
  movieExistsInDB,
  fetchMovieAndCastDetails,
};
