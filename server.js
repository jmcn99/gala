const express = require('express');
const mongo = require('mongodb');
const mc = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectId;
const path = require('path');
//const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
let db;

//app.locals -- a storage for local server information
app.locals.config = require("./config.json");

app.set("view engine", "pug");
app.use(session({secret: "shhhhhh", 
                resave: true,
                saveUninitialized: true}));


// Static stuff
//get static files
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Logging middleware
app.use(function(req,res,next){
	console.log("Method: ", req.method);
	console.log("URL:    ", req.url);
	console.log("Path:   ", req.path);
	console.log("Content:", req.get("Content-Type"));
	next();
});


//Require and mount the various routers

let loginRouter = require("./public/routes/login-router");
app.use("/login", loginRouter);
let userRouter = require("./public/routes/user-router");
app.use("/user", userRouter);
let galleryRouter = require("./public/routes/gallery-router");
app.use("/gallery", galleryRouter);
let searchRouter = require("./public/routes/search-router");
app.use("/search", searchRouter);
let workshopRouter = require("./public/routes/workshop-router");
app.use("/workshop", workshopRouter);


// respond with login page but change this to pages/index
app.get("/", (req, res, next)=> { res.render("pages/index", {session: req.session}); });

// Database connection
console.log("Connecting to database...");
//mc.connect("mongodb://0.0.0.0:27017", function(err, client) {
mc.connect("mongodb://127.0.0.1:27017/", function(err, client) {
   
    if(err) {
        console.log("Error connecting to database");
        console.log(err);
        return;
    } 
    console.log("Connected to database!");
    app.locals.db = client.db("galaDB");

    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
});
