const express = require('express');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');


//Create the router
let router = express.Router();

//Get methods
router.get("/", (req, res, next)=> { res.render("pages/login", {session: req.session}); });
router.get("/register", (req, res, next)=> { res.render("pages/register", {session: req.session}); });
router.post("/register", registerUser);
router.post("/", login, AssignUser);
router.get("/logout", logout);

function logout(req, res, next) {
    req.session.destroy();
    res.redirect("/");
}

function login(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    // Check if empty
    if(username === "") {
        res.status(401).send("Username cannot be empty");
        return;
    }
    if(password === "") {
        res.status(401).send("Password cannot be empty");
        return;
    }

    // Check if username and password exist
    req.app.locals.db.collection("users").find({username: username, password: password}).toArray( function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(result.length > 0){
            req.session.username = username;
            req.session.userId = result[0]._id.toString();
            req.session.loggedIn = true;

            next();
        } else {
            res.status(401).send("Username or password is incorrect");
            return;
        }
        
    });

}

function AssignUser(req, res, next) {
	req.app.locals.db.collection("users").find({_id: ObjectId(req.session.userId)}).toArray( function(err, result){
		if(err){
			return;
		}
		if(result.length > 0){
			let user = result[0];
			req.session.user = user;
            res.status(200).send();

            return;
		} else {
			return;
		}
		
	});
}


function registerUser(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;

    // Check if empty
    if(username === "") {
        res.status(401).send("Username cannot be empty");
        return;
    }
    if(password === "") {
        res.status(401).send("Password cannot be empty");
        return;
    }
    
    // Check if username is taken already 
    req.app.locals.db.collection("users").find({username: username}).toArray( function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }
        if(result.length > 0){
            res.status(401).send("Username already exists");
            return;
        }
        // If username is not taken, add to database
        try {
            req.app.locals.db.collection("users").insertOne({username: username, password: password, artist: false, followers: [], following: [], notifications: []}, function(err, result){});
            res.status(200).send("User created");
        } catch (e) {
            res.status(500).send("Error inserting into database");
        }
        
    });
}
    

module.exports = router;