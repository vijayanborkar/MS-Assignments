const { curatedList } = require("../models/curatedList");
const { generateSlug } = require("../services/slugService");

const createCuratedList = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { name, description, slug } = req.body;

    // Enhanced validation
    const validationErrors = [];
    if (!name) validationErrors.push("name");
    if (!description) validationErrors.push("description");
    if (!slug) validationErrors.push("slug");

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${validationErrors.join(", ")}`,
      });
    }

    // Check if slug already exists
    const existingList = await CuratedList.findOne({
      where: { slug },
      attributes: ["id", "slug"],
    });

    // Create new list with error handling
    const newList = await curatedList.create({
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

    const list = await curatedList.findByPk(curatedListId);
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
