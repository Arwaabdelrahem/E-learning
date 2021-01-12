const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

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
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    image: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true }
);

postSchema.plugin(pagination);
const Post = mongoose.model("Post", postSchema);

module.exports.Post = Post;
