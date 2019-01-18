const express = require("express");
const path = require("path");
const app = express();
const pug = require("pug");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");


// import session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
  })
);
// import message flash, must put before router, otherwise it doesnot work
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// connect to mongodb
mongoose.connect("mongodb://localhost/nodejs-blog");
const conn = mongoose.connection;
conn.on("err", function(err) {
  console.log(err);
});
conn.once("connected", function() {
  console.log("connect database successed.");
});

//use pug view model
app.use(express.static(__dirname + "views"));
app.set("views", "./views");
// app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "pug");

// use static file
app.use(express.static(path.join(__dirname, "public")));

// var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.urlencoded({ extended: false }));

// import passport LocalStrategy
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// use middleware to get the any request user object
app.get('*', function(req, res, next){
  res.locals.user = req.user || null
  next()
})

// import article and user model
const Article = require("./model/article");
const User = require("./model/user");

// import articles and users router
const articleRouter = require("./routes/articles");
app.use("/articles", articleRouter);
const userRouter = require("./routes/users");
app.use("/users", userRouter);


// root route
app.get("/", function(req, res) {
  Article.find({}, function(err, articles) {
    res.render("articles/index", { articles: articles });
  });
});

app.listen("5000", () => console.log("server listen on the port 5000."));
