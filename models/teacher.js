const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const Joi = require("joi");
const { User } = require("./user");

mongooseAutoIncrement.initialize(mongoose.connection);

const teacherSchema = User.discriminator(
  "Teacher",
  mongoose.Schema({
    courses: [
      {
        type: Number,
        ref: "Course",
      },
    ],
    rating: {
      type: Number,
    },
  })
);

function teacherValidation(teacher) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(teacher);
}

const Teacher = mongoose.model("Teacher");

module.exports.Teacher = Teacher;
module.exports.teacherValidate = teacherValidation;
