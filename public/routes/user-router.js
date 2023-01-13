const express = require('express');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { PassThrough } = require('stream');

// Create the router
let router = express.Router();
router.use("/", auth);

// methods

router.get("/", getSessionGallery, getCurUserWorkshops, getLikedGallery, getReviewedGallery, getFollowingList, genUserPage);
router.get("/notifications", getNotifications, genNotifications);

// keep this below other get requests so it doesn't interfere with them
router.get("/:userId", getUserById, getUserWorkshops, getUserGallery, genUserData);

router.put("/artist", toggleArtist);
router.put("/follow/:userId", followUser);
router.put("/unfollow/:userId", unfollowUser);


function getUser(req, res, next) {
    res.format({
        'text/html': function() {
			next();
			


		}
    });
}

// Function to get notifications
function getNotifications(req, res, next) {
	req.app.locals.db.collection("users").findOne({_id: ObjectId(req.session.userId)}, function(err, result) {
		if(err) {
			res.status(500).send("Error reading database.");
			return;
		} else {

			req.notifications = result.notifications.reverse();
			next();
		}
	});
}

// Function to generate notifications
function genNotifications(req, res, next) {
	res.render("pages/notifications", {session: req.session, title: "notifications", notifications: req.notifications});
}

function getSessionGallery(req, res, next) {
	req.app.locals.db.collection("gallery").find({userId: req.session.userId}).toArray( function(err, result){
		if(err){
			print(err);
			req.gallery = null;
			next();
		}
		if(result.length > 0){
			req.gallery = result;
			next();
		} else {
			next();
		}
		
	});
}

// Function to get a session user's liked images
function getLikedGallery(req, res, next) {

	// Find all images in the gallery that have the users id in the likes array
	req.app.locals.db.collection("gallery").find({likes: req.session.userId}).toArray( function(err, result){
		if(err){
			return;
		}
		req.likedGallery = result;
		next();
		
	});
}

// Function to get a users reviewed images
function getReviewedGallery(req, res, next) {
	req.app.locals.db.collection("gallery").find({reviews: {$elemMatch: {userId: req.session.userId}}}).toArray( function(err, result){
		if(err){
			return;
		}
		req.reviewedGallery = result;
		next();
	});
}

// Get a list of users that the session user is following
function getFollowingList(req, res, next) {

	// 
	req.followingList = [];
	req.app.locals.db.collection("users").find({_id: ObjectId(req.session.userId)}).toArray( function(err, result){
		if(err){
			return;
		}
		if(result.length > 0){
			req.user = result[0];


			if(req.user.following.length > 0) {
				console.log("following length: " + req.user.following.length);
				// Loops through all the followers and adds them to the following list
				for(let i = 0; i < req.user.following.length; i++){

					// Get user from database and add to following list
					req.app.locals.db.collection("users").find({_id: ObjectId(req.user.following[i])}).toArray( function(err, result){
						if(err){
							console.log(err);
						} else {
							req.followingList.push(result[0]);
							
							// If we're at the end of list, call next(). 
							// Have to do this here or else it will call next() before all the users are added to the list
							if(i === req.user.following.length - 1){
								next();
							}
						
						}
					});	
				}	
			} else {
				// Call next if theres nothing in the list, just an empty followers list i guess
				next();
			}
			
			
		} else {
			
			return;
		}	
	});
}

function getCurUserWorkshops(req, res, next) {
	// Find all workshops
	// Find all workshops with cur user id as the user id
	req.app.locals.db.collection("workshops").find({userId: req.session.userId}).toArray( function(err, result){
		if(err){
			return;
		}
		req.workshops = result;
		next();
	});
}

function genUserPage(req, res, next) {

	console.log("here");
	res.render("pages/userpage", {session: req.session, reviewedGal: req.reviewedGallery, likedGal: req.likedGallery, followingList: req.followingList, title: req.session.username, workshops: req.workshops});
}



function getUserById(req, res, next) {
	// Check if user id is itself
	if(req.params.userId === req.session.userId){
		res.redirect("/user");
		return;
	}

	// check if valid mongo id
	if(!ObjectId.isValid(req.params.userId)){
		res.status(404).send("User not found.");
		return;
	}
	
	req.app.locals.db.collection("users").find({_id: ObjectId(req.params.userId)}).toArray( function(err, result){
		if(err){
			res.status(404).send("User not found.");
			return;
		}
		if(result.length > 0){
			let user = result[0];
			req.user = user;
			
			next();
		} else {
			res.status(404).send("User not found.");

			return;
		}
		
	});
}

function getUserGallery(req, res, next) {
	req.app.locals.db.collection("gallery").find({userId: req.params.userId}).toArray( function(err, result){
		if(err){
			return;
		}
		req.gallery = result;
		next();
	});
}	

// Function to get user workshops in an object? i guess
function getUserWorkshops(req, res, next) {
	let workshops = [];
	req.app.locals.db.collection("workshops").find({userId: req.params.userId}).toArray( function(err, result){
		if(err){
			return;
		}

		workshops = result;
		req.workshops = workshops;
			
		
		next();
	});

}


function genUserData(req, res, next) {
	res.format({
		'text/html': function() {
			console.log(req.session);
			res.render("pages/user", {session: req.session, user: req.user, gallery: req.gallery, id: req.params.userId.toString(), workshops: req.workshops});
		}
	});
}

function followUser(req, res, next) {
	let userId = req.session.userId;
	let followId = req.params.userId;

	// Check if userId == followId
	if(userId === followId){
		res.status(400).send("You cannot follow yourself");
		return;
	}


	// Check if user is following user already
	req.app.locals.db.collection("users").find({_id: ObjectId(userId), following: followId}).toArray( function(err, result) {
		if(err){
			return;
		}
		if(result.length > 0){
			res.status(401).send("You are already following this user");
			return;
		}
		// Add user to following list
		req.app.locals.db.collection("users").updateOne({_id: ObjectId(userId)}, {$push: {following: followId}}, function(err, result){
			if(err){
				return;
			}
			req.session.user.following.push(followId);
			res.status(200).send("You are now following this user");
		});
	
		
	});
}

function unfollowUser(req, res, next) {
	let userId = req.session.userId;
	let followId = req.params.userId;

	// Check if user is following user already
	req.app.locals.db.collection("users").find({_id: ObjectId(userId), following: followId}).toArray( function(err, result) {
		if(err){
			return;
		}
		if(result.length <= 0){
			res.status(401).send("You are not following this user.");
			return;
		}
		// Add user to following list
		req.app.locals.db.collection("users").updateOne({_id: ObjectId(userId)}, {$pull: {following: followId}}, function(err, result){
			if(err){
				return;
			}
			let index = req.session.user.following.indexOf(followId);
			req.session.user.following.splice(index, 1);
			res.status(200).send("You are not following this user");
		});
	
		
	});
}

// Toggle user artist status
function toggleArtist(req, res, next) {
	let userId = req.session.userId;
	let artist = req.session.user.artist;
	req.app.locals.db.collection("users").updateOne({_id: ObjectId(userId)}, {$set: {artist: !artist}}, function(err, result){
		if(err){
			return;
		} else {
			req.session.user.artist = !req.session.user.artist;
			res.status(200).send("Artist status changed");
		}
	});
}


function auth(req, res, next) {
	//check if there a loggedin property set for the session
	if (!req.session.loggedIn) {
		res.status(401).send("Unauthorized");
		return;
	}

	next();
}



module.exports = router;