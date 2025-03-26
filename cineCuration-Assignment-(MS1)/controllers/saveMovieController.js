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

// Add to Watchlist
const addToWatchlist = async (req, res) => {
  const { movieId } = req.body;

  try {
    // Check if the movie exists in the database using movieExistsInDB
    const existingMovie = await movieExistsInDB(movieId);

    let movieDatabaseId;

    if (!existingMovie) {
      // Fetch and save the movie if it doesn't exist
      const { movieDetails, castDetails } = await fetchMovieAndCastDetails(
        movieId
      );
      const createdMovie = await movieModel.create({
        tmdbId: movieDetails.id,
        title: movieDetails.title,
        genres: movieDetails.genres.map((g) => g.name).join(", "),
        actors: castDetails.map((c) => c.name).join(", "),
      });
      movieDatabaseId = createdMovie.id;
    } else {
      movieDatabaseId = existingMovie.id;
    }

    // Check if the movie is already in the watchlist
    const existingWatchlistEntry = await watchlistModel.findOne({
      where: { movieId: movieDatabaseId },
    });

    if (existingWatchlistEntry) {
      return res
        .status(400)
        .json({ message: "Movie is already in the watchlist." });
    }

    // Add the movie to the watchlist
    await watchlistModel.create({ movieId: movieDatabaseId });

    res.status(200).json({ message: "Movie added to watchlist successfully." });
  } catch (error) {
    console.error("Failed to add movie to watchlist:", error);
    res.status(500).json({ error: "Failed to add movie to watchlist." });
  }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
  const { movieId } = req.body;

  try {
    // Check if the movie exists in the database using movieExistsInDB
    const existingMovie = await movieExistsInDB(movieId);

    let movieDatabaseId;

    if (!existingMovie) {
      const { movieDetails, castDetails } = await fetchMovieAndCastDetails(
        movieId
      );
      const createdMovie = await movieModel.create({
        tmdbId: movieDetails.id,
        title: movieDetails.title,
        genres: movieDetails.genres.map((g) => g.name).join(", "),
        actors: castDetails.map((c) => c.name).join(", "),
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
    // Check if the movie exists in the database using movieExistsInDB
    const existingMovie = await movieExistsInDB(movieId);

    let movieDatabaseId;

    if (!existingMovie) {
      const { movieDetails, castDetails } = await fetchMovieAndCastDetails(
        movieId
      );
      const createdMovie = await movieModel.create({
        tmdbId: movieDetails.id,
        title: movieDetails.title,
        genres: movieDetails.genres.map((g) => g.name).join(", "),
        actors: castDetails.map((c) => c.name).join(", "),
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
