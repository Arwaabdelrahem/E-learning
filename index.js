const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("./routes/Admin");
const user = require("./routes/Users");
const teacher = require("./routes/Teachers");
const material = require("./routes/Materials");
const timeline = require("./routes/Timeline");
const student = require("./routes/Students");
const { errorHandler, serverErrorHandler } = require("./middleware/error");

const app = express();

require("./startup/DB")();
app.use(cors());
app.use("Uploads", express.static("Uploads"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/admin", admin);
app.use("/users", user);
app.use("/teachers", teacher);
app.use("/students", student);
app.use("/teachers/material", material);
app.use("/timeline", timeline);
app.use(errorHandler);
app.use(serverErrorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
