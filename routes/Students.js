const express = require("express");
const auth = require("../middleware/auth");
const isStudent = require("../middleware/isStudent");
const { Course } = require("../models/course");
const { Enrollment } = require("../models/enrollment");
const { Solution } = require("../models/solution");
const router = express.Router();

router.get("/myEnrollment", auth, isStudent, async (req, res, next) => {
  let query = {
    student: req.user._id,
    ...(req.query.status !== undefined && {
      status: req.query.status,
    }),
  };

  const enrollment = await Enrollment.find(query)
    .select("course status")
    .populate([{ path: "course", select: "name" }]);

  res.status(200).send(enrollment);
});

router.get("/liveCourses", auth, isStudent, async (req, res, next) => {
  const courses = await Course.find({
    finishingDate: { $gt: new Date(new Date().toUTCString()) },
    startingDate: { $lte: new Date(new Date().toUTCString()) },
  });

  res.status(200).send(courses);
});

router.post("/enroll/:courseId", auth, isStudent, async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course Not foud");

  if (course.code !== req.body.code)
    return res.status(400).send("please enter valid code");

  let enroll = await Enrollment.findOne({
    student: req.user._id,
    course: course._id,
  });
  if (enroll) return res.status(400).send("already enrolled");

  enroll = new Enrollment({
    student: req.user._id,
    course: course._id,
  });
  await enroll.save();

  await req.user.myEnrollment.push(enroll._id);
  await req.user.save();
  res.status(200).send({ Student: req.user, Enrollment: enroll });
});

module.exports = router;
