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

const addTagsToPhoto = async (req, res) => {
  try {
    const { tags } = req.body;
    const photo = req.photo;

    for (const tagName of tags) {
      await tagModel.create({
        name: tagName,
        photoId: photo.id,
      });
    }

    res.status(200).json({
      message: "Tags added successfully",
      photo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add tags to photo." });
  }
};

const searchPhotosByTag = async (req, res) => {
  try {
    const { tags, sortOrder = "ASC", userId } = req.query;

    if (!tags) {
      return res.status(400).json({ error: "Tag parameter is required." });
    }

    const tagEntries = await tagModel.findAll({
      where: { name: tags },
    });

    if (!tagEntries.length) {
      return res.status(404).json({ error: "Tag not found." });
    }

    const photoId = tagEntries.map((tagEntry) => tagEntry.photoId);

    const photos = await photoModel.findAll({
      where: { id: photoId },
      order: [["dateSaved", sortOrder]],
    });

    const photoDetails = await Promise.all(
      photos.map(async (photo) => {
        const photoTags = await tagModel.findAll({
          where: { photoId: photo.id },
          attributes: ["name"],
        });

        return {
          imageUrl: photo.imageUrl,
          description: photo.description,
          dateSaved: photo.dateSaved,
          tags: photoTags.map((tag) => tag.name),
        };
      })
    );

    if (userId) {
      try {
        await searchHistoryModel.create({
          userId,
          query: tags,
          timestamp: new Date(),
        });
      } catch (historyError) {
        console.error("Error saving search history:", historyError);
      }
    }

    return res.status(200).json({
      photos: photoDetails,
      count: photoDetails.length,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to search photos by tag.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || isNaN(Number(userId))) {
      return res
        .status(400)
        .json({ message: "Invalid user ID. User ID must be a valid number." });
    }

    const searchHistory = await searchHistoryModel.findAll({
      where: { userId },
    });

    if (!Array.isArray(searchHistory) || searchHistory.length === 0) {
      return res.status(404).json({ message: "Search history not found." });
    }

    res.status(200).json({ searchHistory });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve search history." });
  }
};

module.exports = {
  createNewUser,
  getPhotosFromUnsplash,
  savePhoto,
  addTagsToPhoto,
  searchPhotosByTag,
  getSearchHistory,
};
