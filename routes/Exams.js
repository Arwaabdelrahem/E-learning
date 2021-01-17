const express = require("express");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const { Course } = require("../models/course");
const { Exam } = require("../models/exam");
const { Question } = require("../models/question");
const router = express.Router();

router.post("/:courseId", auth, isTeacher, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  req.body.course = req.params.courseId;
  let exam = new Exam(req.body);
  await exam.save();

  res.status(201).send(exam);
});

router.put("/:courseId/:examId", auth, isTeacher, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  let exam = await Exam.findById(req.params.examId);
  if (!exam) return res.status(404).send("Exam not found");

  req.body.course = req.params.courseId;
  await exam.set(req.body);

  res.status(200).send(exam);
});

router.post(
  "/:courseId/:examId/:questionId",
  auth,
  isTeacher,
  async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).send("Course not found");

    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    let q = {
      question: req.params.questionId,
      point: req.body.point,
    };

    await exam.questions.push(q);
    await exam.save();
    res.status(200).send(exam);
  }
);

router.delete(
  "/:courseId/:examId/:questionId",
  auth,
  isTeacher,
  async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).send("Course not found");

    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    for (const i in exam.questions) {
      if (
        exam.questions[i].question.toString() ===
        req.params.questionId.toString()
      ) {
        exam.questions.splice(i, 1);
        await exam.save();
      }
    }

    res.status(200).send(exam);
  }
);
module.exports = router;