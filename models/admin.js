const Joi = require("joi");
const mongoose = require("mongoose");
const { User } = require("./user");

const adminSchema = User.discriminator(
  "Admin",
  mongoose.Schema({
    isAdmin: Boolean,
  })
);

const Admin = mongoose.model("Admin");

module.exports.Admin = Admin;
