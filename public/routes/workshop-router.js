const express = require('express');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

// Create the router
let router = express.Router();
router.use("/", auth);

router.get("/createworkshop", verifyArtist, (req, res) => { res.render("pages/createworkshop", {session: req.session, title: "Create Workshop"})});
router.get("/:id", getWorkshop, genWorkshop);

router.post("/createworkshop", verifyArtist, createWorkshop, notify, (req, res) => { res.status(200).send();});

router.put("/toggle/:id", getWorkshop, toggleWorkshop);



// Function to create workshop
function createWorkshop(req, res, next) {
	let userId = req.session.userId;
	let username = req.session.username;
	let name = req.body.name;
	let description = req.body.description;

	// Upload workshop data to workshop collection
	req.app.locals.db.collection("workshops").insertOne({name: name, description: description, userId: userId, username: username, users: []}, function(err, result){
		if(err){
            res.status(500).send("Error creating workshop");
			return;
		} else {
            req.workshopName = name;
            next();
            
		}
	});
}

// Function to get workshop data
function getWorkshop(req, res, next) {
    let id = req.params.id;
    //check if id is valid
    if(!ObjectId.isValid(id)){
        res.status(404).send("Workshop not found");
        return;
    }
    
    req.app.locals.db.collection("workshops").findOne({_id: ObjectId(id)}, function(err, result) {
        if(err) {
            res.status(500).send("Error reading database");
            return;
        } else {
            req.workshop = result;
            if(result == null) {
                res.status(404).send("Workshop not found");
                return;
            }

            next();
        }
    });
}

function genWorkshop(req, res, next) {
    res.render("pages/workshop", {session: req.session, title: req.workshop.name, workshop: req.workshop});
}

function toggleWorkshop(req, res, next){
    let id = req.session.userId;
    let username = req.session.username;

    let dat = {id: id, username: username}

    // check if user is owner of workshop
    if(req.workshop.userId === id){
        res.status(403).send("You are the owner of this workshop");
        return;
    }

    if((req.workshop.users.some(el => el.id === id))){ 
        req.app.locals.db.collection("workshops").updateOne({_id: ObjectId(req.workshop._id)}, {$pull: {users: {id: id}}}, function(err, result) {
            if(err) {
                res.status(500).send("Error reading database");
                return;
            } else {
                res.status(200).send("Workshop left");
            }
        });
    } else {
        req.app.locals.db.collection("workshops").updateOne({_id: ObjectId(req.workshop._id)}, {$push: {users: dat}}, function(err, result) {
            if(err) {
                res.status(500).send("Error reading database");
                return;
            } else {
                res.status(200).send("Workshop joined");
            }
        });
    }

}

// Function to add notification when workshop is created
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
                req.app.locals.db.collection("users").updateOne({_id: result[i]._id}, {$push: {notifications: {artistName: req.session.username, artistId: req.session.userId, message: `is hosting a new workshop called ${req.workshopName}`, date: tdDate}}}, function(err, result) {
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
function auth(req, res, next) {
	//check if there a loggedin property set for the session
	if (!req.session.loggedIn) {
		res.status(401).send("Unauthorized");
		return;
	}

	next();
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



// Export the router
module.exports = router;