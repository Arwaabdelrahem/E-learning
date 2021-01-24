const Joi = require("joi");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");

mongooseAutoIncrement.initialize(mongoose.connection);

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
  rating: {
    type: Number,
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
courseSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Course",
  startAt: 1,
});

const Course = mongoose.model("Course", courseSchema);

module.exports.Course = Course;
module.exports.courseValidate = courseValidation;
