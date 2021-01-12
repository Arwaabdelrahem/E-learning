const mongoose = require("mongoose");

const enrollSchema = mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

const Enrollment = mongoose.model("Enrollment", enrollSchema);

module.exports.Enrollment = Enrollment;
