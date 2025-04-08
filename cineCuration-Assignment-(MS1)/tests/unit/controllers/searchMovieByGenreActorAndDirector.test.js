const {
  searchMovieByGenreActorAndDirector,
} = require("../../../controllers/searchMovieByGenreActorAndDirectorController");
const {
  movie: movieModel,
  watchlist: watchlistModel,
  wishlist: wishlistModel,
  curatedListItem: curatedListItemModel,
} = require("../../../models");
const request = require("supertest");
const express = require("express");
jest.mock("../../../models");

const app = express();
app.use(express.json());
app.get("/api/movies/search", searchMovieByGenreActorAndDirector);

describe("MovieSearchController - searchMovieByGenreActorAndDirector", () => {
  beforeAll(() => {
    // Suppress console.error logs for cleaner test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error after all tests
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 if no query parameters are provided", async () => {
    const response = await request(app).get("/api/movies/search");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "At least one query parameter must be provided.",
    });
  });

  test("should return 400 for invalid listType parameter", async () => {
    const response = await request(app).get(
      "/api/movies/search?listType=invalid"
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        "Invalid listType parameter. Valid options are: watchlist, wishlist, curatedList.",
    });
  });

  test("should return 400 for empty genre parameter", async () => {
    const response = await request(app).get("/api/movies/search?genre=");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid genre parameter. Genre must be a non-empty string.",
    });
  });

  test("should return 400 for empty actor parameter", async () => {
    const response = await request(app).get("/api/movies/search?actor=");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid actor parameter. Actor must be a non-empty string.",
    });
  });

  test("should return 400 for empty director parameter", async () => {
    const response = await request(app).get("/api/movies/search?director=");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid director parameter. Director must be a non-empty string.",
    });
  });

  test("should return 200 with empty movies when no matches found", async () => {
    movieModel.findAll.mockResolvedValue([]); // Mock no results

    const response = await request(app).get("/api/movies/search?genre=Action");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      movies: [],
      message: "No movies found matching the specified filters.",
    });
  });

  test("should return 200 with formatted movies for valid genre filter", async () => {
    movieModel.findAll.mockResolvedValue([
      {
        id: 1,
        title: "Inception",
        tmdbId: 123,
        genre: "Action, Sci-Fi",
        actors: "Leonardo DiCaprio, Joseph Gordon-Levitt",
        director: "Christopher Nolan",
        releaseYear: 2010,
        rating: 8.8,
        description: "A mind-bending thriller.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]); // Mock a successful result

    const response = await request(app).get("/api/movies/search?genre=Action");
    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        id: 1,
        title: "Inception",
        tmdbId: 123,
        genre: "Action, Sci-Fi",
        actors: "Leonardo DiCaprio, Joseph Gordon-Levitt",
        director: "Christopher Nolan",
        releaseYear: 2010,
        rating: 8.8,
        description: "A mind-bending thriller.",
        createdAt: expect.any(String), // Date as ISO string
        updatedAt: expect.any(String), // Date as ISO string
      },
    ]);
  });

  test("should return 200 with movies filtered by listType", async () => {
    movieModel.findAll.mockResolvedValue([
      {
        id: 2,
        title: "The Dark Knight",
        tmdbId: 456,
        genre: "Action, Crime, Drama",
        actors: "Christian Bale, Heath Ledger",
        director: "Christopher Nolan",
        releaseYear: 2008,
        rating: 9.0,
        description: "The legendary Batman faces the Joker.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const response = await request(app).get(
      "/api/movies/search?listType=watchlist"
    );
    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        id: 2,
        title: "The Dark Knight",
        tmdbId: 456,
        genre: "Action, Crime, Drama",
        actors: "Christian Bale, Heath Ledger",
        director: "Christopher Nolan",
        releaseYear: 2008,
        rating: 9.0,
        description: "The legendary Batman faces the Joker.",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    ]);
  });

  test("should return 500 if a database error occurs", async () => {
    movieModel.findAll.mockRejectedValue(new Error("Database error")); // Mock an error

    const response = await request(app).get("/api/movies/search?genre=Action");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "An error occurred while searching for movies.",
    });
  });
});
