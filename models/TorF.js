const mongoose = require("mongoose");
const Joi = require("joi");
const { Question } = require("./question");

const trueOrFalseSchema = Question.discriminator(
  "TorF",
  mongoose.Schema(
    {
      modelAnswer: {
        type: Boolean,
        required: true,
      },
    },
    { discriminatorKey: "type" }
  )
);

const TorF = mongoose.model("TorF");
module.exports.TorF = TorF;
