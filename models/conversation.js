const mongoose = require("mongoose");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const schema = new mongoose.Schema(
  {
    users: [
      {
        type: Number,
        ref: "User",
      },
    ],
    meta: [metaSchema()],
    lastMessage: {
      type: Number,
      ref: "Message",
    },
  },
  { timestamps: true }
);

schema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      users: doc.users,
      meta: doc.meta,
      lastMessage: doc.lastMessage,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  },
});

function metaSchema() {
  const schema = new mongoose.Schema(
    {
      user: {
        type: Number,
        ref: "User",
      },
      countOfUnseenMessages: {
        type: Number,
        default: 0,
      },
    },
    { _id: false }
  );

  schema.set("toJSON", {
    transform: function (doc) {
      return {
        user: doc.user,
        countOfUnseenMessages: doc.countOfUnseenMessages,
      };
    },
  });

  return schema;
}

schema.plugin(pagination);
schema.plugin(mongooseAutoIncrement.plugin, {
  model: "Conversation",
  startAt: 1,
});

const Conversation = mongoose.model("Conversation", schema);
module.exports.Conversation = Conversation;
