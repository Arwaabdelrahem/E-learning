const socketIO = require("socket.io");
const socketIOJwt = require("socketio-jwt");
const { Conversation } = require("./models/conversation");
const { Message } = require("./models/message");
const { Notification } = require("./models/notification");
const { User } = require("./models/user");

module.exports = {
  up: function (server) {
    try {
      const io = socketIO(server);

      // Chat
      const chatNamespace = io.of("/chat");
      chatNamespace.on(
        "connection",
        socketIOJwt.authorize({
          secret: process.env.jwtprivateKey,
        })
      );

      chatNamespace.on("authenticated", async function (socket) {
        const { _id } = socket.decoded_token;
        console.log(_id);
        // join room
        await socket.join(`user ${_id}`);

        socket.on("private", async function (data) {
          if (!data.content && !data.attachment) return;

          const { _id } = socket.decoded_token;
          console.log("HERE", _id);

          // find prev conversation
          let conversation = await Conversation.findOne({
            $or: [{ users: [_id, data.to] }, { users: [data.to, _id] }],
          });
          // if not create one
          if (!conversation) {
            conversation = await new Conversation({
              users: [_id, data.to],
              meta: [
                { user: _id, countOfUnseenMessages: 0 },
                { user: data.to, countOfUnseenMessages: 0 },
              ],
            }).save();
          }
          // save message to db
          const createdMessage = await new Message({
            user: _id,
            content: data.content,
            attachment: data.attachment,
            conversation: conversation.id,
          }).save();

          conversation.lastMessage = createdMessage.id;
          conversation.meta.forEach((info) => {
            if (info.user === _id) info.countOfUnseenMessages = 0;
            else info.countOfUnseenMessages++;
          });
          await conversation.save();
          // emit message
          chatNamespace.to(`user ${data.to}`).emit("new message", {
            conversation,
            message: data,
          });

          // Send Notification in-app
          const clients = await User.findOne({ _id: data.to });
          const notification = await new Notification({
            title: `New Message`,
            body: data.content,
            user: _id,
            targetUsers: clients,
            subjectType: "Message",
            subject: createdMessage._id,
          }).save();

          // push notifications
          await clients.sendNotification(notification.toFirebaseNotification());
        });
      });

      return io;
    } catch (error) {
      next(error);
    }
  },
};
