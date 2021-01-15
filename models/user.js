const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const config = require("config");
const jwt = require("jsonwebtoken");

const options = { discriminatorKey: "kind" };

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
    },
  },
  options
);

function rigesterValidation(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    image: Joi.string(),
  });
  return schema.validate(user);
}

function logValidation(user) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(user);
}

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    { _id: this._id, enabled: this.enabled, kind: this.kind },
    config.get("jwtprivateKey")
  );
  return token;
};

userSchema.plugin(pagination);

const User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.register = rigesterValidation;
module.exports.log = logValidation;
