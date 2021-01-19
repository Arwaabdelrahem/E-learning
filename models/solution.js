const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

const solutionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["solving", "done"],
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    questions: [
      new mongoose.Schema(
        {
          question: {
            type: mongoose.Schema.Types.ObjectId,
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
    totalMark: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

solutionSchema.virtual("mark").get(function () {
  let totalMark = 0;
  this.questions.forEach((question) => (totalMark += question.mark));
  return totalMark;
});

solutionSchema.plugin(pagination);
const Solution = mongoose.model("Solution", solutionSchema);

module.exports.Solution = Solution;
