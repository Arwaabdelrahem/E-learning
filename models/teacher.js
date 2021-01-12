const mongoose = require("mongoose");
const Joi = require("joi");

const { User } = require("./user");

const teacherSchema = User.discriminator(
  "Teacher",
  mongoose.Schema({
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    enabled: {
      type: Boolean,
      default: false,
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
