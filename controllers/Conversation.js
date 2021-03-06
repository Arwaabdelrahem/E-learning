const { Conversation } = require("../models/conversation");
const { Message } = require("../models/message");
const _ = require("lodash");

exports.fetchAll = async (req, res) => {
  try {
    const conversations = await Conversation.paginate(
      { users: req.user._id },
      {
        populate: [{ path: "users", select: "name image" }, "lastMessage"],
      }
    );

    res.status(200).send(conversations);
  } catch (error) {
    next(error);
  }
};

exports.fetchMessagesForCoversation = async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation)
    return res.status(404).send("No Conversation with that id");

  if (conversation.users.indexOf(req.user._id) === -1)
    return res.status(403).send("Dont allow to view these messages");

  let key = _.findKey(conversation.meta, { user: req.user._id });
  if (key !== undefined) {
    conversation.meta[key].countOfUnseenMessages = 0;
    await conversation.save();
  }

  const messages = await Message.paginate(
    { conversation: req.params.id },
    {
      sort: "-createdAt",
      populate: [{ path: "user", select: "name image" }],
    }
  );

  res.status(200).send(messages);
};
