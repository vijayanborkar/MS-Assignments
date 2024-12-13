const axios = require("axios");

const unsplashApi = axios.create({
  baseURL: "https://api.unsplash.com",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
  },
});

module.exports = { unsplashApi };
