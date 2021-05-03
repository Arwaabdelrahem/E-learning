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
          console.log("Private", _id);

          // find prev conversation
          let conversation = await Conversation.findOne({
            $or: [{ users: [_id, data.toUser] }, { users: [data.toUser, _id] }],
          });

          // if not create one
          if (!conversation) {
            conversation = await new Conversation({
              users: [_id, data.toUser],
              conversationType: "P2P",
              meta: [
                { user: _id, countOfUnseenMessages: 0 },
                { user: data.toUser, countOfUnseenMessages: 0 },
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
          chatNamespace.to(`user ${data.toUser}`).emit("new message", {
            conversation,
            message: data,
          });

          // Send Notification in-app
          const clients = await User.findOne({ _id: data.toUser });
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

        socket.on("group", async function (data) {
          if (!data.content && !data.attachment) return;

          const { _id } = socket.decoded_token;
          console.log("group Chat", _id);

          // find prev conversation
          let conversation = await Conversation.findOne({
            _id: data.toConversation,
          });

          // if not create one
          if (!conversation) return;

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
          for (const i in conversation.users) {
            if (conversation.users[i].toString() === _id.toString()) continue;
            chatNamespace
              .to(`user ${conversation.users[i]}`)
              .emit("new message", {
                conversation,
                message: data,
              });
          }

          // Send Notification in-app
          const clients = await User.find({ _id: { $in: conversation.users } });
          const targetUsers = clients.map((user) => user.id);
          const notification = await new Notification({
            title: `New Message`,
            body: data.content,
            user: _id,
            targetUsers: targetUsers,
            subjectType: "Message",
            subject: createdMessage._id,
          }).save();

          // push notifications
          const receivers = clients;
          for (let i = 0; i < receivers.length; i++) {
            if (receivers[i]._id.toString() === _id.toString()) continue;
            await receivers[i].sendNotification(
              notification.toFirebaseNotification()
            );
          }
        });
      });

      return io;
    } catch (error) {
      next(error);
    }
  },
};
