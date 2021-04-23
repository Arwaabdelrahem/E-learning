const { Course } = require("../models/course");
const { Enrollment } = require("../models/enrollment");
const { Material } = require("../models/material");
const { Notification } = require("../models/notification");
const cloud = require("../startup/cloudinary");
const fs = require("fs");

exports.newMaterial = async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");
  req.body.course = req.params.courseId;

  if (req.user.courses.indexOf(req.params.courseId) === -1) {
    return res.status(403).send("Forbidden");
  }

  let img;
  if (req.files.length != 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  req.body.type = img ? "Image" : "videoLink";

  let material = new Material(req.body);
  material.link = req.body.image;
  await material.save();

  try {
    // Send Notification in-app
    const clients = await Enrollment.find({
      course: req.params.courseId,
      status: "accepted",
    }).populate("student");
    const targetUsers = clients.map((user) => user.student);
    const notification = await new Notification({
      title: "New Material",
      body: `new material added to course ${course.name}`,
      user: req.user._id,
      targetUsers: targetUsers,
      subjectType: "Material",
      subject: material._id,
    }).save();

    // push notifications
    const receivers = targetUsers;
    for (let i = 0; i < receivers.length; i++) {
      await receivers[i].sendNotification(
        notification.toFirebaseNotification()
      );
    }

    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    await Material.populate(material, [{ path: "course", select: "name" }]);
    res.status(201).send(material);
  } catch (error) {
    next(error);
  }
};
