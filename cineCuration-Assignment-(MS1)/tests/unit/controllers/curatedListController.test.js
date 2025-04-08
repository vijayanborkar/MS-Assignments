const {
  createCuratedList,
  updateCuratedList,
} = require("../../../controllers/curatedListController");
const { curatedList: curatedListModel } = require("../../../models");
const { generateSlug } = require("../../../services/slugService");
const request = require("supertest");
const express = require("express");

jest.mock("../../../models");
jest.mock("../../../services/slugService");

const app = express();
app.use(express.json());
app.post("/api/curated-lists", createCuratedList);
app.put("/api/curated-lists/:curatedListId", updateCuratedList);

describe("CuratedListController", () => {
  beforeAll(() => {
    // Suppress console.error during tests for cleaner output
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console.error after all tests
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCuratedList", () => {
    test("should return 400 if required fields are missing", async () => {
      const response = await request(app).post("/api/curated-lists").send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Missing required fields: name, description",
      });
    });

    test("should return 409 if slug already exists", async () => {
      generateSlug.mockReturnValue("existing-slug");
      curatedListModel.findOne.mockResolvedValue({
        id: 1,
        slug: "existing-slug",
      });

      const response = await request(app)
        .post("/api/curated-lists")
        .send({ name: "Duplicate Name", description: "Sample Description" });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: "Slug already exists. Please use a unique slug.",
      });
      expect(generateSlug).toHaveBeenCalledWith("Duplicate Name");
    });

    test("should return 201 when the curated list is created successfully", async () => {
      generateSlug.mockReturnValue("unique-slug");
      curatedListModel.findOne.mockResolvedValue(null);
      curatedListModel.create.mockResolvedValue({
        id: 1,
        name: "Unique Name",
        slug: "unique-slug",
      });

      const response = await request(app)
        .post("/api/curated-lists")
        .send({ name: "Unique Name", description: "Unique Description" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Curated list created successfully.",
        data: {
          id: 1,
          name: "Unique Name",
          slug: "unique-slug",
        },
      });
    });

    test("should return 500 if there is an unexpected error", async () => {
      generateSlug.mockReturnValue("unique-slug");
      curatedListModel.findOne.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/curated-lists")
        .send({ name: "Unique Name", description: "Unique Description" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to create curated list.",
        details: "Database error",
      });
    });
  });

  describe("updateCuratedList", () => {
    test("should return 404 if curated list does not exist", async () => {
      curatedListModel.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/curated-lists/1")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Curated list not found",
      });
    });

    test("should return 200 when the curated list is updated successfully", async () => {
      curatedListModel.findByPk.mockResolvedValue({
        id: 1,
        name: "Old Name",
        slug: "old-slug",
        description: "Old Description",
        save: jest.fn().mockResolvedValue(true),
      });

      generateSlug.mockReturnValue("updated-slug");

      const response = await request(app).put("/api/curated-lists/1").send({
        name: "Updated Name",
        description: "Updated Description",
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Curated list updated successfully.",
      });

      expect(generateSlug).toHaveBeenCalledWith("Updated Name");
    });

    test("should return 500 if there is an unexpected error", async () => {
      curatedListModel.findByPk.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .put("/api/curated-lists/1")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: "Failed to update curated list.",
      });
    });
  });
});
