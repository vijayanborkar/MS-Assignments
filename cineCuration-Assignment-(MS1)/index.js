const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  createCuratedList,
  updateCuratedList,
} = require("./controllers/curatedListController");
const { searchMovies } = require("./controllers/searchMovieController");
const { sequelize } = require("./models");

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.get("/api/movies/search", searchMovies);
app.post("/api/curated-lists", createCuratedList);
app.put("/api/curated-lists/:curatedListId", updateCuratedList);

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
