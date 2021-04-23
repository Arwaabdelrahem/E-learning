const notificationService = require("../../services/notification");

module.exports = async (req, res) => {
  const deviceToken = req.body.deviceToken;
  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
  };

  await notificationService.sendNotification(deviceToken, message);
  return res.status(200).json({ message: "successfully sent message" });
};
