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
        type: Number,
        ref: "Comment",
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

postSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc) {
    return {
      id: doc.id,
      content: doc.content,
      image: doc.image,
      comments: doc.comments,
      user: doc.user,
      course: doc.course,
    };
  },
});

postSchema.plugin(pagination);
postSchema.plugin(mongooseAutoIncrement.plugin, { model: "Post", startAt: 1 });

const Post = mongoose.model("Post", postSchema);
module.exports.Post = Post;
