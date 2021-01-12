const Joi = require("joi");
const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startingDate: {
    type: Date,
  },
  finishingDate: {
    type: Date,
  },
});

function courseValidation(course) {
  const schema = Joi.object({
    code: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.string(),
    startingDate: Joi.date().raw(),
    finishingDate: Joi.date().raw(),
  });
  return schema.validate(course);
}
const Course = mongoose.model("Course", courseSchema);

module.exports.Course = Course;
module.exports.courseValidate = courseValidation;
