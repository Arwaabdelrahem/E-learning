const { Exam } = require("../models/exam");
const { Notification } = require("../models/notification");
const { Solution } = require("../models/solution");

exports.correctExam = async (req, res, next) => {
  let exam = await Exam.findById(req.params.examId).populate(
    "questions.question"
  );
  if (!exam) return res.status(404).send("Exam not found");

  let solution = await Solution.findOne({
    quiz: exam._id,
    student: req.user._id,
  })
    .select("quiz questions student")
    .populate("student ");
  if (!solution) return res.status(404).send("Solution not found");

  try {
    for (const i in solution.questions) {
      for (const j in exam.questions) {
        if (
          solution.questions[i].question.toString() ===
          exam.questions[j].question._id.toString()
        ) {
          if (
            solution.questions[i].answer ===
            exam.questions[j].question.modelAnswer
          ) {
            solution.questions[i].correct = true;
            solution.questions[i].mark = exam.questions[j].point;
          } else {
            solution.questions[i].correct = false;
            solution.questions[i].mark = 0;
          }
          break;
        }
      }
    }

    solution.status = "done";
    solution.submittedAt = new Date(new Date().toUTCString());
    await solution.save();

    await exam.students.push({ student: req.user._id, solution: solution._id });
    await exam.save();

    // Send Notification in-app
    const clients = solution.student;
    const targetUsers = solution.student._id;
    const notification = await new Notification({
      title: " Exam Results",
      body: `you have got ${solution.mark} in ${exam.title}`,
      user: req.user._id,
      targetUsers: targetUsers,
      subjectType: "Exam",
      subject: exam._id,
    }).save();

    // push notifications
    const receivers = clients;
    await receivers.sendNotification(notification.toFirebaseNotification());

    res.status(200).send({ solution, Mark: solution.mark });
  } catch (error) {
    next(error);
  }
};
