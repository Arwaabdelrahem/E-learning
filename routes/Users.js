const express = require("express");
const { User, register, log } = require("../models/user");
const { Student } = require("../models/student");
const multer = require("../middleware/multer");
// const cloud = require("../startup/cloudinary");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const CodeGenerator = require("node-code-generator");
const fs = require("fs");
const smsService = require("../services/sms");

const router = express.Router();

router.get("/", async (req, res, next) => {
  var op = {
    select: "-password -__v",
    populate: [{ path: "courses", select: "name" }],
  };

  const users = await User.paginate({ kind: ["Student", "Teacher"] }, op);
  res.status(200).send(users);
});

router.post("/register", multer, async (req, res, next) => {
  const { error } = register(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await Student.findOne({ email: req.body.email });
  if (student) return res.status(400).send("Student exists");

  let img;
  if (req.files) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  var generator = new CodeGenerator();
  const code = generator.generateCodes("#+#+#+", 100)[0];

  try {
    await smsService.sendVerificationCode(req.body.phone);
    console.log("Code Sent Successfully.");
  } catch (error) {
    console.log(error);
  }

  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "arwaabdelrahem2@gmail.com",
      pass: process.env.APP_PASSWORD,
    },
  });

  var mailOptions = {
    from: "arwaabdelrahem2@gmail.com",
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
    req.body.emailVerifingCode = code;
    student = new Student(req.body);
    await student.save();
    if (req.files) fs.unlinkSync(req.files[0].path);
    res.status(201).send(student);
  } catch (error) {
    next(error);
  }
});

router.post("/verifyPhoneCode", async (req, res, next) => {
  let user = await User.findOne({ phone: req.body.phone });
  if (!user) {
    return res.status(404).send("User with the given phone not exits");
  }

  var verificationResult = await smsService.verificationCode(
    req.body.phone,
    req.body.code
  );

  try {
    if (verificationResult.status === "approved") {
      user.enabled = true;
      user.emailVerifingCode = "";
      user = await user.save();
      res.status(200).send(user);
    } else {
      return res.status(400).send("Code is invailed");
    }
  } catch (error) {
    next(error);
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
    next(error);
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
