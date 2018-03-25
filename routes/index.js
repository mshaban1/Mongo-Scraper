const express = require('express');
const router = express.Router();


// Require all models
var db = require("../models");

const scrape = require('../scripts/scrape.js')

const controller = require('../controller');

router.get("/", controller.homePage);

router.get("/saved", controller.saved);

// A GET route for scraping the echojs website
router.get("/scrape", scrape.scrape);

// Route for getting all Articles from the db
router.get("/articles", controller.getArticles);

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", controller.getArticle);

// Route for saving/updating an Article's associated Note
router.post("/articles/save/:id", controller.updateArticle);

// Route for delete an Article's
router.post("/articles/delete/:id", controller.deleteArticle);

// Create a new note
router.post("/notes/save/:id", controller.createNote);

// Delete a note
router.delete("/notes/delete/:note_id/:article_id", controller.deleteNote);

module.exports = router