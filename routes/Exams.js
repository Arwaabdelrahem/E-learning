const express = require("express");
const auth = require("../middleware/auth");
const validate = require("./postValidation");
const isTeacher = require("../middleware/isTeacher");
const { Exam } = require("../models/exam");
const { Question } = require("../models/question");
const { Solution } = require("../models/solution");
const _ = require("lodash");
const moment = require("moment");

const router = express.Router();

router.get("/:courseId", auth, validate, async (req, res, next) => {
  let query = {
    ...(req.user.kind === "Student" && {
      students: { $elemMatch: { student: req.user._id } },
    }),
    ...(req.user.kind !== "Student" && {
      availability: true,
    }),
  };
  const exams = await Exam.paginate(query, {
    ...(req.user.kind === "Student" && {
      select: {
        questions: 1,
        points: 1,
      },
    }),
    ...(req.user.kind !== "Student" && {
      select: "-students ",
    }),
  });

  res.status(200).send(exams);
});

router.get("/:courseId/:examId", auth, validate, async (req, res, next) => {
  let query = {
    _id: req.params.examId,
    ...(req.user.kind === "Student" && {
      availability: true,
    }),
  };
  let exam = await Exam.findOne(query).select("-students");

  let remainingTime;
  if (req.user.kind === "Student") {
    let solution = await Solution.findOne({
      quiz: req.params.examId,
      student: req.user._id,
    });
    if (!solution) return res.status(404).send("Solution not found");

    remainingTime = moment(solution.createdAt)
      .add(exam.duration, "m")
      .diff(new Date(new Date().toUTCString()), "s");
  }

  exam.remainingTime = remainingTime;
  res.status(200).send(exam);
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
    let exam = await Exam.findById(req.params.examId).select("-students");
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
    let exam = await Exam.findById(req.params.examId).select("-students");
    if (!exam) return res.status(404).send("Exam not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    let q = {
      question: req.params.questionId,
      point: req.body.point,
    };

    const eQuestion = _.findKey(exam.questions, (q) => {
      if (q.question.toString() === req.params.questionId.toString())
        return "index";
    });
    if (eQuestion) return res.status(400).send("Question exists");

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
    let exam = await Exam.findById(req.params.examId).select("-students");
    if (!exam) return res.status(404).send("Exam not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    const eQuestion = _.findKey(exam.questions, (q) => {
      if (q.question.toString() === req.params.questionId.toString())
        return "index";
    });

    if (eQuestion) {
      exam.questions.splice(eQuestion, 1);
      await exam.save();
    }

    res.status(204).send(exam);
  }
);
module.exports = router;
