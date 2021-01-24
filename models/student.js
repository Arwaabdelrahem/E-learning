const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const { User } = require("./user");

mongooseAutoIncrement.initialize(mongoose.connection);

const studentSchema = User.discriminator(
  "Student",
  mongoose.Schema({
    emailVerifingCode: {
      type: String,
    },
    myEnrollment: [
      {
        type: Number,
        ref: "Enrollment",
      },
    ],
  })
);

const Student = mongoose.model("Student");

module.exports.Student = Student;
