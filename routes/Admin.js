const express = require("express");
const { Teacher, teacherValidate } = require("../models/teacher");
const bcrypt = require("bcrypt");
const isAdmin = require("../middleware/isAdmin");
const { User } = require("../models/user");
const router = express.Router();

router.get("/students", isAdmin, async (req, res, next) => {
  let students;
  if (req.body.search) {
    const text = "^" + req.body.search;
    const Regex = new RegExp(text, "gi");
    students = await User.find({
      name: req.body.search == "" ? /^$|/ : Regex,
      kind: "Student",
    });
    res.status(200).send(students);
  } else {
    students = await User.find({ kind: "Student" });
    res.status(200).send(students);
  }
});

router.post("/addTeacher", isAdmin, async (req, res, next) => {
  const { error } = teacherValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = new Teacher({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    enabled: true,
    isTeacher: true,
  });

  try {
    await teacher.save();
    res.status(201).send(teacher);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/activate/:id", async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User doesnot exits");

  if (user.enabled) {
    user.enabled = false;
  } else {
    user.enabled = true;
  }
  try {
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = router;
