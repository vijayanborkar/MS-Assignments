const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {
  validateNewUser,
  validateUnsplashRequest,
  validatePhotoData,
  validateAddTags,
} = require("./controller/userController");
const {
  createNewUser,
  getPhotosFromUnsplash,
  savePhoto,
  addTagsToPhoto,
} = require("./controller/dataController");
const { sequelize } = require("./models");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/api/users", validateNewUser, createNewUser);
app.get("/api/photos/search", validateUnsplashRequest, getPhotosFromUnsplash);
app.post("/api/photos", validatePhotoData, savePhoto);
app.post("/api/photos/:photoId/tags", validateAddTags, addTagsToPhoto);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database.", error);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
