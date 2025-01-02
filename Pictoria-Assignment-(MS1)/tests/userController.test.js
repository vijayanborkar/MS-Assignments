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
const { sequelize } = require("../models");
const {
  photo: photoModel,
  tag: tagModel,
  searchHistory: searchHistoryModel,
} = require("../models");
const {
  validateSortOrder,
  validateSingleTag,
  validateUserId,
} = require("../validations/userValidations");

jest.mock("axios");
jest.mock("../models", () => ({
  photo: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  tag: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
  searchHistory: {
    findAll: jest.fn(),
    create: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.get("/api/photos/tag/search", validateSearch, searchPhotosByTag);
app.get("/api/search-history", validateUserIdQuery, getSearchHistory);

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
        const mockTagEntries = [{ photoId: 5 }];
        const mockPhotos = [
          {
            id: 5,
            imageUrl:
              "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
            description: "Beautiful nature",
            altDescription: "Mountain view",
            dateSaved: "2024-12-17T13:52:41.267Z",
          },
        ];
        const mockPhotoTags = [{ name: "nature" }];

        tagModel.findAll.mockResolvedValueOnce(mockTagEntries);
        photoModel.findAll.mockResolvedValueOnce(mockPhotos);
        tagModel.findAll.mockResolvedValueOnce(mockPhotoTags);

        const response = await request(app).get(
          "/api/photos/tag/search?tags=nature&sort=ASC&userId=1"
        );

        console.log("Test Response Body:", response.body);

        expect(response.status).toBe(200);
        expect(response.body.photos).toEqual([
          {
            imageUrl:
              "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
            description: "Beautiful nature",
            altDescription: "Mountain view",
            dateSaved: "2024-12-17T13:52:41.267Z",
            tags: ["nature"],
          },
        ]);
      });

      test("should return 404 when tag is not found", async () => {
        tagModel.findAll.mockResolvedValueOnce([]);

        const response = await request(app).get(
          "/api/photos/tag/search?tags=nonexistent&sort=ASC&userId=1"
        );

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: "Tag not found." });
      });

      test("should return 500 on server error", async () => {
        tagModel.findAll.mockRejectedValueOnce(new Error("Database error"));

        const req = { query: { tags: "nature", sort: "ASC", userId: 1 } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await searchPhotosByTag(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to search photos by tag.",
          details: undefined,
        });
      });
    });

    describe("getSearchHistory", () => {
      test("should return 200 and search history for a valid user", async () => {
        const mockSearchHistory = [
          { query: "nature", timestamp: new Date().toISOString() },
          { query: "mushroom", timestamp: new Date().toISOString() },
        ];

        searchHistoryModel.findAll.mockResolvedValueOnce(mockSearchHistory);

        const response = await request(app).get("/api/search-history?userId=1");

        console.log("Response body:", response.body);

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
        const response = await request(app).get(
          "/api/search-history?userId=abc"
        );

        expect(response.status).toBe(400);
        expect(response.body.message).toBe(
          "User ID must be a positive integer."
        );
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
