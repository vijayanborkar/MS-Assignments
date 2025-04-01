const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
} = require("../models");
const { Op } = require("sequelize"); // Sequelize Operators for filtering

const sortMovies = async (req, res) => {
  const { list, sortBy, order = "ASC" } = req.query; // Extract list, sortBy, and order from query parameters

  try {
    // Validate input parameters
    if (!list || !["watchlist", "wishlist", "curatedList"].includes(list)) {
      return res.status(400).json({
        error:
          "Invalid list parameter. Allowed values: watchlist, wishlist, curatedList.",
      });
    }

    if (!sortBy || !["rating", "releaseYear"].includes(sortBy)) {
      return res.status(400).json({
        error: "Invalid sortBy parameter. Allowed values: rating, releaseYear.",
      });
    }

    if (!["ASC", "DESC"].includes(order)) {
      return res.status(400).json({
        error: "Invalid order parameter. Allowed values: ASC, DESC.",
      });
    }

    // Define the listType model dynamically
    let listModel;
    if (list === "watchlist") listModel = watchlistModel;
    else if (list === "wishlist") listModel = wishlistModel;
    else if (list === "curatedList") listModel = curatedListItemModel;

    // Query movies with sorting
    const movies = await movieModel.findAll({
      include: [
        {
          model: listModel,
          attributes: [], // We only care about movie data, not the list data
          required: true, // Ensure the movie is part of the specified list
        },
      ],
      order: [[sortBy, order]], // Dynamic sorting based on sortBy and order
    });

    // Format the output
    const formattedMovies = movies.map((movie) => ({
      title: movie.title,
      tmdbId: movie.tmdbId,
      genre: movie.genre,
      actors: movie.actors,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
    }));

    // Send the response
    res.status(200).json({ movies: formattedMovies });
  } catch (error) {
    console.error("Failed to sort movies:", { list, sortBy, order, error });
    res.status(500).json({
      error: "An error occurred while sorting the movies.",
    });
  }
};

module.exports = { sortMovies };
