require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
    "User",
    new Schema({
        first_name: { type: String },
        last_name: { type: String },
        username: { type: String },
        password: { type: String },
        membership_status: { type: Boolean },
        post: [
            {
                title: { type: String },
                text: { type: String },
                date: {}
            }
        ]
    })    
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

// set up LocalStrategy
passport.use(
    new LocalStrategy((username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) { 
          return done(err);
        };
        if (!user) {
          return done(null, false, { msg: "Incorrect username" });
        }
        if (user.password !== password) {
          return done(null, false, { msg: "Incorrect password" });
        }
        return done(null, user);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false}));

app.get("/", (req, res) => res.render("index"));
app.get("/sign-up", (req,res) => res.render("sign-up-form"));

// handle user sign up on POST
app.post("/sign-up", (req, res, next) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.firstname,
        last_name: req.body.lastname
    });

    user.save(err => {
        if (err) next(err);
        res.redirect("/")
    })
    // console.log(user);
})

// handle user log in on POST
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
}));

app.listen(3000, () => console.log("app listening on PORT 3000!"));
