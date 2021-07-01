const express = require("express");
const mediaUpload = require("../controllers/mediaUpload");
const auth = require("../middleware/auth");
const router = express.Router();

router.post("/upload", mediaUpload);

module.exports = router;
