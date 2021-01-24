const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const { Question } = require("./question");

mongooseAutoIncrement.initialize(mongoose.connection);

const choiceSchema = Question.discriminator(
  "Choice",
  mongoose.Schema(
    {
      choices: [
        {
          type: String,
          required: true,
        },
      ],
      modelAnswer: {
        type: Number,
        required: true,
      },
    },
    { discriminatorKey: "type" }
  )
);

const Choice = mongoose.model("Choice");
module.exports.Choice = Choice;
