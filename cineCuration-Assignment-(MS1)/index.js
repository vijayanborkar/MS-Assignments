const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  createCuratedList,
  updateCuratedList,
} = require("./controllers/curatedListController");
const { searchMovies } = require("./controllers/searchMovieController");
const {
  addToWatchlist,
  addToWishlist,
  addToCuratedList,
} = require("./controllers/saveMovieController");
const { addReview } = require("./controllers/reviewController");
const {
  searchMovieByGenreActorAndDirector,
} = require("./controllers/searchMovieByGenreActorAndDirectorController");
const {
  sortMovies,
} = require("./controllers/sortByRatingOrReleaseyearController");
const { getTop5Movies } = require("./controllers/topMoviesController");
const { sequelize } = require("./models");

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.get("/api/movies/search", searchMovies);
app.post("/api/curated-lists", createCuratedList);
app.put("/api/curated-lists/:curatedListId", updateCuratedList);
app.post("/api/movies/watchlist", addToWatchlist);
app.post("/api/movies/wishlist", addToWishlist);
app.post("/api/movies/curated-list", addToCuratedList);
app.post("/api/movies/:movieId/reviews", addReview);
app.get(
  "/api/movies/searchByGenreAndActor",
  searchMovieByGenreActorAndDirector
);
app.get("/api/movies/sort", sortMovies);
app.get("/api/movies/top5", getTop5Movies);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database.", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
