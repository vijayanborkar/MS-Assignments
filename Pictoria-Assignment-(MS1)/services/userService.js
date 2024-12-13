const { user: userModel } = require("../models");

async function doesUserExist(email) {
  const existingUser = await userModel.findOne({ where: { email } });
  return existingUser !== null;
}

module.exports = { doesUserExist };
