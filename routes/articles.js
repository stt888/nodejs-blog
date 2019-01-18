const express = require("express");
let router = express.Router();
const { check, validationResult } = require("express-validator/check");

// import article and user model
const Article = require("../model/article");
const User = require("../model/user");

// route for new article page
router.get("/new", ensureAuthenticated, function(req, res) {
  res.render("articles/new", { title: "Add new article" });
});

// route for artile showing page
router.get("/:id", ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    User.findById(article.author, function(err, user) {
      res.render("articles/show", {
        article: article,
        author: user.name
      });
    });
  });
});

// route for article editing page
router.get("/:id/edit", ensureAuthenticated, function(req, res) {
  Article.findById(req.params.id, function(err, article) {
    if(article.author != req.user._id){
      req.flash('danger', 'Not Authorized.')
      return res.redirect('/')
    }
    res.render("articles/edit", {
      title: "Update Article",
      article: article
    });
  });
});

// route for article creating page
router.post("/create", [
    check("title")
      .isLength({ min: 1 })
      .withMessage("Title is required."),
    check("content")
      .isLength({ min: 1 })
      .withMessage("Content is required.")
  ],
  function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("articles/new", {
        errors: errors.array(),
        title: "Add Article."
      });
    } else {
      let article = new Article(req.body);
      article.author = req.user._id;
      article.save(function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          req.flash("success", "Article added.");
          res.redirect("/");
        }
      });
    }
  }
);

// route for article updating page
router.post("/update/:id", function(req, res) {
  let query = { _id: req.params.id };
  Article.update(query, req.body, function(err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article updated.");
      res.redirect("/");
    }
  });
});

// route for article deleting page
router.delete("/:id", function(req, res) {
  if(!req.user._id){
    return res.status(500).send()
  }
  let query = { _id: req.params.id };
  Article.findById(req.params.id, function(err, article){
    if(article.author != req.user._id){
      res.status(500).send()
    }else{
      Article.remove(query, function(err) {
        if (err) {
          console.log(err);
          return;
        } else {
          res.send("success");
        }
      });
    }
  } )
});

// function for ensure the user is logging
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login.");
    res.redirect("/users/login");
  }
}

module.exports = router;
