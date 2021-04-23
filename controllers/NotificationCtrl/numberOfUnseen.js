const { Notification } = require("../../models/notification");

module.exports = async (req, res) => {
  const user = req.user;

  const notificationsCount = await Notification.countDocuments({
    targetUsers: user.id,
    seen: false,
  });

  const response = { count: notificationsCount };
  return res.status(200).json(response);
};
