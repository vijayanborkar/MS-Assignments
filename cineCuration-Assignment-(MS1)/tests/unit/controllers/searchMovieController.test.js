const request = require("supertest");
const express = require("express");
require("dotenv").config();
const { searchMovies } = require("../../../controllers/searchMovieController");
const {
  searchMovie,
  fetchMovieCredits,
} = require("../../../services/movieService");

// Mock the movie service functions
jest.mock("../../../services/movieService");

const app = express();
app.use(express.json());
app.get("/api/movies/search", searchMovies);

describe("searchMovies Controller", () => {
  beforeAll(() => {
    // Suppress console.error to clean test output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore(); // Restore original console.error after tests
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  test("should return 400 if query parameter is missing", async () => {
    const response = await request(app).get("/api/movies/search");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Search query is required" });
  });

  test("should return 200 with formatted movies when valid query is provided", async () => {
    // Mock search results from TMDB
    const mockSearchResults = [
      {
        id: 1,
        title: "Inception",
        genre_ids: [28, 878, 12],
        release_date: "2010-07-16",
        vote_average: 8.368,
        overview: "Cobb, a skilled thief who commits corporate espionage...",
      },
    ];

    // Mock actor details for the movie
    const mockCredits = [
      { name: "Leonardo DiCaprio", known_for_department: "Acting" },
      { name: "Joseph Gordon-Levitt", known_for_department: "Acting" },
      { name: "Ken Watanabe", known_for_department: "Acting" },
      { name: "Tom Hardy", known_for_department: "Acting" },
      { name: "Elliot Page", known_for_department: "Acting" },
    ];

    // Mock the service functions
    searchMovie.mockResolvedValue(mockSearchResults);
    fetchMovieCredits.mockResolvedValue(mockCredits);

    const response = await request(app)
      .get("/api/movies/search")
      .query({ query: "Inception" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      movies: [
        {
          title: "Inception",
          tmdbId: 1,
          genre: "28, 878, 12",
          actors:
            "Leonardo DiCaprio, Joseph Gordon-Levitt, Ken Watanabe, Tom Hardy, Elliot Page",
          releaseYear: "2010",
          rating: 8.368,
          description:
            "Cobb, a skilled thief who commits corporate espionage...",
        },
      ],
    });
  });

  test("should handle errors when fetching credits fails for a movie", async () => {
    // Mock search results
    const mockSearchResults = [
      {
        id: 1,
        title: "Inception",
        genre_ids: [28, 878, 12],
        release_date: "2010-07-16",
        vote_average: 8.368,
        overview: "Cobb, a skilled thief who commits corporate espionage...",
      },
      {
        id: 2,
        title: "Interstellar",
        genre_ids: [12, 18, 878],
        release_date: "2014-11-07",
        vote_average: 8.6,
        overview: "A team of explorers travel through a wormhole in space...",
      },
    ];

    // Mock partial credits failure
    const mockCredits = [
      { name: "Matthew McConaughey", known_for_department: "Acting" },
      { name: "Anne Hathaway", known_for_department: "Acting" },
      { name: "Jessica Chastain", known_for_department: "Acting" },
    ];

    searchMovie.mockResolvedValue(mockSearchResults);
    fetchMovieCredits
      .mockResolvedValueOnce(mockCredits) // Success for movie 1
      .mockRejectedValueOnce(new Error("Credits fetch failed")); // Failure for movie 2

    const response = await request(app)
      .get("/api/movies/search")
      .query({ query: "sci-fi" });

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        title: "Inception",
        tmdbId: 1,
        genre: "28, 878, 12",
        actors: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
        releaseYear: "2010",
        rating: 8.368,
        description: "Cobb, a skilled thief who commits corporate espionage...",
      },
    ]);
  });

  test("should return 500 if searchMovie service fails", async () => {
    // Mock searchMovie failure
    searchMovie.mockRejectedValue(new Error("TMDB API failed"));

    const response = await request(app)
      .get("/api/movies/search")
      .query({ query: "Inception" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Failed to search movies" });
  });
});
