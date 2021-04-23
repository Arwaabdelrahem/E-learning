const express = require("express");
const rateController = require("../controllers/rate");
const auth = require("../middleware/auth");
const router = express.Router();


router.get("/teachers/:id", auth, rateController.fetchAll);
router.get("/courses/:id", auth, rateController.fetchAll);
router.post("/teachers/:id", auth, rateController.newRate);
router.post("/courses/:id", auth, rateController.newRate);

module.exports = router;
