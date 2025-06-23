var express = require("express");
var router = express.Router();
const userModel = require("./users");
const { useMemo } = require("react");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");
const postModel = require("./posts");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", (req, res) => {
  res.render("index", { nav: false });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  (req, res) => {}
);

router.get("/register", (req, res) => {
  res.render("register", { nav: false });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const isloggedin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
};

router.post("/register", (req, res) => {
  const data = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
  });

  userModel.register(data, req.body.password).then(() => {
    passport.authenticate("local")(req, res, () => {
      res.redirect("/profile");
    });
  });
});

router.get("/profile", isloggedin, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  console.log(user);
  res.render("profile", { nav: true, user });
});

router.get("/show/posts" , isloggedin, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  console.log(user);
  res.render("show", { nav: true, user });
});

router.get("/feed" , isloggedin, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
  const posts = await postModel.find().populate("user")
  res.render("feed", { nav: true,posts, user });
});


router.get("/add", isloggedin, async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("add", { nav: true, user });
});

router.post("/createpost", isloggedin, upload.single("postImage"), async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile")
});

router.post(
  "/fileupload",
  isloggedin,
  upload.single("image"),
  async (req, res) => {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.profileImage = req.file.filename;
    await user.save();

    res.redirect("/profile");
  }
);

module.exports = router;