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
    }
};