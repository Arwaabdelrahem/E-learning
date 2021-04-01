const mongooseAutoIncrement = require("mongoose-auto-increment");
const mongoose = require("mongoose");
const pagination = require("mongoose-paginate-v2");

mongooseAutoIncrement.initialize(mongoose.connection);

const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
    image: {
      type: String,
    },
    user: {
      type: Number,
      ref: "User",
    },
    post: {
      type: Number,
      ref: "Post",
    },
  },
  { timestamps: true }
);

commentSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      content: doc.content,
      image: doc.image,
      user: doc.user,
      post: doc.post,
    };
  },
});
commentSchema.plugin(pagination);
commentSchema.plugin(mongooseAutoIncrement.plugin, {
  model: "Comment",
  startAt: 1,
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports.Comment = Comment;
