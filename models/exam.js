const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

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
      type: Number,
      ref: "Course",
    },
    duration: {
      type: Number,
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
        type: Number,
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
examSchema.plugin(mongooseAutoIncrement.plugin, { model: "Exam", startAt: 1 });

const Exam = mongoose.model("Exam", examSchema);

module.exports.Exam = Exam;
