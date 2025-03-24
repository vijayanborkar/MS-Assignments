const { searchMovie, fetchMovieCredits } = require("../services/movieService");

const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchResults = await searchMovie(query);

    const movies = await Promise.all(
      searchResults.map(async (movie) => {
        try {
          const credits = await fetchMovieCredits(movie.id);

          const actors = credits
            .filter((person) => person.known_for_department === "Acting")
            .slice(0, 5)
            .map((actor) => actor.name)
            .join(", ");

          return {
            title: movie.title,
            tmdbId: movie.id,
            genre: movie.genre_ids.join(", "),
            actors,
            releaseYear: movie.release_date.split("-")[0],
            rating: movie.vote_average,
            description: movie.overview,
          };
        } catch (error) {
          console.error(
            `Error fetching credits for movie ID ${movie.id}:`,
            error.message
          );
          return null;
        }
      })
    );

    return res
      .status(200)
      .json({ movies: movies.filter((movie) => movie !== null) });
  } catch (error) {
    console.error("Error in searchMovies controller:", error.message);
    return res.status(500).json({ error: "Failed to search movies" });
  }
};

module.exports = { searchMovies };
