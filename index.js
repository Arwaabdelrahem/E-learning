const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("./routes/Admin");
const user = require("./routes/Users");
const teacher = require("./routes/Teachers");
const material = require("./routes/Materials");
const timeline = require("./routes/Timeline");
const student = require("./routes/Students");
const question = require("./routes/Questions");
const { errorHandler, serverErrorHandler } = require("./middleware/error");
const exam = require("./routes/Exams");

const app = express();

require("./startup/DB")();
app.use(cors());
app.use("Uploads", express.static("Uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
require("./startup/production")(app);

app.use("/admin", admin);
app.use("/users", user);
app.use("/teachers", teacher);
app.use("/students", student);
app.use("/teachers/material", material);
app.use("/questions", question);
app.user("/exams", exam);
app.use("/timeline", timeline);
app.use(errorHandler);
app.use(serverErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
