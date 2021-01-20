const express = require("express");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const { Choice } = require("../models/choice");
const { TorF } = require("../models/TorF");
const { Question } = require("../models/question");
const validate = require("./postValidation");
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
  // let question = new models[type](req.body).save();
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

    await question.delete();
    res.status(204);
  }
);

module.exports = router;
