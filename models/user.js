const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");
const jwt = require("jsonwebtoken");
const options = { discriminatorKey: "kind" };
const notificationService = require("../services/notification");

mongooseAutoIncrement.initialize(mongoose.connection);

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
    emailVerifingCode: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
    },
    pushTokens: [
      new mongoose.Schema(
        {
          deviceType: {
            type: String,
            enum: ["android", "ios", "web"],
            required: true,
          },
          deviceToken: {
            type: String,
            required: true,
          },
        },
        { _id: false }
      ),
    ],
  },
  options
);

userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      name: doc.name,
      kind: doc.kind,
      email: doc.email,
      phone: doc.phone,
      enabled: doc.enabled,
      image: doc.image,
      myEnrollment: doc.kind === "Student" ? doc.myEnrollment : undefined,
      courses: doc.kind === "Teacher" ? doc.courses : undefined,
      rating: doc.kind === "Teacher" ? doc.rating : undefined,
      pushTokens: doc.pushTokens,
    };
  },
});

function rigesterValidation(user) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    image: Joi.string(),
    phone: Joi.string(),
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
    process.env.jwtprivateKey
  );
  return token;
};

userSchema.methods.sendNotification = async function (message) {
  let changed = false;
  let len = this.pushTokens.length;
  while (len--) {
    const deviceToken = this.pushTokens[len].deviceToken;
    try {
      console.log("1");
      await notificationService.sendNotification(deviceToken, message);
      console.log("2");
    } catch (error) {
      // console.log(error);
      this.pushTokens.splice(len, 1);
      changed = true;
    }
  }
  if (changed) await this.save();
};

userSchema.plugin(pagination);
userSchema.plugin(mongooseAutoIncrement.plugin, { model: "User", startAt: 1 });

const User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.register = rigesterValidation;
module.exports.log = logValidation;
