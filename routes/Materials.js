const express = require("express");
const { Material } = require("../models/material");
const { Teacher } = require("../models/teacher");
const { Course } = require("../models/course");
const cloud = require("../startup/cloudinary");
const isTeacher = require("../middleware/isTeacher");
const multer = require("../middleware/multer");
const fs = require("fs");
const router = express.Router();

router.get("/:courseId", isTeacher, async (req, res, next) => {
  const teacher = await Teacher.findById(req.user._id);

  for (const i in teacher.courses) {
    if (teacher.courses.indexOf(req.params.courseId) == -1) {
      return res.status(403).send("Forbidden");
    }

    if (teacher.courses[i]._id == req.params.courseId) {
      const material = await Material.paginate(
        { course: req.params.courseId },
        { populate: [{ path: "course", select: "name" }] }
      );
      return res.status(200).send(material);
    }
  }
});

router.post("/:courseId", isTeacher, multer, async (req, res, next) => {
  let material;
  const teacher = await Teacher.findById(req.user._id);
  if (!teacher) return res.status(404).send("Teacher not found");

  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).send("Course not found");

  let img;
  if (req.files.length != 0) {
    img = await cloud.cloudUpload(req.files[0].path);
  }

  for (const i in teacher.courses) {
    if (teacher.courses.indexOf(req.params.courseId) == -1) {
      return res.status(403).send("Forbidden");
    }

    if (teacher.courses[i]._id == req.params.courseId) {
      material = new Material({
        link: img ? img.image : req.body.image,
        course: req.params.courseId,
        type: img ? req.files[0].mimetype : "videoLink",
        description: req.body.description,
      });
      await material.save();
    }
  }
  try {
    if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
    await Material.populate(material, [{ path: "course", select: "name" }]);
    res.status(201).send(material);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.put(
  "/:courseId/:materialId",
  isTeacher,
  multer,
  async (req, res, next) => {
    const teacher = await Teacher.findById(req.user._id);
    if (!teacher) return res.status(404).send("Teacher not found");

    let material = await Material.findById(req.params.materialId);
    if (!material) return res.status(404).send("Material Not found");

    let img;
    if (req.files.length != 0) {
      img = await cloud.cloudUpload(req.files[0].path);
    }

    for (const i in teacher.courses) {
      if (teacher.courses.indexOf(req.params.courseId) == -1) {
        return res.status(403).send("Forbidden");
      }

      if (teacher.courses[i]._id == req.params.courseId) {
        material = material.set({
          link: img ? img.image : req.body.image,
          type: img ? req.files[0].mimetype : "videoLink",
          description: req.body.description,
        });
        await material.save();
      }
    }
    try {
      if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
      await Material.populate(material, [{ path: "course", select: "name" }]);
      res.status(201).send(material);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
);

router.delete("/:courseId/:materialId", isTeacher, async (req, res, next) => {
  const teacher = await Teacher.findById(req.user._id);
  if (!teacher) return res.status(404).send("Teacher not found");

  let material = await Material.findById(req.params.materialId);
  if (!material) return res.status(404).send("Material Not found");

  if (teacher.courses.indexOf(req.params.courseId) == -1) {
    return res.status(403).send("Forbidden");
  }

  try {
    material.delete();
    res.status(204);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
