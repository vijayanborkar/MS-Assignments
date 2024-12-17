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

jest.mock("../models");

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
      let req, res;

      beforeEach(() => {
        req = {
          tag: "nature",
          sortOrder: "ASC",
        };
        res = {
          status: jest.fn(() => res),
          json: jest.fn(),
        };
      });

      test("should return 200 and photo details when tag is found", async () => {
        const mockTagEntries = [{ photoId: 1 }];
        const mockPhotos = [
          {
            id: 5,
            imageUrl:
              "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
            description: "Beautiful nature",
            dateSaved: new Date(),
          },
        ];
        const mockPhotoTags = [{ name: "nature" }];

        tagModel.findAll.mockResolvedValueOnce(mockTagEntries);
        photoModel.findAll.mockResolvedValueOnce(mockPhotos);
        tagModel.findAll.mockResolvedValueOnce(mockPhotoTags);

        await searchPhotosByTag(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          photos: [
            {
              imageUrl:
                "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
              description: "Beautiful nature",
              dateSaved: mockPhotos[0].dateSaved,
              tags: ["nature"],
            },
          ],
        });
      });

      test("should return 404 when tag is not found", async () => {
        tagModel.findAll.mockResolvedValue([]);

        await searchPhotosByTag(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Tag not found." });
      });

      test("should return 500 on server error", async () => {
        tagModel.findAll.mockRejectedValue(new Error("Database error"));

        await searchPhotosByTag(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to search photos by tag.",
        });
      });
    });

    describe("getSearchHistory", () => {
      let req, res;

      beforeEach(() => {
        req = { query: { userId: 1 } };
        res = {
          status: jest.fn(() => res),
          json: jest.fn(),
        };
      });

      test("should return 200 and search history for a valid user", async () => {
        const mockSearchHistory = [
          { query: "nature", timestamp: new Date() },
          { query: "mountains", timestamp: new Date() },
        ];

        searchHistoryModel.findAll.mockResolvedValueOnce(mockSearchHistory);

        await getSearchHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          searchHistory: mockSearchHistory,
        });
      });

      test("should return 500 on server error", async () => {
        searchHistoryModel.findAll.mockRejectedValue(
          new Error("Database error")
        );

        await getSearchHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          error: "Failed to retrieve search history.",
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
      expect(validateSingleTag("")).toBe(
        "Invalid tag. Tag must be a non-empty string."
      );
      expect(validateSingleTag(null)).toBe(
        "Invalid tag. Tag must be a non-empty string."
      );
    });

    test("should return null for valid user ID", () => {
      expect(validateUserId(1)).toBeNull();
    });

    test("should return an error message for invalid user ID", () => {
      expect(validateUserId("abc")).toBe(
        "Invalid user ID. User ID must be a valid number."
      );
      expect(validateUserId(null)).toBe(
        "Invalid user ID. User ID must be a valid number."
      );
    });
  });
});

describe("Integration Tests", () => {
  describe("GET /api/photos/tag/search", () => {
    test("should return 200 and photo details when tag is found", async () => {
      const mockTagEntries = [{ photoId: 1 }];
      const mockPhotos = [
        {
          id: 5,
          imageUrl:
            "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400",
          description: "Beautiful nature",
          dateSaved: new Date("2024-12-15T18:04:19.023Z"), // Provide a specific date for consistency
        },
      ];
      const mockPhotoTags = [{ name: "nature" }];

      tagModel.findAll.mockResolvedValueOnce(mockTagEntries);
      photoModel.findAll.mockResolvedValueOnce(mockPhotos);
      tagModel.findAll.mockResolvedValueOnce(mockPhotoTags);

      const response = await request(app).get(
        "/api/photos/tag/search?tags=nature&sort=ASC&userId=1"
      );

      console.log("Response body:", response.body); // Log the response for debugging

      expect(response.status).toBe(200);
      expect(response.body.photos).toBeDefined();
      expect(response.body.photos[0].imageUrl).toBe(
        "https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2ODUzMDd8MHwxfHNlYXJjaHw4fHxuYXR1cmV8ZW58MHx8fHwxNzM0NDQzNTA2fDA&ixlib=rb-4.0.3&q=80&w=400"
      );
      expect(response.body.photos[0].description).toBe("Beautiful nature");
      expect(response.body.photos[0].dateSaved).toBe(
        "2024-12-15T18:04:19.023Z"
      );
      expect(response.body.photos[0].tags).toContain("nature");
    });

    test("should return 404 when tag is not found", async () => {
      tagModel.findAll.mockResolvedValueOnce([]); // Ensure empty array is returned

      const response = await request(app).get(
        "/api/photos/tag/search?tags=unknown&sort=ASC&userId=1"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found.");
    });
  });

  describe("GET /api/search-history", () => {
    test("should return 200 and search history for a valid user", async () => {
      const mockSearchHistory = [
        { query: "nature", timestamp: new Date() },
        { query: "mushroom", timestamp: new Date() },
      ];

      searchHistoryModel.findAll.mockResolvedValueOnce(mockSearchHistory);

      const response = await request(app).get("/api/search-history?userId=1");

      console.log("Response body:", response.body); // Log the response for debugging

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
      const response = await request(app).get("/api/search-history?userId=abc");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Invalid user ID. User ID must be a valid number."
      );
    });
  });
});
