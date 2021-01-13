const express = require("express");
const auth = require("../middleware/auth");
const { Post } = require("../models/post");
const multer = require("../middleware/multer");
const cloud = require("../startup/cloudinary");
const validate = require("./postValidation");
const fs = require("fs");

const router = express.Router();

//Fetch, Create, Update, Delete Posts
router.get("/:courseId", auth, validate, async (req, res, next) => {
  const posts = await Post.findOne({ course: req.params.courseId });
  await Post.populate(posts, [
    { path: "user", select: "name" },
    { path: "comments.user", select: "name" },
  ]);
  res.status(200).send(posts);
});

router.post(
  "/post/:courseId",
  auth,
  multer,
  validate,
  async (req, res, next) => {
    let img;
    if (req.files) {
      img = await cloud.cloudUpload(req.files[0].path);
    }

    const post = new Post({
      content: req.body.content,
      image: img ? img.image : undefined,
      user: req.user._id,
      course: req.params.courseId,
    });
    await post.save();
    if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
    await Post.populate(post, [
      { path: "user", select: "name" },
      { path: "comments.user", select: "name" },
    ]);
    res.status(201).send(post);
  }
);

router.get("/:courseId/:postId", auth, validate, async (req, res, next) => {
  const posts = await Post.findOne({
    course: req.params.courseId,
    _id: req.params.postId,
  });

  await Post.populate(post, [
    { path: "user", select: "name" },
    { path: "comments.user", select: "name" },
  ]);
  res.status(200).send(posts);
});

router.put(
  "/:courseId/:postId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("post not found");

    if (post.user != req.user._id)
      return res.status(403).send("Only the post author can update");

    let img;
    if (req.files) {
      img = await cloud.cloudUpload(req.files[0].path);
    }

    post = post.set({
      content: req.body.content,
      image: img ? img.image : req.body.image,
    });

    await post.save();
    if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
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
    return res.status(200).send("post deleted");
  }
  await post.delete();
  res.status(200).send("post deleted");
});

//Create, Update, Delete Comments
router.post(
  "/:courseId/:postId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("Post not found");

    let img;
    if (req.files) {
      img = await cloud.cloudUpload(req.files[0].path);
    }

    const comment = {
      content: req.body.content,
      image: img ? img.image : req.body.image,
      user: req.user._id,
    };

    await post.comments.push(comment);
    if (req.files.length != 0) fs.unlinkSync(req.files[0].path);
    await Post.populate(post, [
      { path: "user", select: "name" },
      { path: "comments.user", select: "name" },
    ]);
    post = await post.save();
    res.status(201).send(post);
  }
);

router.put(
  "/:courseId/:postId/:commentId",
  auth,
  validate,
  multer,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("Post not found");

    let img;
    if (req.files) {
      img = await cloud.cloudUpload(req.files[0].path);
    }

    for (const i in post.comments) {
      if (post.comments[i].user == req.user._id) {
        if (post.comments[i]._id == req.params.commentId) {
          post.comments[i].set({
            content: req.body.content,
            image: img ? img.image : req.body.image,
          });
          if (req.files.length != 0) fs.unlinkSync(req.files[0].path);

          await post.save();
          await Post.populate(post, [
            { path: "user", select: "name" },
            { path: "comments.user", select: "name" },
          ]);
          return res.status(200).send(post);
        }
      }
    }
    res.status(403).send("Only comment author can update");
  }
);

router.delete(
  "/:courseId/:postId/:commentId",
  auth,
  validate,
  async (req, res, next) => {
    let post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).send("Post already doesnt exists");

    for (const i in post.comments) {
      if (post.comments[i]._id == req.params.commentId) {
        if (req.user.kind == "Student") {
          if (post.comments[i].user != req.user._id) {
            return res.status(403).send("Only comment author can delete ");
          }

          post.comments.splice(i, 1);
          await post.save();
          res.status(200).send({ msg: "comment deleted", post: post });
        }
        post.comments.splice(i, 1);
        await post.save();
        res.status(200).send({ msg: "comment deleted", post: post });
      }
    }
  }
);

module.exports = router;
