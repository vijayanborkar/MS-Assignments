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
      return `Tag ${tag} is too long. Maximum length is 20 characters.`;
    }
  }
  return null;
};

module.exports = {
  validateUsername,
  validateEmail,
  validateUniqueEmail,
  validateImageUrl,
  validateTags,
};