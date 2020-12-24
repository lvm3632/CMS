const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const { isEmpty, uploadDir } = require("../../helpers/upload-helper");

const fs = require("fs");
const path = require("path");

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
  let errors = [];
  switch (errors.length <= 0) {
    case !req.body.title:
      errors.push({ message: "please add a title" });
    case !req.body.body:
      errors.push({ message: "please add a description" });
  }

  if (errors.length > 0) {
    res.render("admin/posts/create", {
      errors: errors,
    });
  } else {
    let filename = "placeholder.jpg";

    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + "-" + file.name;

      let dirUploads = "./public/uploads/";

      file.mv(dirUploads + filename, (err) => {
        if (err) throw err;
        console.log("Success in upload new image " + filename);
      });
    } else {
      console.log("Is empty");
    }

    let allowComments = true;

    req.body.allowComments != undefined
      ? (allowComments = true)
      : (allowComments = false);

    const newPost = new Post({
      title: req.body.title,
      status: req.body.status,
      allowComments: allowComments,
      body: req.body.body,
      file: filename,
    });

    newPost
      .save()
      .then((savedPost) => {
        req.flash(
          "success_message",
          `${savedPost.title} was created successfully`
        );
        console.log(savedPost);
        res.redirect("/admin/posts");
      })
      .catch((error) => {
        //res.render('admin/posts/create', {errors: validator.errors});
        console.log(error);
        console.log("couldn't save post");
      });
  }
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

    if (!isEmpty(req.files)) {
      let file = req.files.file;
      let filename = Date.now() + "-" + file.name;
      post.file = filename;
      let dirUploads = "./public/uploads/";

      file.mv(dirUploads + filename, (err) => {
        if (err) throw err;
        console.log("Success in upload new image " + filename);
      });
    }

    post.save().then((updatedPost) => {
      req.flash("success_message", "Post was successfully updated");
      res.redirect("/admin/posts");
    });

    // res.render("admin/posts/edit", { post: post });
  });
  // res.send("IT works");
});

/*router.delete("/:id", (req, res) => {
  Post.deleteOne({ _id: req.params.id }).then((result) => {
    res.redirect("/admin/posts");
  });
});*/

router.delete("/:id", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    fs.unlink(uploadDir + post.file, (err) => {
      req.flash("deleted_message", "Post was successfuly deleted");
      post.remove();
      res.redirect("/admin/posts");
    });
  });
});

module.exports = router;
