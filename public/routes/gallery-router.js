const express = require('express');
const path = require('path');
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

//Create the router
let router = express.Router();

//Get methods

router.use("/", auth);
router.get("/", pages, getGallery, renderGallery);

router.get("/upload", verifyArtist, (req, res, next) => {res.render("pages/upload", {session: req.session, title: "upload"})});
router.post("/upload", verifyArtist, notify, upload);
router.put("/like/:id", like);
router.post("/review", review);
router.put("/review", deleteReview);

function auth(req, res, next) {
	//check if there a loggedin property set for the session
	if (!req.session.loggedIn) {
		res.status(401).send("Unauthorized");
		return;
	}

	next();
}

// Function to delete review from an image
// Have to use review contents to delete the review
// Should add ID or something
function deleteReview(req, res, next) {
    let review = req.body.review;
    let id = req.body.id;
    // Pull review
    req.app.locals.db.collection("gallery").updateOne({_id: ObjectId(id)}, {$pull: {reviews: {userId: req.session.userId, review: review}}}, function(err, result) {
        
        if(err) {
            res.status(500).send("Error reading database");
            return;
        } else {
            res.status(200).send("Review deleted");
        }
    });
}


// Function to leave reviews on images
function review(req, res, next) {
    // define variables
    let review = req.body.review;
    let id = req.body.id;
    let userId = req.session.userId;
    let username = req.session.username;

    // Check if session == review name
    if(req.session.userId === req.body.userId) {

        res.status(401).send("Unauthorized");
        return;
    }

    // Find image with id
    req.app.locals.db.collection("gallery").findOne({_id: ObjectId(id)}, function(err, result) {
        if(err) {
            res.status(500).send("Error reading database");
            return;
        } else {
            // Push the review to the reviews array of the image
            req.app.locals.db.collection("gallery").updateOne({_id: ObjectId(id)}, {$push: {reviews: {userId: userId, username: username, review: review}}}, function(err, result) {
                if(err) {
                    res.status(500).send("Error reading database");
                    return;
                } else {
                    res.status(200).send("Review added");
                }
            });
        }
    });
}


// Function to render the gallery page with the images provided from previous middleman function
function renderGallery(req, res, next) {
    res.render("pages/gallery", {session: req.session, title: "gallery", gallery: req.gallery, page: req.page, pages: req.pages, search: false});
}

// Function to get all the images in the gallery folder
function getGallery(req, res, next) {
    req.app.locals.db.collection("gallery").find({}).skip(req.skip).limit(req.perPage).toArray( function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }

        req.gallery = result;
        next();
    });
}

// A function to handle pagination
function pages(req, res, next) {
    // Get page number from url
    let page = req.query.page;
    // If no page number is provided, set page to 1
    if(page == undefined) {
        page = 1;
    }

    // Set the number of images per page
    let perPage = 10;

    // Get the number of images in the gallery
    req.app.locals.db.collection("gallery").countDocuments({}, function(err, result) {
        if(err) {
            res.status(500).send("Error reading database.");
            return;
        }

        // Calculate the number of pages
        let pages = Math.ceil(result / perPage);

        // Set the number of images to skip
        let skip = (page - 1) * perPage;


        // Set the page number to the session
        req.page = page;
        req.pages = pages;
        req.skip = skip;
        req.perPage = perPage;

        next();
    

    });
    
}

// A function to update the notification list of each user that follows the artist who uploaded an image
function notify(req, res, next) {   

    req.app.locals.db.collection("users").find({following: req.session.userId}).toArray(function(err, result ){
        if(err) {
            res.status(500).send("Error reading database.");
            return;
        } else {

            // Get and format the data to dd/mm/yyyy
            let date = new Date();
            let dd = String(date.getDate()).padStart(2, '0');
            let mm = String(date.getMonth() + 1).padStart(2, '0');
            let yyyy = date.getFullYear();
            let tdDate = mm + '/' + dd + '/' + yyyy;



            // Update each of the followers notification list
            for(let i = 0; i < result.length; i++) {
                req.app.locals.db.collection("users").updateOne({_id: result[i]._id}, {$push: {notifications: {artistName: req.session.username, artistId: req.session.userId, message: "uploaded a new image.", date: tdDate}}}, function(err, result) {
                    if(err) {
                        res.status(500).send("Error reading database.");
                        return;
                    }
                });
            }
             next();
        } 
    });
    

}

function upload(req, res, next) {
    let img = req.body.img;
    let name = req.body.name;
    let desc = req.body.description;
    let year = req.body.year;
    let category = req.body.category;

    console.log(req.session);

    req.app.locals.db.collection("gallery").insertOne({image: img, name: name, description: desc, category: category, year: year, userId: req.session.userId, artist: req.session.username, likes:[]}, function(err, result){
        if(err){
            res.status(500).send("Error reading database.");
            return;
        }

        res.redirect("/gallery");
    });
}

function like(req, res, next) {
    let id = req.params.id;

    // Find the image in the database with corresponding id and check if the user has already liked it
    req.app.locals.db.collection("gallery").find({_id: ObjectId(id)}).toArray( function(err, result){
        if(err) {
            res.status(500).send("Error reading database.");
            return;
        } else {

            // Check if user liking image is the same as the user who uploaded the image
            if(result[0].userId === req.session.userId) {
                res.status(401).send("You cannot like your own image");
                return;
            }

            // Check if the user has already liked the image
            // If the user has already liked the image, remove the like
            if(result[0].likes.includes(req.session.userId)) {
                req.app.locals.db.collection("gallery").updateOne({_id: ObjectId(id)}, {$pull: {likes: req.session.userId}}, function(err, result){
                    if(err) {
                        res.status(500).send("Error reading database.");
                        return;
                    } else {
                        res.status(200).send("unliked");
                        return;
                    }
                });

                    
            // If the user has not liked the image, add the like
            } else {
                req.app.locals.db.collection("gallery").updateOne({_id: ObjectId(id)}, {$push: {likes: req.session.userId}}, function(err, result){
                    if(err) {
                        res.status(500).send("Error reading database.");
                        return;
                    } else {
                        res.status(200).send("liked");
                        return;
                    }
                });

            }
        }
    });
}

function verifyArtist(req, res, next) {
    // get artist status from db
    req.app.locals.db.collection("users").find({_id: ObjectId(req.session.userId)}).toArray(function(err, result){
        if(err) {
            res.status(500).send("Error reading database.");
            return;
        } else {
            // set artist status to session
            req.session.artist = result[0].artist;

            // check if session user is artist
            if(req.session.artist === false) {
                res.status(403).send("You are not an artist");
                return;
            } else {
                next();
            }
        }
    });
    
    
}




module.exports = router;