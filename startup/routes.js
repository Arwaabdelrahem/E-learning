const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("../routes/Admin");
const user = require("../routes/Users");
const teacher = require("../routes/Teachers");
const material = require("../routes/Materials");
const timeline = require("../routes/Timeline");
const student = require("../routes/Students");
const question = require("../routes/Questions");
const exam = require("../routes/Exams");
const solution = require("../routes/Solutions");
const rate = require("../routes/Rate");
const notifications = require('../routes/Notification')
const { errorHandler, serverErrorHandler } = require("../middleware/error");

module.exports = function (app) {
  app.use(cors());
  app.use("Uploads", express.static("Uploads"));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use("/admin", admin);
  app.use("/users", user);
  app.use("/teachers", teacher);
  app.use("/students", student);
  app.use("/teachers/material", material);
  app.use("/questions", question);
  app.use("/exams", exam);
  app.use("/solutions", solution);
  app.use("/rates", rate);
  app.use("/timeline", timeline);
  app.use(notifications)
  app.use(errorHandler);
  app.use(serverErrorHandler);
};
