const { getTop5Movies } = require("../../../controllers/topMoviesController");
const { movie: movieModel, review: reviewModel } = require("../../../models");
const request = require("supertest");
const express = require("express");

jest.mock("../../../models");

const app = express();
app.use(express.json());
app.get("/api/movies/top5", getTop5Movies);

describe("MovieController - getTop5Movies", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 200 with top 5 movies sorted by rating and word count for reviews", async () => {
    movieModel.findAll.mockResolvedValue([
      {
        title: "Movie A",
        rating: 9.5,
        reviews: [{ reviewText: "Amazing movie with great storytelling." }],
      },
      {
        title: "Movie B",
        rating: 8.8,
        reviews: [{ reviewText: "A classic masterpiece." }],
      },
      {
        title: "Movie C",
        rating: 8.7,
        reviews: [{ reviewText: "Very enjoyable experience." }],
      },
      {
        title: "Movie D",
        rating: 8.5,
        reviews: [{ reviewText: "Loved every moment!" }],
      },
      {
        title: "Movie E",
        rating: 8.3,
        reviews: [{ reviewText: "Unique and entertaining." }],
      },
    ]);

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        title: "Movie A",
        rating: 9.5,
        review: {
          text: "Amazing movie with great storytelling.",
          wordCount: 5,
        },
      },
      {
        title: "Movie B",
        rating: 8.8,
        review: {
          text: "A classic masterpiece.",
          wordCount: 3,
        },
      },
      {
        title: "Movie C",
        rating: 8.7,
        review: {
          text: "Very enjoyable experience.",
          wordCount: 3,
        },
      },
      {
        title: "Movie D",
        rating: 8.5,
        review: {
          text: "Loved every moment!",
          wordCount: 3,
        },
      },
      {
        title: "Movie E",
        rating: 8.3,
        review: {
          text: "Unique and entertaining.",
          wordCount: 3, // Updated to match correct word count logic
        },
      },
    ]);
    expect(movieModel.findAll).toHaveBeenCalledWith({
      attributes: ["title", "rating"],
      order: [["rating", "DESC"]],
      limit: 5,
      where: { rating: { [require("sequelize").Op.ne]: null } },
      include: [
        {
          model: reviewModel,
          attributes: ["reviewText"],
          limit: 1,
        },
      ],
    });
  });

  test("should return 200 with default review and word count if no review is available", async () => {
    movieModel.findAll.mockResolvedValue([
      {
        title: "Movie F",
        rating: 9.0,
        reviews: [],
      },
      {
        title: "Movie G",
        rating: 8.5,
        reviews: null,
      },
    ]);

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        title: "Movie F",
        rating: 9.0,
        review: {
          text: "No review available.",
          wordCount: 3,
        },
      },
      {
        title: "Movie G",
        rating: 8.5,
        review: {
          text: "No review available.",
          wordCount: 3,
        },
      },
    ]);
  });

  test("should handle movies with null or missing rating values", async () => {
    movieModel.findAll.mockResolvedValue([]); // Mock an empty response

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([]);
    expect(movieModel.findAll).toHaveBeenCalledWith({
      attributes: ["title", "rating"],
      order: [["rating", "DESC"]],
      limit: 5,
      where: { rating: { [require("sequelize").Op.ne]: null } },
      include: [
        {
          model: reviewModel,
          attributes: ["reviewText"],
          limit: 1,
        },
      ],
    });
  });

  test("should return 500 if an error occurs while fetching top 5 movies", async () => {
    movieModel.findAll.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Failed to fetch top 5 movies.",
    });
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch top 5 movies:",
      "Database error"
    );
  });

  test("should return 200 if movies have reviews with empty strings", async () => {
    movieModel.findAll.mockResolvedValue([
      {
        title: "Movie I",
        rating: 8.7,
        reviews: [{ reviewText: "" }], // Mock empty review text
      },
    ]);

    const response = await request(app).get("/api/movies/top5");

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual([
      {
        title: "Movie I",
        rating: 8.7,
        review: {
          text: "No review available.", // Default review text
          wordCount: 3, // Word count for the default review text
        },
      },
    ]);
  });
});
