const { movie: movieModel, review: reviewModel } = require("../models");
const { Op } = require("sequelize");

const getTop5Movies = async (req, res) => {
  try {
    const topMovies = await movieModel.findAll({
      attributes: ["title", "rating"], // Fetch title and rating
      order: [["rating", "DESC"]], // Sort by rating in descending order
      limit: 5, // Limit results to top 5 movies
      where: { rating: { [Op.ne]: null } }, // Exclude movies with null ratings
      include: [
        {
          model: reviewModel, // Include associated reviews
          attributes: ["reviewText"], // Fetch review text
          limit: 1, // Include only the first review per movie
        },
      ],
    });

    const movies = topMovies.map((movie) => {
      const reviewText =
        Array.isArray(movie.reviews) &&
        movie.reviews.length > 0 &&
        movie.reviews[0].reviewText.trim() !== ""
          ? movie.reviews[0].reviewText
          : "No review available."; // Default review text for empty or missing reviews

      const wordCount = reviewText
        .trim()
        .replace(/[^\w\s]/g, "") // Remove punctuation
        .split(/\s+/) // Split by one or more spaces
        .filter((word) => word.trim() !== "").length;

      return {
        title: movie.title,
        rating: movie.rating,
        review: {
          text: reviewText,
          wordCount: wordCount,
        },
      };
    });

    res.status(200).json({ movies });
  } catch (error) {
    console.error("Failed to fetch top 5 movies:", error.message);
    res.status(500).json({ error: "Failed to fetch top 5 movies." });
  }
};

module.exports = { getTop5Movies };
