const express = require("express");
const { Teacher, teacherValidate } = require("../models/teacher");
const bcrypt = require("bcrypt");
const isAdmin = require("../middleware/isAdmin");
const auth = require("../middleware/auth");
const { User } = require("../models/user");
const router = express.Router();

router.get("/students", auth, isAdmin, async (req, res, next) => {
  let students;
  if (req.query.search) {
    const text = req.query.search;
    const Regex = new RegExp(text, "gi");
    students = await User.find({
      name: req.query.search == "" ? /^$|/ : Regex,
      kind: "Student",
    });

    res.status(200).send(students);
  } else {
    students = await User.find({ kind: "Student" });
    res.status(200).send(students);
  }
});



router.get("/test", async (req, res, next) => {
  let user = await User.findOne()
  await user.set({enabled: true}).save()
  return res.json(user)
});


router.post("/addTeacher", auth, isAdmin, async (req, res, next) => {
  const { error } = teacherValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  req.body.password = await bcrypt.hash(req.body.password, 10);
  req.body.enabled = true;
  const teacher = new Teacher(req.body);

  try {
    await teacher.save();
    res.status(201).send(teacher);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/activate/:id", async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if (!user) return res.status(400).send("User doesnot exits");

  user.enabled ? (user.enabled = false) : (user.enabled = true);

  try {
    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = router;
