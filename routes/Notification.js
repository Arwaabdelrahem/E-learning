const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// public end point
router.post(
  "/notifications",
  require("../controllers/NotificationCtrl/sendNotification")
); // dev
router.post(
  "/notify-clients",
  require("../controllers/NotificationCtrl/sendToAll")
);

router.use(auth);

// private end points

router.get(
  "/notifications",
  require("../controllers/NotificationCtrl/fetchAll")
);
router.post(
  "/notifications/subscribe",
  require("../controllers/NotificationCtrl/subscribe")
);
router.post(
  "/notifications/unsubscribe",
  require("../controllers/NotificationCtrl/unsubscribe")
);
router.get(
  "/notifications/count",
  require("../controllers/NotificationCtrl/numberOfUnseen")
);

module.exports = router;
