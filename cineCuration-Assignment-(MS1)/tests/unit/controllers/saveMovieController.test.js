const {
  addToWatchlist,
  addToWishlist,
  addToCuratedList,
} = require("../../../controllers/saveMovieController");
const {
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
  movie: movieModel,
} = require("../../../models");
const {
  movieExistsInDB,
  fetchMovieAndCastDetails,
} = require("../../../services/movieService");
const request = require("supertest");
const express = require("express");
jest.mock("../../../models");
jest.mock("../../../services/movieService");

const app = express();
app.use(express.json());
app.post("/api/watchlist", addToWatchlist);
app.post("/api/wishlist", addToWishlist);
app.post("/api/curated-list", addToCuratedList);

describe("MovieListController", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("addToWatchlist", () => {
    test("should return 500 if movie details cannot be fetched", async () => {
      fetchMovieAndCastDetails.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/watchlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to fetch movie details from TMDB.",
      });
    });

    test("should return 400 if the movie is already in the watchlist", async () => {
      movieExistsInDB.mockResolvedValue({ id: 1 });
      watchlistModel.findOne.mockResolvedValue({ movieId: 1 });

      const response = await request(app)
        .post("/api/watchlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Movie is already in the watchlist.",
      });
    });

    test("should return 200 if the movie is successfully added to the watchlist", async () => {
      movieExistsInDB.mockResolvedValue(null);
      fetchMovieAndCastDetails.mockResolvedValue({
        movieDetails: {
          id: 123,
          title: "Inception",
          genres: [{ name: "Action" }, { name: "Sci-Fi" }],
          credits: { cast: [{ name: "Leonardo DiCaprio" }] },
          release_date: "2010-07-16",
          vote_average: 8.8,
          overview: "A mind-bending thriller.",
        },
      });
      movieModel.create.mockResolvedValue({ id: 1 });
      watchlistModel.findOne.mockResolvedValue(null);
      watchlistModel.create.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/watchlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Movie added to watchlist successfully.",
      });
    });

    test("should return 500 if an error occurs while adding to the watchlist", async () => {
      movieExistsInDB.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/watchlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to add movie to watchlist.",
      });
    });
  });

  describe("addToWishlist", () => {
    test("should return 400 if the movie is already in the wishlist", async () => {
      movieExistsInDB.mockResolvedValue({ id: 1 });
      wishlistModel.findOne.mockResolvedValue({ movieId: 1 });

      const response = await request(app)
        .post("/api/wishlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Movie is already in the wishlist.",
      });
    });

    test("should return 200 if the movie is successfully added to the wishlist", async () => {
      movieExistsInDB.mockResolvedValue(null);
      fetchMovieAndCastDetails.mockResolvedValue({
        movieDetails: {
          id: 123,
          title: "Inception",
          genres: [{ name: "Action" }, { name: "Sci-Fi" }],
          credits: { cast: [{ name: "Leonardo DiCaprio" }] },
          release_date: "2010-07-16",
          vote_average: 8.8,
          overview: "A mind-bending thriller.",
        },
      });
      movieModel.create.mockResolvedValue({ id: 1 });
      wishlistModel.findOne.mockResolvedValue(null);
      wishlistModel.create.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/wishlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Movie added to wishlist successfully.",
      });
    });

    test("should return 500 if an error occurs while adding to the wishlist", async () => {
      movieExistsInDB.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/wishlist")
        .send({ movieId: 123 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to add movie to wishlist.",
      });
    });
  });

  describe("addToCuratedList", () => {
    test("should return 400 if the movie is already in the curated list", async () => {
      movieExistsInDB.mockResolvedValue({ id: 1 });
      curatedListItemModel.findOne.mockResolvedValue({
        movieId: 1,
        curatedListId: 1,
      });

      const response = await request(app)
        .post("/api/curated-list")
        .send({ movieId: 123, curatedListId: 1 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Movie is already in the curated list.",
      });
    });

    test("should return 200 if the movie is successfully added to the curated list", async () => {
      movieExistsInDB.mockResolvedValue(null);
      fetchMovieAndCastDetails.mockResolvedValue({
        movieDetails: {
          id: 123,
          title: "Inception",
          genres: [{ name: "Action" }, { name: "Sci-Fi" }],
          credits: { cast: [{ name: "Leonardo DiCaprio" }] },
          release_date: "2010-07-16",
          vote_average: 8.8,
          overview: "A mind-bending thriller.",
        },
      });
      movieModel.create.mockResolvedValue({ id: 1 });
      curatedListItemModel.findOne.mockResolvedValue(null);
      curatedListItemModel.create.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/curated-list")
        .send({ movieId: 123, curatedListId: 1 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Movie added to curated list successfully.",
      });
    });

    test("should return 500 if an error occurs while adding to the curated list", async () => {
      movieExistsInDB.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/curated-list")
        .send({ movieId: 123, curatedListId: 1 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to add movie to curated list.",
      });
    });
  });
});
