const express = require("express");
const auth = require("../middleware/auth");
const validate = require("./postValidation");
const isTeacher = require("../middleware/isTeacher");
const { Exam } = require("../models/exam");
const { Question } = require("../models/question");
const router = express.Router();

router.get("/:courseId", auth, validate, async (req, res, next) => {
  let query = {
    ...(req.user.kind === "Student" && {
      availability: true,
    }),
  };

  const exams = await Exam.find(query);
  res.status(200).send(exams);
});

router.post("/:courseId", auth, isTeacher, validate, async (req, res, next) => {
  req.body.course = req.params.courseId;
  let exam = new Exam(req.body);
  await exam.save();

  res.status(201).send(exam);
});

router.put(
  "/:courseId/:examId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    delete req.body.courseId;
    await exam.set(req.body).save();

    res.status(200).send(exam);
  }
);

router.post(
  "/:courseId/:examId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    let q = {
      question: req.params.questionId,
      point: req.body.point,
    };

    for (const i in exam.questions) {
      if (exam.questions[i].question.toString() === req.params.questionId)
        return res.status(400).send("Question exists");
    }

    exam.questions.push(q);
    await exam.save();
    res.status(200).send(exam);
  }
);

router.delete(
  "/:courseId/:examId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
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
        break;
      }
    }

    res.status(200).send(exam);
  }
);
module.exports = router;
