const { Enrollment } = require("../models/enrollment");
const { Teacher } = require("../models/teacher");

module.exports = async function (req, res, next) {
  let teacher, enrollment;
  if (req.user.kind == "Teacher") {
    teacher = await Teacher.findById(req.user._id);
    if (!teacher) return res.status(404).send("Teacher not found");

    if (teacher.courses.indexOf(req.params.courseId) == -1)
      return res.status(403).send("Forbidden");
  }

  if (req.user.kind == "Student") {
    enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });

    if (!enrollment || enrollment.status != "accepted")
      return res.status(400).send("please enroll first");
  }
  next();
};
