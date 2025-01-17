const request = require("supertest");
const express = require("express");
const {
  validateSearch,
  validateUserIdQuery,
} = require("../controller/userController");
const {
  searchPhotosByTag,
  getSearchHistory,
} = require("../controller/dataController");
const {
  validateSortOrder,
  validateSingleTag,
  validateUserId,
} = require("../validations/userValidations");

jest.mock("../models", () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(),
    close: jest.fn().mockResolvedValue(),
  };

  return {
    sequelize: mockSequelize,
    photo: {
      findAll: jest.fn(),
      create: jest.fn(),
    },
    tag: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    searchHistory: {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findAll: jest.fn(),
      create: jest.fn(),
    },
  };
});

const {
  sequelize,
  photo: photoModel,
  tag: tagModel,
  searchHistory: searchHistoryModel,
  user: userModel,
} = require("../models");

jest.mock("axios");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/photos/tag/search", validateSearch, searchPhotosByTag);
app.get("/api/search-history", validateUserIdQuery, getSearchHistory);

app.use((err, req, res, next) => {
  console.error("Error in middleware:", err);
  res.status(500).json({
    error: "Internal server error.",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe("Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Controller Functions", () => {
    describe("searchPhotosByTag", () => {
      test("should return 200 and photo details when photos are found", async () => {
        const mockTagEntries = [{ photoId: 5, name: "nature" }];
        const mockPhotos = [
          {
            id: 5,
            imageUrl:
              "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
            description: "Beautiful nature",
            dateSaved: "2024-12-17T13:52:41.267Z",
          },
        ];
        const mockPhotoTags = [{ name: "nature" }];

        tagModel.findOne.mockResolvedValue({ id: 1, name: "nature" });
        searchHistoryModel.findOne.mockResolvedValue(null);

        tagModel.findAll
          .mockResolvedValueOnce(mockTagEntries)
          .mockResolvedValueOnce(mockPhotoTags);

        photoModel.findAll.mockResolvedValueOnce(mockPhotos);
        searchHistoryModel.create.mockResolvedValueOnce({});

        const response = await request(app)
          .get("/api/photos/tag/search")
          .query({
            tags: "nature",
            sortOrder: "ASC",
            userId: "1",
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          photos: [
            {
              imageUrl: mockPhotos[0].imageUrl,
              description: mockPhotos[0].description,
              dateSaved: mockPhotos[0].dateSaved,
              tags: ["nature"],
            },
          ],
          count: 1,
        });
      });

      test("should return 404 when tag is not found", async () => {
        tagModel.findOne.mockResolvedValue(null);
        searchHistoryModel.findOne.mockResolvedValue(null);
        tagModel.findAll.mockResolvedValue([]);

        const response = await request(app)
          .get("/api/photos/tag/search")
          .query({
            tags: "nonexistent",
            sortOrder: "ASC",
            userId: "1",
          });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Tag not found." });
      });

      test("should return 500 on server error", async () => {
        tagModel.findOne.mockResolvedValue({ id: 1, name: "nature" });
        searchHistoryModel.findOne.mockResolvedValue(null);

        tagModel.findAll.mockRejectedValueOnce(new Error("Database error"));

        const response = await request(app)
          .get("/api/photos/tag/search")
          .query({
            tags: "nature",
            sortOrder: "ASC",
            userId: "1",
          });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          error: "Failed to search photos by tag.",
          details:
            process.env.NODE_ENV === "development"
              ? "Database error"
              : undefined,
        });
      });
    });

    describe("getSearchHistory", () => {
      test("should return 200 and search history for a valid user", async () => {
        const mockSearchHistory = [
          { query: "nature", timestamp: new Date().toISOString() },
          {
            query: "mushroom",
            timestamp: new Date().toISOString(),
          },
        ];

        searchHistoryModel.findAll.mockResolvedValueOnce(mockSearchHistory);

        const response = await request(app).get("/api/search-history?userId=1");

        expect(response.status).toBe(200);
        expect(response.body.searchHistory).toBeDefined();
        expect(response.body.searchHistory).toEqual(mockSearchHistory);
      });

      test("should return 500 on server error", async () => {
        searchHistoryModel.findAll.mockRejectedValueOnce(
          new Error("Database error")
        );

        const response = await request(app).get("/api/search-history?userId=1");

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Failed to retrieve search history.");
      });

      test("should return 400 for invalid user ID", async () => {
        const response = await request(app)
          .get("/api/search-history")
          .query({ userId: "abc" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          error: "User ID must be a positive integer.",
        });
      });
    });
  });

  describe("Validation Functions", () => {
    test("should return null for valid sort order", () => {
      expect(validateSortOrder("ASC")).toBeNull();
      expect(validateSortOrder("DESC")).toBeNull();
    });

    test("should return an error message for invalid sort order", () => {
      expect(validateSortOrder("INVALID")).toBe(
        "Invalid sort order. Must be 'ASC' or 'DESC'."
      );
    });

    test("should return null for valid tag", () => {
      expect(validateSingleTag("nature")).toBeNull();
    });

    test("should return an error message for invalid tag", () => {
      expect(validateSingleTag("")).toBe("Tag is required.");
      expect(validateSingleTag(null)).toBe("Tag is required.");
    });

    test("should return null for valid user ID", () => {
      expect(validateUserId(1)).toBeNull();
    });

    test("should return an error message for invalid user ID", () => {
      expect(validateUserId("abc")).toBe("User ID must be a positive integer.");
      expect(validateUserId(null)).toBe("User ID is required.");
    });
  });
});
