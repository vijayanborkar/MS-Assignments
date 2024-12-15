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
    const { tag, sortOrder } = req;

    const tagEntries = await tagModel.findAll({ where: { name: tag } });

    if (!Array.isArray(tagEntries) || tagEntries.length === 0) {
      return res.status(404).json({ message: "Tag not found." });
    }

    const photoIds = tagEntries.map((tagEntry) => tagEntry.photoId);

    const photos = await photoModel.findAll({
      where: { id: photoIds },
      order: [["dateSaved", sortOrder]],
    });

    const photoDetails = await Promise.all(
      photos.map(async (photo) => {
        const photoTags = await tagModel.findAll({
          where: { photoId: photo.id },
        });
        return {
          imageUrl: photo.imageUrl,
          description: photo.description,
          dateSaved: photo.dateSaved,
          tags: photoTags.map((tag) => tag.name),
        };
      })
    );

    res.status(200).json({ photos: photoDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to search photos by tag." });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    const searchHistory = await searchHistoryModel.findAll({
      where: { userId },
      attributes: ["query", "timestamp"],
      order: [["timestamp", "DESC"]],
    });

    res.status(200).json({ searchHistory });
  } catch (error) {
    console.log(error);
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
