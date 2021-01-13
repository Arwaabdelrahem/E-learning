const express = require("express");
const isStudent = require("../middleware/isStudent");
const { Course } = require("../models/course");
const { Enrollment } = require("../models/enrollment");
const { Material } = require("../models/material");
const { User } = require("../models/user");
const router = express.Router();

router.get("/myEnrollment", isStudent, async (req, res, next) => {
  let myCourses = [];
  const student = await User.findById(req.user._id);

  const enrollment = await Enrollment.find({ student: student })
    .select("course status")
    .populate([{ path: "course", select: "name" }]);

  for (const i in enrollment) {
    if (enrollment[i].status == req.body.filter) {
      myCourses.push(enrollment[i]);
    }
  }

  if (req.body.filter) return res.status(200).send(myCourses);
  res.status(200).send(enrollment);
});

router.get("/liveCourses", isStudent, async (req, res, next) => {
  let liveCourses = [];
  const courses = await Course.find({});

  for (const i in courses) {
    let checkDate = (finish, start, now) => {
      if (finish.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) return true;
      if (start.setHours(0, 0, 0, 0) > now.setHours(0, 0, 0, 0)) return true;
      return false;
    };

    let result = checkDate(
      courses[i].finishingDate,
      courses[i].startingDate,
      new Date()
    );
    if (result == false) liveCourses.push(courses[i]);
  }

  res.status(200).send(liveCourses);
});

router.post("/enroll", isStudent, async (req, res, next) => {
  let student = await User.findById(req.user._id).populate("myEnrollment");
  if (!student) return res.status(404).send("Student not found");

  const course = await Course.findOne({ code: req.body.code });
  if (!course) return res.status(400).send("please enter valide cousre code ");

  let enroll = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });
  if (enroll) return res.status(400).send("already enrolled");

  enroll = new Enrollment({
    student: req.user._id,
    course: course._id,
  });

  student.myEnrollment.push(enroll);
  await student.save();
  await enroll.save();
  res.status(200).send({ Student: student, Enrollment: enroll });
});

router.get("/material/:courseId", isStudent, async (req, res, next) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });
  if (!enrollment) return res.status(400).send("please enroll first");

  if (enrollment.status != "accepted")
    return res.status(400).send("Enrollment status must be accepted");

  const materials = await Material.paginate({ course: req.params.courseId });
  res.status(200).send(materials);
});

module.exports = router;
