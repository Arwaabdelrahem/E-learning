const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const postSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
    comments: [
      {
        content: String,
        image: String,
        user: {
          type: Number,
          ref: "User",
        },
      },
    ],
    image: {
      type: String,
    },
    user: {
      type: Number,
      ref: "User",
    },
    course: {
      type: Number,
      ref: "Course",
    },
  },
  { timestamps: true }
);

postSchema.plugin(pagination);
postSchema.plugin(mongooseAutoIncrement.plugin, { model: "Post", startAt: 1 });

const Post = mongoose.model("Post", postSchema);

module.exports.Post = Post;
