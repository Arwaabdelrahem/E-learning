const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

module.exports = multer({
  storage: storage,
}).any();
