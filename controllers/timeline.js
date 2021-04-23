const { Notification } = require("../models/notification");
const cloud = require("../startup/cloudinary");
const fs = require("fs");
const { Post } = require("../models/post");
const { Comment } = require("../models/comment");
const { User } = require("../models/user");

exports.newComment = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("Post not found");

    let img;
    if (req.files.length != 0) {
      img = await cloud.cloudUpload(req.files[0].path);
      req.body.image = img.image;
    }
    req.body.user = req.user._id;
    req.body.post = post._id;

    const comment = new Comment(req.body);
    if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
    await comment.save();

    await Post.populate(post, [
      { path: "user", select: "name" },
      { path: "comments.user", select: "name" },
    ]);

    await Comment.populate(comment, [{ path: "user", select: "name" }]);
    await post.comments.push(comment._id);
    post = await post.save();

    if (comment.user._id !== post.user._id) {
      // Send Notification in-app
      const clients = await User.find({ _id: post.user._id });
      const targetUsers = clients.map((user) => user.id);
      const notification = await new Notification({
        title: "New comment",
        body: `${comment.user.name} commented on your post.`,
        user: req.user._id,
        targetUsers: targetUsers,
        subjectType: "Comment",
        subject: comment._id,
      }).save();

      // push notifications
      const receivers = clients;
      for (let i = 0; i < receivers.length; i++) {
        await receivers[i].sendNotification(
          notification.toFirebaseNotification()
        );
      }
    }
    res.status(201).send(post);
  } catch (error) {
    next(error);
  }
};
