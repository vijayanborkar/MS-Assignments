const { unsplashApi } = require("../lib/unsplashApi.js");

async function searchImages(query) {
  try {
    const response = await unsplashApi.get("/search/photos", {
      params: { query },
    });

    const photos = response.data.results.map((photo) => ({
      imageUrl: photo.urls.small,
      description: photo.description,
      altDescription: photo.alt_description,
    }));

    if (photos.length === 0) {
      return { message: "No images found for the given query." };
    }

    return { photos };
  } catch (error) {
    console.error("Error fetching images from Unsplash:", error);
    throw new Error("Failed to fetch images from Unsplash.");
  }
}

module.exports = {
  searchImages,
};
