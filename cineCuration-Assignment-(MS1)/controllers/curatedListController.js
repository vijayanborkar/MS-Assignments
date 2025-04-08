  const { curatedList: curatedListModel } = require("../models");
  const { generateSlug } = require("../services/slugService");

  const createCuratedList = async (req, res) => {
    try {
      const name = req.body.name?.trim();
      const description = req.body.description?.trim();
      const slug = generateSlug(name); // Generate slug from the name

      // Enhanced validation
      const validationErrors = [];
      if (!name) validationErrors.push("name");
      if (!description) validationErrors.push("description");

      if (validationErrors.length > 0) {
        return res.status(400).json({
          error: `Missing required fields: ${validationErrors.join(", ")}`,
        });
      }

      // Check if slug already exists
      const existingList = await curatedListModel.findOne({
        where: { slug },
        attributes: ["id", "slug"],
      });

      if (existingList) {
        return res.status(409).json({
          error: "Slug already exists. Please use a unique slug.",
        });
      }

      // Create new list
      const newList = await curatedListModel.create({
        name,
        description,
        slug,
      });

      return res.status(201).json({
        success: true,
        message: "Curated list created successfully.",
        data: {
          id: newList.id,
          name: newList.name,
          slug: newList.slug,
        },
      });
    } catch (error) {
      console.error("Error in createCuratedList:", {
        message: error.message,
        stack: error.stack,
      });

      // Check for specific database errors
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((e) => e.message),
        });
      }

      return res.status(500).json({
        error: "Failed to create curated list.",
        details: error.message,
      });
    }
  };

  const updateCuratedList = async (req, res) => {
    try {
      const { curatedListId } = req.params;
      const { name, description } = req.body;

      const list = await curatedListModel.findByPk(curatedListId);
      if (!list) {
        return res.status(404).json({
          error: "Curated list not found",
        });
      }

      // Update only if values are provided
      if (name) {
        list.name = name;
        // Automatically update slug when name changes
        list.slug = generateSlug(name);
      }

      if (description !== undefined) {
        list.description = description;
      }

      await list.save();

      return res.status(200).json({
        message: "Curated list updated successfully.",
      });
    } catch (error) {
      console.error("Error in updateCuratedList:", error);
      return res.status(500).json({
        error: "Failed to update curated list.",
      });
    }
  };

  module.exports = {
    createCuratedList,
    updateCuratedList,
  };
