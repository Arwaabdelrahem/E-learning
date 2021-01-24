const express = require("express");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const { Choice } = require("../models/choice");
const { TorF } = require("../models/TorF");
const { Question } = require("../models/question");
const validate = require("./postValidation");
const { Exam } = require("../models/exam");
const { Solution } = require("../models/solution");
const _ = require("lodash");

//const models = require("../models");

const router = express.Router();

router.get("/:courseId", auth, validate, async (req, res, next) => {
  const questions = await Question.paginate(
    { course: req.params.courseId },
    {
      populate: [
        { path: "addedBy", select: "name" },
        { path: "course", select: "code name" },
      ],
    }
  );
  res.status(200).send(questions);
});

router.post("/:courseId", auth, isTeacher, validate, async (req, res, next) => {
  req.body.addedBy = req.user._id;
  req.body.course = req.params.courseId;

  // let type = req.body.type;
  // //let question = new models[type](req.body).save();
  // let question = new models.TorF(req.body).save();

  let question;
  if (req.body.choices) {
    question = new Choice(req.body);

    await question.save();
    return res.status(201).send(question);
  }

  question = new TorF(req.body);
  await question.save();

  res.status(201).send(question);
});

router.get(
  "/:courseId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    await Question.populate(question, [
      { path: "addedBy", select: "name" },
      { path: "course", select: "code name" },
    ]);
    res.status(200).send(question);
  }
);

router.put(
  "/:courseId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    delete req.body.addedBy;
    delete req.body.courseId;

    await question.set(req.body).save();
    await Question.populate(question, [
      { path: "addedBy", select: "name" },
      { path: "course", select: "code name" },
    ]);

    res.status(200).send(question);
  }
);

router.delete(
  "/:courseId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    let exam = await Exam.find({ "questions.question": req.params.questionId });
    let solution = await Solution.find({
      "questions.question": req.params.questionId,
    });

    for (const i in exam) {
      const eQuestion = _.findKey(exam[i].questions, (q) => {
        if (q.question.toString() === req.params.questionId) return "index";
      });
      if (eQuestion) {
        exam[i].questions.splice(eQuestion, 1);
        await exam[i].save();
      }
    }

    for (const i in solution) {
      const sQuestion = _.findKey(solution[i].questions, (q) => {
        if (q.question.toString() === req.params.questionId) return "index";
      });
      if (sQuestion) {
        solution[i].questions.splice(sQuestion, 1);
        await solution[i].save();
      }
    }

    await question.delete();
    res.status(204).send("Deleted");
  }
);

module.exports = router;
