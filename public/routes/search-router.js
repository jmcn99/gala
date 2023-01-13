const express = require('express');
const path = require('path');
const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;

// Create the router
let router = express.Router();

// Methods
router.use("/", auth);

router.get("/", (req,res,next) => { res.render("pages/search", {session: req.session, title: "search"})});
router.get("/s/", pages, search, genSearch);


// auth method
function auth(req, res, next) {
	//check if there a loggedin property set for the session
	if (!req.session.loggedIn) {
		res.status(401).send("Unauthorized");
		return;
	}

	next();
}

// method to handle search
function search(req, res, next) {
    let search = req.query.search;
    let searchType = req.query.search_type;
    req.search = search;

    console.log("SAERCH: " + search + " TYPE: " + searchType);

    // If search === username, return all images by that user
    if(searchType === "username") {
        req.app.locals.db.collection("gallery").find({artist: search}).skip(req.skip).limit(req.perPage).toArray(function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }

            req.gallery = result;
            next();
        });
    // Else if search === category, return all images with that category
    } else if(searchType === "category") {
        req.app.locals.db.collection("gallery").find({category: search}).skip(req.skip).limit(req.perPage).toArray(function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }

            req.gallery = result;
            next();
        });
    // Else if search === title, return all images with that title
    } else if(searchType === "name") {
        req.app.locals.db.collection("gallery").find({name: search}).skip(req.skip).limit(req.perPage).toArray(function(err, result){
            if(err){
                res.status(500).send("Error reading database.");
                return;
            }

            req.gallery = result;
            next();
        });
    } else {
        res.status(500).send("Error reading database.");
        return;
    }

}

// method to render search page
function genSearch(req, res, next) {
    res.render("pages/gallery", {session: req.session, title: `search results for ${req.search}` , gallery: req.gallery, search: true, searchQuery: req.search, page: req.page, pages: req.pages,searchType: req.query.search_type});
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

module.exports = router;