function validateUsername(username) {
    if (!username) {
        return "Username is required.";
    }
    if (username.length < 3 || username.length > 30) {
        return "Username must be between 3 and 30 characters.";
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return "Username can only contain letters, numbers, underscores, and hyphens.";
    }
    return null;
}

function validateEmail(email) {
    if (!email) {
        return "Email is required.";
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        return "Invalid email format.";
    }
    return null;
}

async function validateUniqueEmail(userModel, email) {
    const existingUser = await userModel.findOne({where: {email}});
    if (existingUser) {
        return "Email already exists.";
    }
    return null;
}

const validateImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "Image URL is required.";
    }
    if (typeof imageUrl !== "string") {
        return "Image URL must be a string.";
    }
    try {
        const url = new URL(imageUrl);
        if (!url.hostname.endsWith("unsplash.com") || !url.protocol.startsWith("https")) {
            return "Invalid image URL. Must be from Unsplash HTTPS.";
        }
        return null;
    } catch {
        return "Invalid URL format.";
    }
};

const validateTags = (tags) => {
    if (!Array.isArray(tags)) {
        return "Tags must be an array.";
    }
    if (tags.length === 0) {
        return "At least one tag is required.";
    }
    if (tags.length > 5) {
        return "Too many tags. Maximum is 5.";
    }
    for (const tag of tags) {
        if (typeof tag !== "string") {
            return "All tags must be strings.";
        }
        const trimmedTag = tag.trim();
        if (trimmedTag.length === 0) {
            return "Empty tags are not allowed.";
        }
        if (trimmedTag.length > 20) {
            return `Tag "${tag}" is too long. Maximum length is 20 characters.`;
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(trimmedTag)) {
            return `Tag "${tag}" contains invalid characters. Use only letters, numbers, hyphens, and underscores.`;
        }
    }
    return null;
};

const validateTagsArray = (tags) => {
    if (!Array.isArray(tags)) {
        return "Tags must be an array.";
    }

    for (const tag of tags) {
        if (typeof tag !== "string" || tag.trim() === "") {
            return "Tags must be non-empty strings.";
        }
    }

    return null;
};

const validateTagCount = (existingTags, newTags) => {
    if (!Array.isArray(existingTags) || !Array.isArray(newTags)) {
        return "Tags must be arrays.";
    }

    const totalTags = existingTags.length + newTags.length;
    if (totalTags === 0) {
        return "At least one tag is required.";
    }
    if (totalTags > 5) {
        return `A photo can have no more than 5 tags in total. Current total: ${totalTags}`;
    }

    const allTags = [...existingTags, ...newTags].map((tag) => typeof tag === "string" ? tag.toLowerCase() : tag);
    const uniqueTags = new Set(allTags);
    if (uniqueTags.size !== allTags.length) {
        return "Duplicate tags are not allowed.";
    }

    return null;
};

const validateSortOrder = (sort) => {
    if (!sort) {
        return null;
    }
    const validSortOrders = ["ASC", "DESC"];
    if (!validSortOrders.includes(sort.toUpperCase())) {
        return "Invalid sort order. Must be 'ASC' or 'DESC'.";
    }
    return null;
};

const validateSingleTag = (tag) => {
    if (!tag) {
        return "Tag is required.";
    }
    if (typeof tag !== "string") {
        return "Tag must be a string.";
    }
    const trimmedTag = tag.trim();
    if (trimmedTag.length === 0) {
        return "Tag cannot be empty.";
    }
    if (trimmedTag.length > 20) {
        return "Tag cannot be longer than 20 characters.";
    }
    if (!/^[a-zA-Z0-9-_]+$/.test(trimmedTag)) {
        return "Tag can only contain letters, numbers, hyphens, and underscores.";
    }
    return null;
};

const validateUserId = (userId) => {
    if (!userId) {
        return "User ID is required.";
    }
    if (isNaN(userId) || Number(userId) <= 0 || !Number.isInteger(Number(userId))) {
        return "User ID must be a positive integer.";
    }
    return null;
};

module.exports = {
    validateUsername,
    validateEmail,
    validateUniqueEmail,
    validateImageUrl,
    validateTags,
    validateTagsArray,
    validateTagCount,
    validateSortOrder,
    validateSingleTag,
    validateUserId,
};
