const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const questionSchema = new mongoose.Schema(
  {
    head: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Number,
      ref: "User",
    },
    course: {
      type: Number,
      ref: "Course",
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

questionSchema.plugin(pagination);
questionSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Question",
  startAt: 1,
});

const Question = mongoose.model("Question", questionSchema);

module.exports.Question = Question;
