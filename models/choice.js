const mongoose = require("mongoose");
const Joi = require("joi");
const { Question } = require("./question");

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
