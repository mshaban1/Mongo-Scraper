// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("../models");

module.exports = {
    scrape: function (req, res) {
        // First, we grab the body of the html with request
        request("https://www.nytimes.com/", function (error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);
            // Now, we grab every h2 within an article tag, and do the following:
            $("article").each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Add the title and summary of every link, and save them as properties of the result object
                result.title = $(this).children("h2").text();
                result.summary = $(this).children(".summary").text();
                result.link = $(this).children("h2").children("a").attr("href");

                // Using our Article model, create a new entry
                // This effectively passes the result object to the entry (and the title and link)
                var entry = new db.Article(result);

                // Now, save that entry to the db
                entry.save(function (err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    // Or log the doc
                    else {
                        console.log(doc);
                    }
                });

            });
            res.send("Scrape Complete");
        });
        // Tell the browser that we finished scraping the text
    },

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