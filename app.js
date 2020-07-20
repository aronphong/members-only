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

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false}));

app.get("/", (req, res) => res.render("index"));

app.listen(3000, () => console.log("app listening on PORT 3000!"));
