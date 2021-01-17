const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

const questionSchema = new mongoose.Schema(
  {
    head: {
      type: String,
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true, discriminatorKey: "type" }
);

questionSchema.plugin(pagination);
const Question = mongoose.model("Question", questionSchema);

module.exports.Question = Question;
