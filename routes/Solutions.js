const express = require("express");
const auth = require("../middleware/auth");
const isStudent = require("../middleware/isStudent");
const isTeacher = require("../middleware/isTeacher");
const validate = require("./postValidation");
const { Solution } = require("../models/solution");
const { Question } = require("../models/question");
const { Exam } = require("../models/exam");
const solutionCntrl = require("../controllers/solutions");
const router = express.Router();

router.get(
  "/:courseId/:examId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let query = {
      quiz: req.params.examId,
      ...(req.body.status && {
        status: req.body.status,
      }),
    };
    const solutions = await Solution.find(query);
    if (solutions.length === 0)
      return res.status(404).send("No Solutions found");

    res.status(200).send(solutions);
  }
);

router.get("/marks", auth, async (req, res, next) => {
  let solution = await Solution.findOne({ student: req.user._id });
  if (!solution) return res.status(404).send("Solution not found");

  await Solution.populate(solution, [
    { path: "quiz", populate: [{ path: "course", select: "name code" }] },
  ]);
  res.status(200).send({ Exam: solution.quiz, Marks: solution.mark });
});

router.post(
  "/new/:courseId/:examId",
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
    await solution.save();

    res.status(201).send(solution);
  }
);

router.post(
  "/submit/:courseId/:examId",
  auth,
  isStudent,
  validate,
  async (req, res, next) => {
    let solution = await Solution.findOne({
      quiz: req.params.examId,
      student: req.user._id,
      status: "solving",
    });
    if (!solution) return res.status(404).send("Solution not found");

    let question = await Question.findById(req.body.question);
    if (!question) return res.status(404).send("Question not found");

    for (const i in solution.questions) {
      if (
        solution.questions[i].question.toString() === question._id.toString()
      ) {
        solution.questions[i].set(req.body);
        await solution.save();
        return res.status(200).send(solution);
      }
    }
    solution.questions.push(req.body);
    await solution.save();
    res.status(200).send(solution);
  }
);

router.post("/done/:examId", auth, solutionCntrl.correctExam);

module.exports = router;
