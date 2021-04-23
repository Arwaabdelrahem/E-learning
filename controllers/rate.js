const { Course } = require("../models/course");
const { Teacher } = require("../models/teacher");
const { Rate } = require("../models/rate");

exports.newRate = async (req, res, next) => {
  const path = req.route.path.split("/");
  let subjectType = path[1] === "teachers" ? "Teacher" : "Course";

  let obj;
  if (subjectType === "Course") {
    obj = await Course.findById(req.params.id);
    if (!obj) return res.status(404).send("Course not found");
  } else {
    obj = await Teacher.findById(req.params.id);
    if (!obj) return res.status(404).send("Teacher not found");
  }

  let rate = await Rate.findOne({
    user: req.user._id,
    subjectType,
    subject: obj._id,
  });
  if (rate) {
    await rate.set(req.body).save();
  } else {
    req.body.user = req.user._id;
    req.body.subjectType = subjectType;
    req.body.subject = obj._id;
    rate = new Rate(req.body);
    await rate.save();
  }

  let countRate = [];
  let numberOfRates = 0;
  let rating, count;
  for (let i = 1; i <= 5; i++) {
    rating = await Rate.countDocuments({
      subject: obj._id,
      subjectType,
      rating: i,
    });
    countRate.push(rating);

    count = i * countRate[i - 1];
    numberOfRates += count;
  }

  let countAll = await Rate.countDocuments({
    subject: obj._id,
    subjectType,
  });

  let newRating = numberOfRates / countAll;

  obj.rating = newRating;
  await obj.save();
  await Rate.populate(rate, [
    { path: "user", select: "name" },
    { path: "subject", select: "name rating" },
  ]);
  res.status(200).send(rate);
};

exports.fetchAll = async (req, res, next) => {
  const path = req.route.path.split("/");
  let subjectType = path[1] === "teachers" ? "Teacher" : "Course";

  let rates = await Rate.paginate(
    { subjectType, subject: req.params.id },
    {
      sort: "-createdAt",
      populate: [
        { path: "user", select: "name" },
        { path: "subject", select: "name rating" },
      ],
    }
  );

  res.status(200).send(rates);
};
