const { User } = require("../../models/user");
const { Notification } = require("../../models/notification");

module.exports = async (req, res) => {
  await sendNotification({
    title: req.body.title,
    body: req.body.body,
    query: {}, // filter with any properties , according to front end requirements
    user: req.user._id, // sender of notification (usually admin only who can access this end point)
    subjectType: "User", // write suitable subjectType
    subject: req.user._id, // put Id of that subjectType
  });
  return res.status(204).json();
};

const sendNotification = async (data) => {
  try {
    // Send Notification in-app
    const clients = await User.find(data.query);
    const targetUsers = clients.map((user) => user.id);
    const notification = await new Notification({
      title: data.title,
      body: data.body,
      user: data.user,
      targetUsers: targetUsers,
      subjectType: data.subjectType,
      subject: data.subject,
    }).save();

    // push notifications
    const receivers = clients;
    for (let i = 0; i < receivers.length; i++) {
      await receivers[i].sendNotification(
        notification.toFirebaseNotification()
      );
    }
  } catch (error) {
    console.log(error);
  }
};
