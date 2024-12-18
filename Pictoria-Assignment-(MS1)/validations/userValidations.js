function validateUsername(username) {
  if (!username) {
    return "Username is required.";
  }
  return null;
}

function validateEmail(email) {
  if (!email) {
    return "Email is required.";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return "Invalid email format.";
  }
  return null;
}

async function validateUniqueEmail(userModel, email) {
  const existingUser = await userModel.findOne({ where: { email } });
  if (existingUser) {
    return "Email already exists.";
  }
  return null;
}

const validateImageUrl = (imageUrl) => {
  const isValid = imageUrl.startsWith("https://images.unsplash.com/");
  return isValid ? null : "Invalid image URL.";
};

const validateTags = (tags) => {
  if (tags.length > 5) {
    return "Too many tags. Maximum is 5.";
  }
  for (const tag of tags) {
    if (tag.length > 20) {
      return `Tag "${tag}" is too long. Maximum length is 20 characters.`;
    }
  }
  return null;
};

const validateTagsArray = (tags) => {
  if (!Array.isArray(tags)) {
    return "Tags must be an array.";
  }

  for (const tag of tags) {
    if (typeof tag !== "string" || tag.trim() === "") {
      return "Tags must be non-empty strings.";
    }
  }

  return null;
};

const validateTagCount = (existingTags, newTags) => {
  if (!Array.isArray(existingTags) || !Array.isArray(newTags)) {
    return "Tags must be arrays.";
  }

  if (existingTags.length + newTags.length > 5) {
    return "A photo can have no more than 5 tags in total.";
  }

  return null;
};

const validateSortOrder = (sort) => {
  const validSortOrders = ["ASC", "DESC"];
  if (!validSortOrders.includes(sort)) {
    return "Invalid sort order. Must be 'ASC' or 'DESC'.";
  }
  return null;
};

const validateSingleTag = (tag) => {
  if (typeof tag !== "string" || tag.trim() === "") {
    return "Invalid tag. Tag must be a non-empty string.";
  }
  return null;
};

const validateUserId = (userId) => {
  if (!userId || isNaN(userId)) {
    return "Invalid user ID. User ID must be a valid number.";
  }
  return null;
};

module.exports = {
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
};
