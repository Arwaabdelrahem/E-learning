const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");

mongooseAutoIncrement.initialize(mongoose.connection);

const enrollSchema = mongoose.Schema({
  student: {
    type: Number,
    ref: "User",
  },
  course: {
    type: Number,
    ref: "Course",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

enrollSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Enrollment",
  startAt: 1,
});

const Enrollment = mongoose.model("Enrollment", enrollSchema);
module.exports.Enrollment = Enrollment;
