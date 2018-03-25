var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("../models");

module.exports = {
    getArticles: function (req, res) {
        // Grab every doc in the Articles array
        db.Article.find({}, function (error, doc) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Or send the doc to the browser as a json object
            else {
                res.json(doc);
            }
        });
    },

    getArticle: function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ "_id": req.params.id })
            // ..and populate all of the notes associated with it
            .populate("note")
            // now, execute our query
            .exec(function (error, doc) {
                // Log any errors
                if (error) {
                    console.log(error);
                }
                // Otherwise, send the doc to the browser as a json object
                else {
                    res.json(doc);
                }
            });
    },

    updateArticle: function (req, res) {
        // Use the article id to find and update its saved boolean
        db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true })
            // Execute the above query
            .exec(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                else {
                    // Or send the document to the browser
                    res.send(doc);
                }
            });
    },
    deleteArticle: function (req, res) {
        // Use the article id to find and update its saved boolean
        db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false, "notes": [] })
            // Execute the above query
            .exec(function (err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
                else {
                    // Or send the document to the browser
                    res.send(doc);
                }
            });
    },
    createNote: function (req, res) {
        // Create a new note and pass the req.body to the entry
        var newNote = new db.Note({
            body: req.body.text,
            article: req.params.id
        });
        console.log(req.body)
        // And save the new note the db
        newNote.save(function (error, note) {
            // Log any errors
            if (error) {
                console.log(error);
            }
            // Otherwise
            else {
                // Use the article id to find and update it's notes
                db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": note } })
                    // Execute the above query
                    .exec(function (err) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                            res.send(err);
                        }
                        else {
                            // Or send the note to the browser
                            res.send(note);
                        }
                    });
            }
        });
    },

    deleteNote: function (req, res) {
        // Use the note id to find and delete it
        db.Note.findOneAndRemove({ "_id": req.params.note_id }, function (err) {
            // Log any errors
            if (err) {
                console.log(err);
                res.send(err);
            }
            else {
                db.Article.findOneAndUpdate({ "_id": req.params.article_id }, { $pull: { "notes": req.params.note_id } })
                    // Execute the above query
                    .exec(function (err) {
                        // Log any errors
                        if (err) {
                            console.log(err);
                            res.send(err);
                        }
                        else {
                            // Or send the note to the browser
                            res.send("Note Deleted");
                        }
                    });
            }
        });
    },
    homePage: function (req, res) {
        db.Article.find({ "saved": false }, function (error, data) {
            var hbsObject = {
                article: data
            };
            console.log(hbsObject);
            res.render("home", hbsObject);
        });
    },
    saved: function (req, res) {
        db.Article.find({ "saved": true }).populate("notes").exec(function (error, articles) {
            var hbsObject = {
                article: articles
            };
            res.render("saved", hbsObject);
        });
    }
}