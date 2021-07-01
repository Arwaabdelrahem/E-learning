const $baseCtrl = require("./$baseCtrl");
const cloudinaryStorage = require("./cloudinaryStorage");
const { Media } = require("../models/media");

module.exports = $baseCtrl(
  [{ name: "file", maxCount: 1 }],
  cloudinaryStorage,
  async (req, res, next) => {
    req.body.file = req.files["file"][0].secure_url;

    let newMedia = new Media(req.body);
    await newMedia.save();
    res.status(201).send(newMedia);
  }
);
