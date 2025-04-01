const { review: reviewModel } = require("../models");
const { movieExistsInDB } = require("../services/movieService"); // Import the movieExistsInDB function

const addReview = async (req, res) => {
  const { movieId } = req.params;
  const { rating, reviewText } = req.body;

  try {
    // Check if the movie exists using movieExistsInDB
    const existingMovie = await movieExistsInDB(movieId);
    if (!existingMovie) {
      return res.status(404).json({ error: "Movie not found." });
    }

    // Validate rating
    if (typeof rating !== "number" || rating < 0 || rating > 10) {
      return res.status(400).json({
        error: "Rating must be between 0 and 10 and should be a number.",
      });
    }

    // Validate review text
    if (typeof reviewText !== "string" || reviewText.length > 500) {
      return res
        .status(400)
        .json({ error: "Review text must not exceed 500 characters." });
    }

    // Add review to the database
    await reviewModel.create({ movieId: existingMovie.id, rating, reviewText });

    // Return success response
    res.status(200).json({ message: "Review added successfully." });
  } catch (error) {
    console.error("Failed to add review:", error);
    res
      .status(500)
      .json({ error: "Failed to add review due to an internal server error." });
  }
};

module.exports = { addReview };
