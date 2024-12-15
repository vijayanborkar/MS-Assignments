const {
  validateUsername,
  validateEmail,
  validateUniqueEmail,
  validateImageUrl,
  validateTags,
  validateTagsArray,
  validateTagCount,
  validateSortOrder,
  validateSingleTag,
  validateUserId,
} = require("../validations/userValidations.js");
const {
  user: userModel,
  photo: photoModel,
  tag: tagModel,
  searchHistory: searchHistoryModel,
} = require("../models");
const { doesUserExist } = require("../services/userService.js");

const validateNewUser = async (req, res, next) => {
  const { username, email } = req.body;

  const usernameError = validateUsername(username);
  const emailError = validateEmail(email);
  const uniqueEmailError = await validateUniqueEmail(userModel, email);

  if (usernameError || emailError || uniqueEmailError) {
    return res.status(400).json({
      errors: [usernameError, emailError, uniqueEmailError].filter(Boolean),
    });
  }

  const emailExists = await doesUserExist(email);
  if (emailExists) {
    return res.status(400).json({
      error: "Email already exists.",
    });
  }

  next();
};

const validateUnsplashRequest = (req, res, next) => {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required." });
  }

  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({
      error: "Unsplash API key is missing. Please configure the .env file.",
    });
  }

  next();
};

const validatePhotoData = (req, res, next) => {
  const { imageUrl, tags } = req.body;

  const imageUrlError = validateImageUrl(imageUrl);
  if (imageUrlError) {
    return res.status(400).json({ message: imageUrlError });
  }

  const tagsError = validateTags(tags);
  if (tagsError) {
    return res.status(400).json({ message: tagsError });
  }

  next();
};

const validateAddTags = async (req, res, next) => {
  const { tags } = req.body;

  const tagsArrayError = validateTagsArray(tags);
  if (tagsArrayError) {
    return res.status(400).json({ message: tagsArrayError });
  }

  const photoId = req.params.photoId;
  const photo = await photoModel.findByPk(photoId);

  if (!photo) {
    return res.status(404).json({ message: "Photo not found." });
  }

  const existingTags = await tagModel.findAll({ where: { photoId } });
  const tagCountError = validateTagCount(existingTags, tags);
  if (tagCountError) {
    return res.status(400).json({ message: tagCountError });
  }

  req.photo = photo;
  req.existingTags = existingTags;
  next();
};

const validateSearch = async (req, res, next) => {
  const { tags, sort, userId } = req.query;

  const tagError = validateSingleTag(tags);
  if (tagError) {
    return res.status(400).json({ message: tagError });
  }

  const sortOrder = sort || "ASC";
  const sortOrderError = validateSortOrder(sortOrder);
  if (sortOrderError) {
    return res.status(400).json({ message: sortOrderError });
  }

  const tagExists = await tagModel.findOne({ where: { name: tags } });
  if (!tagExists) {
    return res.status(404).json({ message: "Tag not found." });
  }

  if (userId) {
    const existingHistory = await searchHistoryModel.findOne({
      where: { userId, query: tags },
    });

    if (!existingHistory) {
      await searchHistoryModel.create({
        userId,
        query: tags,
        timestamp: new Date(),
      });
    }
  }

  req.sortOrder = sortOrder;
  req.tag = tags;
  next();
};

const validateUserIdQuery = async (req, res, next) => {
  const { userId } = req.query;

  const userIdError = validateUserId(userId);
  if (userIdError) {
    return res.status(400).json({ message: userIdError });
  }

  next();
};

module.exports = {
  validateNewUser,
  validateUnsplashRequest,
  validatePhotoData,
  validateAddTags,
  validateSearch,
  validateUserIdQuery,
};
