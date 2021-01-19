const { Enrollment } = require("../models/enrollment");
const { Course } = require("../models/course");

module.exports = async function (req, res, next) {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course Not found");

  if (req.user.kind === "Teacher") {
    if (req.user.courses.indexOf(req.params.courseId) === -1)
      return res.status(403).send("Forbidden");
  }

  if (req.user.kind === "Student") {
    let enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      status: "accepted",
    });
    if (!enrollment) return res.status(403).send("please enroll first");
  }
  next();
};
