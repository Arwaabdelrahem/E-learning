const express = require("express");
const auth = require("../middleware/auth");
const validate = require("./postValidation");
const isTeacher = require("../middleware/isTeacher");
const { Course } = require("../models/course");
const { Exam } = require("../models/exam");
const { Question } = require("../models/question");
const router = express.Router();

router.get("/:courseId", auth, validate, async (req, res, next) => {
  let exams;
  // Enhance : clean code
  let query = {
    ...(req.user.kind === 'student' && { // if student then add availability: true in query object , if teacher query will be empty
      availability: true
    })
  }
  // if (req.user.kind === "Student") {
  //   exams = await Exam.find({ availability: true });
  //   return res.status(200).send(exams);
  // }
  exams = await Exam.find(query);
  res.status(200).send(exams);
});

router.post("/:courseId", auth, isTeacher, validate, async (req, res, next) => {
  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  // check here only author of course can add exam to it

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
    // only send exam id , no courseId needed
    // let course = await Course.findById(req.params.courseId);
    // if (!course) return res.status(404).send("Course not found");

    
    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");


    // warning : dont update any ids in document
    // you could delete any incomming ids from body of req if sent 
    delete req.body.courseId
    // req.body.course = req.params.courseId; // dont need it , you can update only those sent with body
    await exam.set(req.body).save();

    // await exam.save(); // replace with one line code in above
    res.status(200).send(exam);
  }
);

router.post(
  "/:courseId/:examId/:questionId",
  auth,
  isTeacher,
  validate,
  async (req, res, next) => {
    // only send exam id & question id , no courseId needed
    // let course = await Course.findById(req.params.courseId);
    // if (!course) return res.status(404).send("Course not found");

    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

  // check here only author of course can update exam in it


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

    await exam.questions.push(q); // no await needed here , use await only with event has callback function like save() , delete()
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
    // only send exam id & question id , no courseId needed
    // let course = await Course.findById(req.params.courseId);
    // if (!course) return res.status(404).send("Course not found");

    let exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).send("Exam not found");

  // check here only author of course can add exam to it


    let question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).send("Question not found");

    for (const i in exam.questions) {
      console.log(exam.questions[i].question);
      if (
        exam.questions[i].question.toString() === // perfect
        req.params.questionId.toString()
      ) {
        exam.questions.splice(i, 1);
        await exam.save();
        // Enhance Performance : break if get question , no more loops needed
        break
      }
      return res.status(404).send("Question not exist"); // NO NEEDED
    }

    res.status(200).send(exam);
  }
);
module.exports = router;
