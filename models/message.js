const mongoose = require("mongoose");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const schema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    attachment: {
      type: String,
    },
    user: {
      type: Number,
      ref: "User",
      required: true,
    },
    conversation: {
      type: Number,
      ref: "Conversation",
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
  },
  { timestamps: true }
);

schema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      content: doc.content,
      attachment: doc.attachment,
      user: doc.user,
      conversation: doc.conversation,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

schema.plugin(pagination);
schema.plugin(mongooseAutoIncrement.plugin, {
  model: "Message",
  startAt: 1,
});

const Message = mongoose.model("Message", schema);
module.exports.Message = Message;
