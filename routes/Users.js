const express = require("express");
const { User, register, log } = require("../models/user");
const { Teacher } = require("../models/teacher");
const { Student } = require("../models/student");
const multer = require("../middleware/multer");
const cloud = require("../startup/cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const CodeGenerator = require("node-code-generator");
const fs = require("fs");
const router = express.Router();

router.get("/", async (req, res, next) => {
  var op = {
    select: "-password -__v",
    populate: [{ path: "courses", select: "name" }],
  };
  const teachers = await Teacher.paginate({}, op);
  const students = await Student.paginate({}, op);
  res.status(200).send({ Teachers: teachers, Students: students });
});

router.post("/register", multer, async (req, res, next) => {
  const { error } = register(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await Student.findOne({ email: req.body.email });
  if (student) return res.status(400).send("Student exists");

  let img;
  if (req.files) {
    img = await cloud.cloudUpload(req.files[0].path);
  }

  student = new Student({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    image: img ? img.image : undefined,
  });

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arwaabdelrahem22@gmail.com",
      pass: config.get("pass"),
    },
  });

  var mailOptions = {
    from: "arwaabdelrahem22@gmail.com",
    to: req.body.email,
    subject: "Verfication Code",
    text: `your verfication code ${code}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });

  try {
    student.emailVerifingCode = code;
    await student.save();
    if (req.files) fs.unlinkSync(req.files[0].path);
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/verifyCode", async (req, res, next) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send("User with the given email not exits");
  }

  try {
    if (user.emailVerifingCode == req.body.code) {
      user.enabled = true;
      user.emailVerifingCode = "";
      user = await user.save();
      res.status(200).send(user);
    }
  } catch (error) {
    console.log(user.emailVerifingCode);
    res.status(400).send(error.message);
  }
});

router.post("/login", async (req, res, next) => {
  const { error } = log(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password");

  if (user.kind != "Admin") {
    if (!user.enabled) {
      return res.status(401).send("Email not activated");
    }
  }
  const compare = await bcrypt.compare(req.body.password, user.password);
  if (!compare) return res.status(400).send("Invalid email or password");

  const token = user.generateToken();
  res.status(200).send({ User: user, Token: token });
});

module.exports = router;
