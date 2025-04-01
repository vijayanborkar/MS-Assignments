const { movie: movieModel, review: reviewModel } = require("../models");
const { Op } = require("sequelize");

/**
 * Fetch Top 5 Movies by Rating with Detailed Reviews
 */
const getTop5Movies = async (req, res) => {
  try {
    // Query to fetch top 5 movies by rating, excluding those with null ratings
    const topMovies = await movieModel.findAll({
      attributes: ["title", "rating"], // Fetch title and rating
      order: [["rating", "DESC"]], // Sort by rating in descending order
      limit: 5, // Limit results to top 5 movies
      where: {
        rating: { [Op.ne]: null }, // Exclude movies with null ratings
      },
      include: [
        {
          model: reviewModel, // Include associated reviews
          attributes: ["reviewText"], // Fetch review text
          limit: 1, // Include only the first review per movie
        },
      ],
    });

    // Process results to calculate word count for each review
    const movies = topMovies.map((movie) => {
      const reviewText = movie.reviews[0]?.reviewText || "No review available."; // Default review text
      const wordCount = reviewText
        .split(" ")
        .filter((word) => word.trim() !== "").length; // Calculate word count

      return {
        title: movie.title,
        rating: movie.rating,
        review: {
          text: reviewText,
          wordCount: wordCount,
        },
      };
    });

    // Return the processed movies
    res.status(200).json({ movies });
  } catch (error) {
    console.error("Failed to fetch top 5 movies:", error.message);
    res.status(500).json({ error: "Failed to fetch top 5 movies." });
  }
};

module.exports = { getTop5Movies };
