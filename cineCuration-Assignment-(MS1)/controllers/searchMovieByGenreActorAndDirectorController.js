const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
} = require("../models");
const { Op } = require("sequelize"); // Sequelize Operators for filtering

const searchMovieByGenreActorAndDirector = async (req, res) => {
  const { genre, actor, director, listType } = req.query; // Extract genre, actor, director, and listType from query parameters

  try {
    // Validate input parameters
    if (!genre && !actor && !director && !listType) {
      return res
        .status(400)
        .json({ error: "At least one query parameter must be provided." });
    }

    const validListTypes = ["watchlist", "wishlist", "curatedList"];
    if (listType && !validListTypes.includes(listType)) {
      return res.status(400).json({ error: "Invalid listType parameter." });
    }

    if (genre && typeof genre !== "string") {
      return res.status(400).json({ error: "Invalid genre parameter." });
    }

    if (actor && typeof actor !== "string") {
      return res.status(400).json({ error: "Invalid actor parameter." });
    }

    if (director && typeof director !== "string") {
      return res.status(400).json({ error: "Invalid director parameter." });
    }

    // Initialize dynamic filter conditions
    const whereConditions = {};

    // Add filter by genre if provided
    if (genre) {
      whereConditions.genre = { [Op.iLike]: `%${genre.trim()}%` }; // Case-insensitive match
    }

    // Add filter by actor if provided
    if (actor) {
      whereConditions.actors = { [Op.iLike]: `%${actor.trim()}%` }; // Case-insensitive match
    }

    // Add filter by director if provided
    if (director) {
      whereConditions.director = { [Op.iLike]: `%${director.trim()}%` }; // Case-insensitive match
    }

    // Define the listType model dynamically
    let listModel;
    if (listType === "watchlist") listModel = watchlistModel;
    else if (listType === "wishlist") listModel = wishlistModel;
    else if (listType === "curatedList") listModel = curatedListItemModel;

    // Log conditions for debugging
    console.log("Where Conditions:", whereConditions);

    // Query movies along with the specified listType, if provided
    const movies = await movieModel.findAll({
      where: whereConditions,
      include: listModel
        ? [{ model: listModel, attributes: [], required: true }] // Include movies in the specified list only
        : [], // No list filter if listType is not provided
    });

    // Format the output
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      tmdbId: movie.tmdbId,
      genre: movie.genre,
      actors: movie.actors,
      director: movie.director, // Include director in the response
      releaseYear: movie.releaseYear,
      rating: movie.rating,
      description: movie.description,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    }));

    // Send the response with formatted movies
    res.status(200).json(
      formattedMovies.length > 0
        ? { movies: formattedMovies }
        : {
            movies: [],
            message: "No movies found matching the specified filters.",
          }
    );
  } catch (error) {
    console.error("Failed to search movies by genre, actor, and director:", {
      genre,
      actor,
      director,
      listType,
      error,
    });
    res.status(500).json({
      error: "An error occurred while searching for movies.",
    });
  }
};

module.exports = { searchMovieByGenreActorAndDirector };
