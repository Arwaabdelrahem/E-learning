const { Notification } = require("../../models/notification");
const _ = require("lodash");

module.exports = async (req, res) => {
  const user = req.user;
  //paginate
  // in case of non-paginate
  req.allowPagination = false;
  let notifications = await Notification.find({
    targetUsers: { $in: [user.id] },
  })
    .sort("-createdAt")
    .populate("subject");

  const collection = req.allowPagination ? notifications.docs : notifications;
  for (let i = 0; i < collection.length; i++) {
    let notification = _.cloneDeep(collection[i]); // here copy values not reference
    // let notification = collection[i] // copy reference
    if (notification.seen) continue;
    notification.seen = true;
    await notification.save();
  }

  return res.status(200).json(notifications);
};
