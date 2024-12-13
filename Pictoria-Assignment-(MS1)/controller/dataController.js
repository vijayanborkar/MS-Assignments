const {
  photo: photoModel,
  searchHistory: searchHistoryModel,
  tag: tagModel,
  user: userModel,
} = require("../models");
const { searchImages } = require("../services/unsplashService");

const createNewUser = async (req, res) => {
  try {
    const { username, email } = req.body;

    const newUser = await userModel.create({ username, email });
    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create new user." });
  }
};

const getPhotosFromUnsplash = async (req, res) => {
  try {
    const result = await searchImages(req.query.query);

    if (result.message) {
      return res.status(200).json({ message: result.message });
    }

    res.status(200).json(result);
  } catch (error) {
    console.log("Error fetching images from Unsplash:", error);
    res.status(500).json({ error: "Failed to fetch images from Unsplash." });
  }
};

const savePhoto = async (req, res) => {
  try {
    const { imageUrl, description, altDescription, tags, userId } = req.body;

    const newPhoto = await photoModel.create({
      imageUrl,
      description,
      altDescription,
      tags,
      userId,
    });

    for (const tagName of tags) {
      await tagModel.create({
        name: tagName,
        photoId: newPhoto.id,
      });
    }
    res.status(201).json({
      message: "Photo saved successfully",
      photo: newPhoto,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to save photo." });
  }
};

module.exports = {
  createNewUser,
  getPhotosFromUnsplash,
  savePhoto,
};
