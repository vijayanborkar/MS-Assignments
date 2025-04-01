const {
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
  movie: movieModel,
} = require("../models");
const {
  movieExistsInDB,
  fetchMovieAndCastDetails,
} = require("../services/movieService");
const { mapGenres } = require("../services/genreService");

// Transform movie data fetched from TMDB
const transformMovieData = async (tmdbData) => {
  if (!tmdbData) {
    console.error("Error: tmdbData is undefined or null.");
    throw new Error("Invalid movie data provided for transformation.");
  }

  // Debugging logs for TMDB response
  console.log("TMDB Data Received:", tmdbData);

  // Debugging log for title and TMDB ID
  console.log("Title:", tmdbData.title || "Untitled");
  console.log("TMDB ID:", tmdbData.id || "null");

  // Debugging log for genres
  console.log("Genres from TMDB Response:", tmdbData.genres);
  const genreNames =
    tmdbData.genres && tmdbData.genres.length > 0
      ? tmdbData.genres.map((g) => g.name).join(", ")
      : null; // Use null if no genres are available

  // Debugging log for genre transformation
  console.log("Mapped Genres:", genreNames);

  // Debugging log for cast
  console.log("Cast from TMDB Response:", tmdbData.credits?.cast);
  const castNames =
    tmdbData.credits &&
    tmdbData.credits.cast &&
    tmdbData.credits.cast.length > 0
      ? tmdbData.credits.cast.map((c) => c.name).join(", ")
      : "Unknown";

  // Debugging log for release date
  console.log("Release Date from TMDB Response:", tmdbData.release_date);
  const releaseYear = tmdbData.release_date
    ? parseInt(tmdbData.release_date.split("-")[0])
    : null;

  // Debugging log for vote average
  console.log("Vote Average (Rating):", tmdbData.vote_average);

  // Debugging log for description
  console.log("Overview (Description):", tmdbData.overview);

  return {
    title: tmdbData.title || "Untitled", // Default title if missing
    tmdbId: tmdbData.id || null, // Map TMDB ID
    genre: genreNames, // Use mapped genres
    actors: castNames, // Use transformed cast names
    releaseYear: releaseYear, // Extract release year
    rating: tmdbData.vote_average || null, // Map rating
    description: tmdbData.overview || "No description available.", // Default description if missing
  };
};

// Add to Watchlist
const addToWatchlist = async (req, res) => {
  const { movieId } = req.body;

  try {
    const existingMovie = await movieExistsInDB(movieId);
    let movieDatabaseId;

    if (!existingMovie) {
      const tmdbMovieData = await fetchMovieAndCastDetails(movieId);

      if (!tmdbMovieData || !tmdbMovieData.movieDetails) {
        return res
          .status(500)
          .json({ error: "Failed to fetch movie details from TMDB." });
      }

      const transformedMovieData = await transformMovieData(
        tmdbMovieData.movieDetails
      );

      // Validate transformed data
      if (!transformedMovieData.tmdbId || !transformedMovieData.title) {
        return res
          .status(500)
          .json({ error: "Missing required movie data (tmdbId or title)." });
      }

      console.log(
        "Data Passed to movieModel.create (Watchlist):",
        transformedMovieData
      );

      const createdMovie = await movieModel.create({
        tmdbId: transformedMovieData.tmdbId,
        title: transformedMovieData.title,
        genre: transformedMovieData.genre, // Updated field name
        actors: transformedMovieData.actors,
        releaseYear: transformedMovieData.releaseYear,
        rating: transformedMovieData.rating,
        description: transformedMovieData.description,
      });

      movieDatabaseId = createdMovie.id;
    } else {
      movieDatabaseId = existingMovie.id;
    }

    const existingWatchlistEntry = await watchlistModel.findOne({
      where: { movieId: movieDatabaseId },
    });

    if (existingWatchlistEntry) {
      return res
        .status(400)
        .json({ message: "Movie is already in the watchlist." });
    }

    await watchlistModel.create({ movieId: movieDatabaseId });
    res.status(200).json({ message: "Movie added to watchlist successfully." });
  } catch (error) {
    console.error("Failed to add movie to watchlist:", error.message);
    res.status(500).json({ error: "Failed to add movie to watchlist." });
  }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
  const { movieId } = req.body;

  try {
    const existingMovie = await movieExistsInDB(movieId);
    let movieDatabaseId;

    if (!existingMovie) {
      const tmdbMovieData = await fetchMovieAndCastDetails(movieId);
      const transformedMovieData = await transformMovieData(tmdbMovieData);

      console.log(
        "Data Passed to movieModel.create (Wishlist):",
        transformedMovieData
      );

      const createdMovie = await movieModel.create({
        tmdbId: transformedMovieData.tmdbId,
        title: transformedMovieData.title,
        genre: transformedMovieData.genre, // Updated field name
        actors: transformedMovieData.actors,
        releaseYear: transformedMovieData.releaseYear,
        rating: transformedMovieData.rating,
        description: transformedMovieData.description,
      });

      movieDatabaseId = createdMovie.id;
    } else {
      movieDatabaseId = existingMovie.id;
    }

    const existingWishlistEntry = await wishlistModel.findOne({
      where: { movieId: movieDatabaseId },
    });

    if (existingWishlistEntry) {
      return res
        .status(400)
        .json({ message: "Movie is already in the wishlist." });
    }

    await wishlistModel.create({ movieId: movieDatabaseId });
    res.status(200).json({ message: "Movie added to wishlist successfully." });
  } catch (error) {
    console.error("Failed to add movie to wishlist:", error);
    res.status(500).json({ error: "Failed to add movie to wishlist." });
  }
};

// Add to Curated List
const addToCuratedList = async (req, res) => {
  const { movieId, curatedListId } = req.body;

  try {
    const existingMovie = await movieExistsInDB(movieId);
    let movieDatabaseId;

    if (!existingMovie) {
      const tmdbMovieData = await fetchMovieAndCastDetails(movieId);
      const transformedMovieData = await transformMovieData(tmdbMovieData);

      console.log(
        "Data Passed to movieModel.create (Curated List):",
        transformedMovieData
      );

      const createdMovie = await movieModel.create({
        tmdbId: transformedMovieData.tmdbId,
        title: transformedMovieData.title,
        genre: transformedMovieData.genre, // Updated field name
        actors: transformedMovieData.actors,
        releaseYear: transformedMovieData.releaseYear,
        rating: transformedMovieData.rating,
        description: transformedMovieData.description,
      });

      movieDatabaseId = createdMovie.id;
    } else {
      movieDatabaseId = existingMovie.id;
    }

    const existingCuratedListItem = await curatedListItemModel.findOne({
      where: { movieId: movieDatabaseId, curatedListId },
    });

    if (existingCuratedListItem) {
      return res
        .status(400)
        .json({ message: "Movie is already in the curated list." });
    }

    await curatedListItemModel.create({
      movieId: movieDatabaseId,
      curatedListId,
    });
    res
      .status(200)
      .json({ message: "Movie added to curated list successfully." });
  } catch (error) {
    console.error("Failed to add movie to curated list:", error);
    res.status(500).json({ error: "Failed to add movie to curated list." });
  }
};

module.exports = {
  addToWatchlist,
  addToWishlist,
  addToCuratedList,
};
