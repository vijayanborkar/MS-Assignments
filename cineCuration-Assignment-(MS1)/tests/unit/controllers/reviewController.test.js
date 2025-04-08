const { addReview } = require("../../../controllers/reviewController");
const { review: reviewModel } = require("../../../models");
const { movieExistsInDB } = require("../../../services/movieService");
const request = require("supertest");
const express = require("express");

jest.mock("../../../models");
jest.mock("../../../services/movieService");

const app = express();
app.use(express.json());
app.post("/api/movies/:movieId/reviews", addReview);

describe("ReviewController - addReview", () => {
  beforeAll(() => {
    // Suppress console.error during tests for cleaner output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore(); // Restore original console.error after tests
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock calls before each test
  });

  test("should return 404 if the movie does not exist", async () => {
    movieExistsInDB.mockResolvedValue(null); // Mock the movie not existing

    const response = await request(app)
      .post("/api/movies/123/reviews")
      .send({ rating: 8, reviewText: "Great movie!" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Movie not found." });
  });

  test("should return 400 if the rating is invalid", async () => {
    movieExistsInDB.mockResolvedValue({ id: 123 }); // Mock the movie existing

    const response = await request(app)
      .post("/api/movies/123/reviews")
      .send({ rating: 11, reviewText: "Great movie!" }); // Invalid rating

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Rating must be between 0 and 10 and should be a number.",
    });
  });

  test("should return 400 if the review text is invalid", async () => {
    movieExistsInDB.mockResolvedValue({ id: 123 }); // Mock the movie existing

    const response = await request(app)
      .post("/api/movies/123/reviews")
      .send({
        rating: 8,
        reviewText: "A".repeat(501), // Invalid reviewText: exceeds 500 characters
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Review text must not exceed 500 characters.",
    });
  });

  test("should return 200 when the review is added successfully", async () => {
    movieExistsInDB.mockResolvedValue({ id: 123 }); // Mock the movie existing
    reviewModel.create.mockResolvedValue(true); // Mock the database insert

    const response = await request(app)
      .post("/api/movies/123/reviews")
      .send({ rating: 8, reviewText: "Great movie!" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Review added successfully." });
    expect(reviewModel.create).toHaveBeenCalledWith({
      movieId: 123,
      rating: 8,
      reviewText: "Great movie!",
    });
  });

  test("should return 500 if there is a server error", async () => {
    movieExistsInDB.mockResolvedValue({ id: 123 }); // Mock the movie existing
    reviewModel.create.mockRejectedValue(new Error("Database error")); // Simulate a database error

    const response = await request(app)
      .post("/api/movies/123/reviews")
      .send({ rating: 8, reviewText: "Great movie!" });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Failed to add review due to an internal server error.",
    });
  });
});
