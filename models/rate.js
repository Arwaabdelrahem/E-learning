const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const rateSchema = new mongoose.Schema(
  {
    subject: {
      type: Number,
      refPath: "subjectType",
      required: true,
    },
    subjectType: {
      type: String,
      enum: ["Teacher", "Course"],
      required: true,
    },
    user: {
      type: Number,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

rateSchema.plugin(pagination);
rateSchema.plugin(mongooseAutoIncrement.plugin, { model: "Rate", startAt: 1 });

const Rate = mongoose.model("Rate", rateSchema);

module.exports.Rate = Rate;
