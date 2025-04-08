const {
  sortMovies,
} = require("../../../controllers/sortByRatingOrReleaseyearController");
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
app.get("/api/movies/sort", sortMovies);

describe("MovieSortController - sortMovies", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid list parameter", async () => {
    const response = await request(app).get(
      "/api/movies/sort?list=invalid&sortBy=rating&order=ASC"
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error:
        "Invalid list parameter. Allowed values: watchlist, wishlist, curatedList.",
    });
  });

  test("should return 400 for invalid sortBy parameter", async () => {
    const response = await request(app).get(
      "/api/movies/sort?list=watchlist&sortBy=invalid&order=ASC"
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid sortBy parameter. Allowed values: rating, releaseYear.",
    });
  });

  test("should return 400 for invalid order parameter", async () => {
    const response = await request(app).get(
      "/api/movies/sort?list=watchlist&sortBy=rating&order=invalid"
    );
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid order parameter. Allowed values: ASC, DESC.",
    });
  });

  test("should return 200 with sorted movies for watchlist sorted by rating in ASC order", async () => {
    const mockMovies = [
      {
        title: "Movie A",
        tmdbId: 1,
        genre: "Action",
        actors: "Actor 1",
        releaseYear: 2020,
        rating: 7.5,
      },
      {
        title: "Movie B",
        tmdbId: 2,
        genre: "Drama",
        actors: "Actor 2",
        releaseYear: 2018,
        rating: 8.0,
      },
    ];
    movieModel.findAll.mockResolvedValue(mockMovies);

    const response = await request(app).get(
      "/api/movies/sort?list=watchlist&sortBy=rating&order=ASC"
    );

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual(mockMovies);
    expect(movieModel.findAll).toHaveBeenCalledWith({
      include: [
        {
          model: watchlistModel,
          attributes: [],
          required: true,
        },
      ],
      order: [["rating", "ASC"]],
    });
  });

  test("should return 200 with sorted movies for wishlist sorted by releaseYear in DESC order", async () => {
    const mockMovies = [
      {
        title: "Movie B",
        tmdbId: 2,
        genre: "Drama",
        actors: "Actor 2",
        releaseYear: 2018,
        rating: 8.0,
      },
      {
        title: "Movie A",
        tmdbId: 1,
        genre: "Action",
        actors: "Actor 1",
        releaseYear: 2020,
        rating: 7.5,
      },
    ];
    movieModel.findAll.mockResolvedValue(mockMovies);

    const response = await request(app).get(
      "/api/movies/sort?list=wishlist&sortBy=releaseYear&order=DESC"
    );

    expect(response.status).toBe(200);
    expect(response.body.movies).toEqual(mockMovies);
    expect(movieModel.findAll).toHaveBeenCalledWith({
      include: [
        {
          model: wishlistModel,
          attributes: [],
          required: true,
        },
      ],
      order: [["releaseYear", "DESC"]],
    });
  });

  test("should return 500 if an error occurs while sorting movies", async () => {
    movieModel.findAll.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get(
      "/api/movies/sort?list=watchlist&sortBy=rating&order=ASC"
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "An error occurred while sorting the movies.",
    });
  });
});
