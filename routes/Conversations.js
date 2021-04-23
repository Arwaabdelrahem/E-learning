const express = require("express");
const conversationCntrl = require("../controllers/Conversation");
const auth = require("../middleware/auth");
const router = express.Router();

router.use(auth);
router.get("/conversations", conversationCntrl.fetchAll);
router.get(
  "/conversations/:id/messages",
  conversationCntrl.fetchMessagesForCoversation
);

module.exports = router;
