require("dotenv").config();
const axios = require("axios");
const { movie: movieModel } = require("../models");

const searchMovie = async (query) => {
  const url = `https://api.themoviedb.org/3/search/movie`;
  const apiKey = process.env.TMDB_API_KEY;

  try {
    const response = await axios.get(url, {
      params: { query: query },
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return response.data.results;
  } catch (error) {
    console.error("Error fetching data from TMDB API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw new Error("Error fetching data from TMDB API");
  }
};

const fetchMovieCredits = async (movieId) => {
  const url = `https://api.themoviedb.org/3/movie/${movieId}/credits`;
  const apiKey = process.env.TMDB_API_KEY;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    return response.data.cast;
  } catch (error) {
    console.error("Error fetching credits from TMDB API:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    throw new Error("Error fetching credits from TMDB API");
  }
};

const movieExistsInDB = async (tmdbId) => {
  const movie = await movieModel.find({ where: { tmdbId } });
  return !!movie;
};

const fetchMovieAndCastDetails = async (tmdbId) => {
  const apiKey = process.env.TMDB_API_KEY;

  const movieResponse = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`
  );

  const castResponse = await axios.get(
    `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${apiKey}`
  );

  const movieDetails = movieResponse.data;
  const castDetails = castResponse.data.cast.slice(0, 5);

  return {
    movieDetails,
    castDetails,
  };
};

module.exports = {
  searchMovie,
  fetchMovieCredits,
  movieExistsInDB,
  fetchMovieAndCastDetails,
};
