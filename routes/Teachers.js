const express = require("express");
const { Course, courseValidate } = require("../models/course");
const { Teacher } = require("../models/teacher");
const isTeacher = require("../middleware/isTeacher");
const { Enrollment } = require("../models/enrollment");
const router = express.Router();

router.get("/myCourses", isTeacher, async (req, res, next) => {
  const teacher = await Teacher.findById(req.user._id)
    .select("courses")
    .populate([{ path: "courses", select: "name code" }]);
  if (!teacher) return res.status(404).send("Teacher with given id not exists");

  res.status(200).send(teacher);
});

router.get("/myStudents/:courseId", isTeacher, async (req, res, next) => {
  const teacher = await Teacher.findById(req.user._id);

  for (const i in teacher.courses) {
    if (teacher.courses.indexOf(req.params.courseId) == -1) {
      return res.status(403).send("Forbidden");
    }
  }
  const enrolled = await Enrollment.find({
    course: req.params.courseId,
  })
    .select("student status")
    .populate([{ path: "student", select: "name" }]);

  res.status(200).send(enrolled);
});

router.post("/newCourse", isTeacher, async (req, res, next) => {
  const { error } = courseValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let teacher = await Teacher.findById(req.user._id);
  if (!teacher) return res.status(404).send("Teacher with given id not exists");

  let course = await Course.findOne({ code: req.body.code });
  if (course) return res.status(400).send("Course with same code exists");

  course = new Course({
    code: req.body.code,
    name: req.body.name,
    description: req.body.description,
    startingDate: req.body.startingDate,
    finishingDate: req.body.finishingDate,
  });

  await course.save();
  if (teacher.courses.indexOf(course._id) == -1) {
    teacher.courses.push(course._id);
    await teacher.save();
  }
  await Teacher.populate(teacher, [{ path: "courses", select: "name" }]);
  res.status(201).send({ Course: course, Teacher: teacher });
});

router.put("/:courseId", isTeacher, async (req, res, next) => {
  let teacher = await Teacher.findById(req.user._id);
  if (!teacher) return res.status(404).send("Teacher with given ID not found");

  let course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course with given ID not found");

  if (teacher.courses.indexOf(req.params.courseId) == -1) {
    return res.status(403).send("Forbidden");
  }

  for (const i in teacher.courses) {
    if (teacher.courses[i]._id == req.params.courseId) {
      course = course.set({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        startingDate: req.body.startingDate,
        finishingDate: req.body.finishingDate,
      });
    }
  }

  try {
    await course.save();
    res.status(200).send(course);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put("/status/:studentId", isTeacher, async (req, res, next) => {
  let enrollment = await Enrollment.find({
    student: req.params.studentId,
  }).populate([
    { path: "student", select: "name" },
    { path: "course", select: "code name" },
  ]);
  if (!enrollment)
    return res.status(400).send("No student enrolled with given ID");

  for (const i in enrollment) {
    enrollment = enrollment[i].set({
      status: req.body.newStatus,
    });
    await enrollment.save();
  }

  res.status(200).send(enrollment);
});

router.delete("/:courseId", isTeacher, async (req, res, next) => {
  let teacher = await Teacher.findById(req.user._id);
  if (!teacher) return res.status(404).send("Teacher with given ID not found");

  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course already not found");

  if (teacher.courses.indexOf(req.params.courseId) == -1) {
    return res.status(403).send("Forbidden");
  }

  for (const i in teacher.courses) {
    if (teacher.courses[i]._id == req.params.courseId) {
      teacher.courses.splice(i, 1);
      await teacher.save();
    }
  }

  try {
    course.delete();
    res.status(200).send(teacher);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = router;
