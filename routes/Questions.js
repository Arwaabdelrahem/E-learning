const express = require("express");
const auth = require("../middleware/auth");
const isTeacher = require("../middleware/isTeacher");
const { Choice } = require("../models/choice");
const { TorF } = require("../models/TorF");
const { Course } = require("../models/course");
const { Question } = require("../models/question");
const models = require('../models')
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

  // here check only the author of course can add question
  // .....

  req.body.addedBy = req.user._id;
  req.body.course = req.params.courseId;

  /* Enhance : clean code */
  let type = req.body.type // type of question send in body of req as TorF OR Choice
  let question = new models[type](req.body).save() // less code more logic , access as models['TorF'] is equal to models.TorF
  res.status(201).send(question);
  /****** */ 
  // let question;
  // if (req.body.choices) {
  //   question = new Choice(req.body);
  // }

  // question = new TorF(req.body);
  // await question.save();

  // res.status(201).send(question);
});

router.get("/:courseId/:questionId", auth, validate, async (req, res, next) => {
  // no courseId and course needed here , only questionId
  // let course = await Course.findById(req.params.courseId);
  // if (!course) return res.status(404).send("Course not found");

  let question = await Question.findById(req.params.questionId);
  if (!question) return res.status(404).send("Question not found");


  // here check only the author of course can get question from bank question of course
  // .....

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
  // no courseId and course needed here , only questionId
    // let course = await Course.findById(req.params.courseId);
    // if (!course) return res.status(404).send("Course not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");


  // here check only the author of course can update question
  // .....

    // WARNING : ids in document not updated like addedBy and Course
    req.body.addedBy = req.user._id;
    req.body.course = req.params.courseId;

    // you could to add this check to remove any incomming ids from body of req sent 
    delete req.body.addedBy
    delete req.body.courseId

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
  // no courseId and course needed here , only questionId
  async (req, res, next) => {
    // let course = await Course.findById(req.params.courseId);
    // if (!course) return res.status(404).send("Course not found");

    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");


  // here check only the author of course can delete question
  // .....

    await question.delete();
    res.status(200).send("Question deleted"); // 204 status with delete req
  }
);

module.exports = router;
