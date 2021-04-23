const Joi = require("joi");
const { join } = require("lodash");
const mongoose = require("mongoose");
const mongooseAutoIncrement = require("mongoose-auto-increment");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String, // in case of more than 2 users
    },
    image: {
      type: String, // link to image in same case as name
    },
    users: [
      {
        type: Number,
        ref: "User",
      },
    ],
    owner: {
      type: Number,
      ref: "User",
    },
    conversationType: {
      type: String,
      enum: ["P2P", "GROUP"],
      required: true,
    },
    course: {
      type: Number,
      ref: "course",
    },
    lastMessage: {
      type: Number,
      ref: "message",
    },
    meta: [metaSchema()],
  },
  { timestamps: true }
);

conversationSchema.methods.containUser = function (userID) {
  for (let user of this.users) if (user._id == userID) return true;
  return false;
};

schema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      conversationType: doc.conversationType,
      name: doc.name,
      owner: doc.owner,
      users: doc.users,
      course: doc.course,
      meta: doc.meta,
      lastMessage: doc.lastMessage,
      image: doc.image,
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
        ref: "user",
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

function PRIVATE(conversation) {
  const schema = Joi.object({
    name: Joi.forbidden(),
    image: Joi.forbidden(),
    uesrs: Joi.array().unique().min(2).required(),
  });
  return schema.validate(conversation);
}

function GROUP(conversation) {
  const schema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string(),
    uesrs: Joi.array().unique().min(2).required(),
  });
  return schema.validate(conversation);
}

schema.plugin(pagination);
schema.plugin(mongooseAutoIncrement.plugin, {
  model: "Conversation",
  startAt: 1,
});

const Conversation = mongoose.model("Conversation", schema);
module.exports.Conversation = Conversation;
module.exports.PRIVATE = PRIVATE;
module.exports.GROUP = GROUP;
