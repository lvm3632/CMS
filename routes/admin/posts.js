const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "admin";

  next();
});

router.get("/", (req, res) => {
  Post.find({})
    .then((posts) => {
      res.render("admin/posts", { posts: posts });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get("/create", (req, res) => {
  res.render("admin/posts/create");
});

router.post("/create", (req, res) => {
  let allowComments = true;

  req.body.allowComments != undefined
    ? (allowComments = true)
    : (allowComments = false);

  const newPost = new Post({
    title: req.body.title,
    status: req.body.status,
    allowComments: allowComments,
    body: req.body.body,
  });

  newPost
    .save()
    .then((savedPost) => {
      console.log(savedPost);
      res.redirect("/admin/posts");
    })
    .catch((error) => {
      console.log(error);
      console.log("couldn't save post");
    });

  console.log(req.body);
});

router.get("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    res.render("admin/posts/edit", { post: post });
  });

  // res.send(req.params.id);
  // res.render("admin/posts/edit");
});

router.put("/edit/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    req.body.allowComments != undefined
      ? (allowComments = true)
      : (allowComments = false);

    post.title = req.body.title;
    post.status = req.body.status;
    post.allowComments = allowComments;
    post.body = req.body.body;

    post.save().then((updatedPost) => {
      res.redirect("/admin/posts");
    });

    // res.render("admin/posts/edit", { post: post });
  });
  // res.send("IT works");
});

module.exports = router;
