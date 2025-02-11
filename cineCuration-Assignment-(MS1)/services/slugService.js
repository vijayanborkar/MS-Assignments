const generateSlug = (name) => {
  const randomString = Math.random().toString(36).substring(2, 8); // Generates a random 6-character string
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end

  return `${slug}-${randomString}`; // Appends the random string to the slug
};

module.exports = { generateSlug };
