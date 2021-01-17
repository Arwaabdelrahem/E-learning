const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    questions: [quizQuestionSchema()],
    availability: {
      type: Boolean,
      default: false,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true, discriminatorKey: "kind" }
);

examSchema.virtual("points").get(function () {
  let points = 0;
  for (let i = 0; i < this.questions.length; i++) {
    points += this.questions[i].point;
  }
  return points;
});

function quizQuestionSchema() {
  const questionSchema = new mongoose.Schema(
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
      point: {
        type: Number,
      },
    },
    { _id: false }
  );

  return questionSchema;
}

examSchema.plugin(pagination);
const Exam = mongoose.model("Exam", examSchema);

module.exports.Exam = Exam;
