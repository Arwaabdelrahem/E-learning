const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const solutionSchema = new mongoose.Schema(
  {
    quiz: {
      type: Number,
      ref: "Exam",
    },
    student: {
      type: Number,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["solving", "done"],
      default: "solving",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    questions: [
      new mongoose.Schema(
        {
          question: {
            type: Number,
            required: true,
            ref: "Question",
          },
          correct: {
            type: Boolean,
            default: null,
          },
          mark: {
            type: Number,
            default: 0,
          },
          answer: {},
        },
        { discriminatorKey: "type", _id: false }
      ),
    ],
  },
  { timestamps: true }
);

solutionSchema.virtual("mark").get(function () {
  let totalMark = 0;
  this.questions.forEach((question) => (totalMark += question.mark));
  return totalMark;
});

solutionSchema.plugin(pagination);
solutionSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Solution",
  startAt: 1,
});

const Solution = mongoose.model("Solution", solutionSchema);
module.exports.Solution = Solution;
