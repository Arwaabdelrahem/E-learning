const express = require("express");
const { Material } = require("../models/material");
const cloud = require("../startup/cloudinary");
const isTeacher = require("../middleware/isTeacher");
const multer = require("../middleware/multer");
const fs = require("fs");
const auth = require("../middleware/auth");
const { Enrollment } = require("../models/enrollment");
const materialCntrl = require("../controllers/materials");
const router = express.Router();

router.get("/:courseId", auth, async (req, res, next) => {
  if (req.user.kind === "Teacher") {
    if (req.user.courses.indexOf(req.params.courseId) === -1) {
      return res.status(403).send("Forbidden");
    }
  }

  if (req.user.kind === "Student") {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
      status: "accepted",
    });
    if (!enrollment) return res.status(400).send("please enroll first");
  }

  const materials = await Material.paginate({ course: req.params.courseId });
  res.status(200).send(materials);
});

router.post("/:courseId", auth, isTeacher, multer, materialCntrl.newMaterial);

router.put("/:materialId", auth, isTeacher, multer, async (req, res, next) => {
  let material = await Material.findById(req.params.materialId);
  if (!material) return res.status(404).send("Material Not found");

  if (req.user.courses.indexOf(material.course) === -1) {
    return res.status(403).send("Forbidden");
  }

  let img;
  if (req.files.length !== 0) {
    img = await cloud.cloudUpload(req.files[0].path);
    req.body.image = img.image;
  }

  req.body.type = img ? "Image" : "videoLink";

  material.link = req.body.image;
  material = material.set(req.body);
  await material.save();

  try {
    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    await Material.populate(material, [{ path: "course", select: "name" }]);
    res.status(201).send(material);
  } catch (error) {
    next(error);
  }
});

router.delete("/:materialId", auth, isTeacher, async (req, res, next) => {
  let material = await Material.findById(req.params.materialId);
  if (!material) return res.status(404).send("Material Not found");

  if (req.user.courses.indexOf(material.course) === -1) {
    return res.status(403).send("Forbidden");
  }

  try {
    await material.delete();
    res.status(204).send("Deleted successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
