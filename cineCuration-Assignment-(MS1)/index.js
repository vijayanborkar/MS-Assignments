const express = require("express");
const app = express();
require("dotenv").config();
const { sequelize } = require("./models");

// Import Controllers
const { searchMovies } = require("./controllers/searchMovieController");
const {
  createCuratedList,
  updateCuratedList,
} = require("./controllers/curatedListController");

app.use(express.json());

// Routes
app.get("/api/movies/search", searchMovies);
app.post("/api/curated-lists", createCuratedList);
app.put("/api/curated-list/:curatedListId", updateCuratedList);

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
