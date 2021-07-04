const express = require("express");
const auth = require("../middleware/auth");
const isStudent = require("../middleware/isStudent");
const { Course } = require("../models/course");
const { Enrollment } = require("../models/enrollment");
const { Exam } = require("../models/exam");
const { Solution } = require("../models/solution");
const validate = require("./postValidation");
const _ = require("lodash");

const router = express.Router();

router.get("/myEnrollment", auth, isStudent, async (req, res, next) => {
  let query = {
    student: req.user._id,
    ...(req.query.status !== undefined && {
      status: req.query.status,
    }),
  };

  const enrollment = await Enrollment.find(query)
    .select("course status ")
    .populate([{ path: "course", select: "name code" }]);

  res.status(200).send(enrollment);
});

router.get("/liveCourses", auth, isStudent, async (req, res, next) => {
  const courses = await Course.find({
    finishingDate: { $gt: new Date(new Date().toUTCString()) },
    startingDate: { $lte: new Date(new Date().toUTCString()) },
  });

  res.status(200).send(courses);
});

router.get("/notLiveCourses", auth, isStudent, async (req, res, next) => {
  const courses = await Course.find({
    $or: [
      { finishingDate: { $lte: new Date(new Date().toUTCString()) } },
      { startingDate: { $gt: new Date(new Date().toUTCString()) } },
    ],
  });

  res.status(200).send(courses);
});

router.get(
  "/modelAnswer/:courseId/:examId",
  auth,
  isStudent,
  validate,
  async (req, res, next) => {
    let exam = await Exam.findById(req.params.examId)
      .populate([{ path: "questions.question", select: "head modelAnswer" }])
      .select("title questions -students");
    exam = exam.toJSON({ virtuals: true });

    let solution = await Solution.findOne({
      quiz: req.params.examId,
      student: req.user._id,
    });

    let studentAnswer = [];
    _.find(solution.questions, (q) => {
      studentAnswer.push({ question: q.question, answer: q.answer });
    });

    _.find(exam.questions, (q) => {
      delete q.id;
      delete q.question._id;
      delete q.question.id;
    });

    delete exam.id;
    exam.studentAnswer = studentAnswer;
    res.status(200).json(exam);
  }
);

router.post("/enroll", auth, isStudent, async (req, res, next) => {
  const course = await Course.findOne({ code: req.query.code });
  if (!course)
    return res.status(404).send("Course Not found, please enter valid code");

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
