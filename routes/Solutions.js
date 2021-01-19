const express = require("express");
const auth = require("../middleware/auth");
const isStudent = require("../middleware/isStudent");
const validate = require("./postValidation");
const { Solution } = require("../models/solution");
const { Question } = require("../models/question");
const { Exam } = require("../models/exam");
const router = express.Router();

router.get("/:examId", async (req, res, next) => {
  const solutions = await Solution.find({
    quiz: req.params.examId,
    status: "done",
  });
  if (!solutions) return res.status(404).send("No Solutions found");

  res.status(200).send(solutions);
});

router.post(
  "/:courseId/:examId",
  auth,
  isStudent,
  validate,
  async (req, res, next) => {
    const sol = await Solution.findOne({
      student: req.user._id,
      quiz: req.params.examId,
    });
    if (sol) return res.status(403).send("you only can submit once");

    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    if (exam.availability === false)
      return res.status(403).send("Exam not available");

    req.body.quiz = req.params.examId;
    req.body.student = req.user._id;

    const solution = new Solution(req.body);
    for (const i in exam.questions) {
      let questions = {
        question: exam.questions[i].question,
      };
      solution.questions.push(questions);
    }

    await solution.save();
    res.status(201).send(solution);
  }
);

router.post(
  "/:courseId/:examId/:solutionId",
  auth,
  isStudent,
  validate,
  async (req, res, next) => {
    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

    let solution = await Solution.findById(req.params.solutionId);
    if (!solution) return res.status(404).send("Sol not found");

    let question = await Question.findById(req.body.questionId);

    for (const i in solution.questions) {
      if (
        solution.questions[i].question.toString() === question._id.toString()
      ) {
        solution.questions[i].answer = req.body.answer;
        if (solution.questions[i].answer === question.modelAnswer) {
          solution.questions[i].correct = true;
          solution.questions[i].mark = exam.questions[i].point;
          await solution.save();
          return res.status(200).send(solution);
        } else {
          solution.questions[i].correct = false;
          solution.questions[i].mark = 0;
        }
      }
    }
    await solution.save();
    res.status(200).send(solution);
  }
);

router.put(
  "/:courseId/:solutionId",
  auth,
  isStudent,
  validate,
  async (req, res, next) => {
    let solution = await Solution.findById(req.params.solutionId);
    if (!solution) return res.status(404).send("Sol not found");

    let total = 0;
    for (const i in solution.questions) {
      total += solution.questions[i].mark;

      solution.set({
        status: "done",
        totalMark: total,
      });
    }

    await solution.save();
    res.status(200).send({ Mark: solution.totalMark, Msg: "Good Luck" });
  }
);

module.exports = router;
