const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
} = require("../models");
const { Op } = require("sequelize");

const searchMovieByGenreActorAndDirector = async (req, res) => {
  const { genre, actor, director, listType } = req.query;

  try {
    // Explicitly check for empty parameters
    if (genre === "") {
      return res.status(400).json({
        error: "Invalid genre parameter. Genre must be a non-empty string.",
      });
    }
    if (actor === "") {
      return res.status(400).json({
        error: "Invalid actor parameter. Actor must be a non-empty string.",
      });
    }
    if (director === "") {
      return res.status(400).json({
        error:
          "Invalid director parameter. Director must be a non-empty string.",
      });
    }

    // Validate input parameters
    if (!genre && !actor && !director && !listType) {
      return res
        .status(400)
        .json({ error: "At least one query parameter must be provided." });
    }

    const validListTypes = ["watchlist", "wishlist", "curatedList"];
    if (listType && !validListTypes.includes(listType)) {
      return res.status(400).json({
        error: `Invalid listType parameter. Valid options are: ${validListTypes.join(
          ", "
        )}.`,
      });
    }

    // Initialize dynamic filter conditions for movies
    const whereConditions = {};
    if (genre) whereConditions.genre = { [Op.iLike]: `%${genre.trim()}%` }; // Case-insensitive match
    if (actor) whereConditions.actors = { [Op.iLike]: `%${actor.trim()}%` };
    if (director)
      whereConditions.director = { [Op.iLike]: `%${director.trim()}%` };

    // Determine the listType model dynamically
    let listModel = null;
    if (listType === "watchlist") listModel = watchlistModel;
    else if (listType === "wishlist") listModel = wishlistModel;
    else if (listType === "curatedList") listModel = curatedListItemModel;

    // Query movies with conditions and optional listType filter
    const movies = await movieModel.findAll({
      where: whereConditions,
      include: listModel
        ? [{ model: listModel, attributes: [], required: true }]
        : [],
    });

    // Format the output for movies
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      tmdbId: movie.tmdbId,
      genre: movie.genre,
      actors: movie.actors,
      director: movie.director,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      description: movie.description,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    }));

    // Return formatted movies or an empty result message
    if (formattedMovies.length > 0) {
      return res.status(200).json({ movies: formattedMovies });
    } else {
      return res.status(200).json({
        movies: [],
        message: "No movies found matching the specified filters.",
      });
    }
  } catch (error) {
    console.error("Failed to search movies by genre, actor, and director:", {
      genre,
      actor,
      director,
      listType,
      error,
    });
    return res.status(500).json({
      error: "An error occurred while searching for movies.",
    });
  }
};

module.exports = { searchMovieByGenreActorAndDirector };
