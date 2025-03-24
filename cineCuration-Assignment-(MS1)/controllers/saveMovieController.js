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
    // Check if the movie exists in the database
    const existingMovie = await movieModel.findOne({
      where: { tmdbId: movieId },
    });

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

      // Use the `id` of the newly created movie
      await watchlistModel.create({ movieId: createdMovie.id });
    } else {
      // Use the `id` of the existing movie
      await watchlistModel.create({ movieId: existingMovie.id });
    }

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
    if (!(await movieExistsInDB(movieId))) {
      const movieDetails = await fetchMovieAndCastDetails(movieId);
      await movieModel.create({
        tmdbId: movieDetails.tmdbId,
        title: movieDetails.title,
        genres: movieDetails.genres,
        actors: movieDetails.actors,
        releaseYear: new Date(movieDetails.releaseDate).getFullYear(),
        rating: movieDetails.rating,
        description: movieDetails.overview,
      });
    }

    await wishlistModel.create({ movieId });
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
    if (!(await movieExistsInDB(movieId))) {
      const movieDetails = await fetchMovieAndCastDetails(movieId);
      await movieModel.create({
        tmdbId: movieDetails.tmdbId,
        title: movieDetails.title,
        genres: movieDetails.genres,
        actors: movieDetails.actors,
        releaseYear: new Date(movieDetails.releaseDate).getFullYear(),
        rating: movieDetails.rating,
        description: movieDetails.overview,
      });
    }

    await curatedListItemModel.create({ movieId, curatedListId });
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
