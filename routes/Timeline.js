const express = require("express");
const auth = require("../middleware/auth");
const { Post } = require("../models/post");
const { Comment } = require("../models/comment");
const multer = require("../middleware/multer");
const cloud = require("../startup/cloudinary");
const validate = require("./postValidation");
const fs = require("fs");

const router = express.Router();

//Fetch, Create, Update, Delete Posts
router.get("/:courseId", auth, validate, async (req, res, next) => {
  const posts = await Post.paginate(
    { course: req.params.courseId },
    {
      populate: [
        { path: "user", select: "name" },
        { path: "comments", select: "content user" },
      ],
    }
  );

  res.status(200).send(posts);
});

router.post(
  "/post/:courseId",
  auth,
  multer,
  validate,
  async (req, res, next) => {
    let img;
    if (req.files.length !== 0) {
      img = await cloud.cloudUpload(req.files[0].path);
      req.body.image = img.image;
    }

    req.body.course = req.params.courseId;
    req.body.user = req.user._id;

    const post = new Post(req.body);
    await post.save();
    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    await Post.populate(post, [
      { path: "user", select: "name" },
      { path: "comments.user", select: "name" },
    ]);
    res.status(201).send(post);
  }
);

router.get("/:courseId/:postId", auth, validate, async (req, res, next) => {
  const post = await Post.findOne({
    _id: req.params.postId,
    course: req.params.courseId,
  });

  await Post.populate(post, [
    { path: "user", select: "name" },
    { path: "comments.user", select: "name" },
  ]);
  res.status(200).send(post);
});

router.put(
  "/:courseId/:postId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("post not found");

    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).send("Only the post author can update");

    let img;
    if (req.files.length !== 0) {
      img = await cloud.cloudUpload(req.files[0].path);
      req.body.image = img.image;
    }

    post = post.set(req.body);

    await post.save();
    if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
    await Post.populate(post, [
      { path: "user", select: "name" },
      { path: "comments.user", select: "name" },
    ]);
    res.status(200).send(post);
  }
);

router.delete("/:courseId/:postId", auth, validate, async (req, res, next) => {
  let post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).send("Post already doesnt exists");

  if (req.user.kind == "Student") {
    if (post.user != req.user._id)
      return res.status(403).send("Only author can delete the post");

    await post.delete();
    return res.status(204).send("post deleted");
  }
  await post.delete();
  res.status(204).send("post deleted");
});

//Create, Update, Delete Comments
router.post(
  "/comment/:courseId/:postId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
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

    await post.comments.push(comment._id);
    post = await post.save();
    res.status(201).send(post);
  }
);

router.put(
  "/comment/:courseId/:postId/:commentId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
    let post = await Post.findOne({
      _id: req.params.postId,
    }).populate([
      { path: "user", select: "name" },
      { path: "comments", select: " _id content" },
    ]);
    if (!post) return res.status(404).send("Post not found");

    let img;
    if (req.files.length !== 0) {
      img = await cloud.cloudUpload(req.files[0].path);
      req.body.image = img.image;
    }

    let comment = await Comment.findById(req.params.commentId).populate({
      path: "user",
      select: " _id name",
    });
    if (!comment) return res.status(404).send("Comment not found");

    if (comment.user._id.toString() === req.user._id.toString()) {
      comment.set(req.body);

      if (req.files.length !== 0) fs.unlinkSync(req.files[0].path);
      await comment.save();
      return res.status(200).send(comment);
    } else {
      res.status(403).send("Only comment author can update");
    }
  }
);

router.delete(
  "/comment/:courseId/:postId/:commentId",
  auth,
  validate,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId).populate([
      { path: "user", select: "name" },
      { path: "comments", select: " _id content" },
    ]);
    if (!post) return res.status(404).send("Post already doesnt exists");

    let comment = await Comment.findById(req.params.commentId).populate({
      path: "user",
      select: " _id name",
    });
    if (!comment) return res.status(404).send("Comment already doesnt exists");

    if (
      comment.user._id.toString() !== req.user._id.toString() &&
      req.user.kind == "Student"
    ) {
      return res.status(403).send("Only comment author can delete ");
    }

    await comment.delete();
    for (const i in post.comments) {
      if (post.comments[i]._id.toString() === req.params.commentId)
        post.comments.splice(i, 1);
      await post.save();
    }
    res.status(200).send({ msg: "comment deleted", post: post });
  }
);

module.exports = router;
