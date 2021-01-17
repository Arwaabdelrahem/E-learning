const express = require("express");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const { Course } = require("../models/course");
const { Question } = require("../models/question");
const validate = require("./postValidation");

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

router.post("/:courseId", auth, isTeacher, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  req.body.addedBy = req.user._id;
  req.body.course = req.params.courseId;

  let question = new Question(req.body);
  await question.save();

  await Question.populate(question, [
    { path: "addedBy", select: "name" },
    { path: "course", select: "code name" },
  ]);
  res.status(201).send(question);
});

router.get("/:courseId/:questionId", auth, validate, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  let question = await Question.findById(req.params.questionId);
  if (!question) return res.status(404).send("Question not found");

  await Question.populate(question, [
    { path: "addedBy", select: "name" },
    { path: "course", select: "code name" },
  ]);
  res.status(200).send(question);
});

router.put(
  "/:courseId/:questionId",
  auth,
  isTeacher,
  async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).send("Course not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    req.body.addedBy = req.user._id;
    req.body.course = req.params.courseId;

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
  async (req, res, next) => {
    let course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).send("Course not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    await question.delete();
    res.status(200);
  }
);

module.exports = router;
