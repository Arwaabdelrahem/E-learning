const express = require("express");
const { Course, courseValidate } = require("../models/course");
const { Teacher } = require("../models/teacher");
const isTeacher = require("../middleware/isTeacher");
const { Enrollment } = require("../models/enrollment");
const auth = require("../middleware/auth");
const { Conversation, GROUP } = require("../models/conversation");
const router = express.Router();

router.get("/myCourses", auth, isTeacher, async (req, res, next) => {
  await Teacher.populate(req.user, [
    { path: "courses", select: "name code description" },
  ]);

  res.status(200).send(req.user.courses);
});

router.get("/myStudents/:courseId", auth, isTeacher, async (req, res, next) => {
  if (req.user.courses.indexOf(req.params.courseId) === -1) {
    return res.status(403).send("Forbidden");
  }

  const enrolled = await Enrollment.find({
    course: req.params.courseId,
    ...(req.params.status && {
      status: req.params.status,
    }),
  })
    .select("student status")
    .populate([{ path: "student", select: "name" }]);

  res.status(200).send(enrolled);
});

router.post("/newCourse", auth, isTeacher, async (req, res, next) => {
  const { error } = courseValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let course = await Course.findOne({ code: req.body.code });
  if (course) return res.status(400).send("Course with same code exists");

  course = new Course(req.body);
  await course.save();

  req.user.courses.push(course._id);
  await req.user.save();

  const conversation = await new Conversation({
    grpName: course.name,
    users: req.user._id,
    owner: req.user._id,
    conversationType: "GROUP",
    meta: [{ user: req.user._id, countOfUnseenMessages: 0 }],
  });
  await conversation.save();

  await Teacher.populate(req.user, [{ path: "courses", select: "name" }]);
  res.status(201).send({ Course: course, Teacher: req.user, conversation });
});

router.put("/:courseId", auth, isTeacher, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course with given ID not found");

  if (req.user.courses.indexOf(req.params.courseId) == -1) {
    return res.status(403).send("Forbidden");
  }

  await course.set(req.body).save();

  try {
    res.status(200).send(course);
  } catch (error) {
    next(error);
  }
});

router.put("/status/:enrollmentId", auth, isTeacher, async (req, res, next) => {
  let enrollment = await Enrollment.findById(req.params.enrollmentId).populate([
    { path: "student", select: "name" },
    { path: "course", select: "code name" },
  ]);
  if (!enrollment)
    return res.status(400).send("No student enrolled with given ID");

  await enrollment.set(req.body).save();

  if (enrollment.status === "accepted") {
    let conv = await Conversation.findOne({
      grpName: enrollment.course.name,
      conversationType: "GROUP",
    });
    if (!conv) return res.status(404).send("Conversation not found");

    await conv.users.push(enrollment.student._id);
    await conv.meta.push({
      user: enrollment.student._id,
      countOfUnseenMessages: 0,
    });
    await conv.save();
  }
  res.status(200).send({ enrollment });
});

router.delete("/:courseId", auth, isTeacher, async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course already not found");

  if (req.user.courses.indexOf(req.params.courseId) === -1) {
    return res.status(403).send("Forbidden");
  }

  req.user.courses.splice(req.user.courses.indexOf(req.params.courseId), 1);
  await req.user.save();
  await course.delete();

  try {
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
