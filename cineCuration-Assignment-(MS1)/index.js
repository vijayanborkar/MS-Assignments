const express = require("express");
const app = express();
require("dotenv").config();
const { sequelize } = require("./models");

const { searchMovies } = require("./controllers/movieController");

app.use(express.json());

// Routes
app.get("/api/movies/search", searchMovies);

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
