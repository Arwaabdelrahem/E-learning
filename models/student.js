const mongoose = require("mongoose");
const { User } = require("./user");

const studentSchema = User.discriminator(
  "Student",
  mongoose.Schema({
    emailVerifingCode: {
      type: String,
    },
    myEnrollment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Enrollment",
      },
    ],
  })
);

const Student = mongoose.model("Student");

module.exports.Student = Student;
