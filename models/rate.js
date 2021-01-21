const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

const rateSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "subjectType",
      required: true,
    },
    subjectType: {
      type: String,
      enum: ["Teacher", "Course"],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
const Rate = mongoose.model("Rate", rateSchema);

module.exports.Rate = Rate;
