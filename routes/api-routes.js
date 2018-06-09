var db = require("./../models");

var cheerio = require("cheerio");
var request = require("request");

module.exports = function (app) {

    // scrape
    app.get("/scrape", function (req, res) {
        // Make a request for the news section of ycombinator
        request("https://www.washingtonpost.com/", function (error, response, html) {
            // Load the html body from request into cheerio
            var $ = cheerio.load(html);
            var foo = {};
            // For each element with a "title" class
            $(".pb-feature").each(function (i, element) {
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                if (!$(this).find(".blurb").text() || !$(this).find(".headline a").attr("href") || !$(this).find(".headline a").text()) {
                    return;
                }

                result.summary = $(this).find(".blurb").text();
                result.link = $(this).find(".headline a").attr("href");
                result.headline = $(this).find(".headline a").text();


                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                        // View the added result in the console
                        foo[i] = dbArticle;
                    })
                    .catch(function (err) {
                        // If an error occurred, send it to the client
                        console.error(err);
                    });

            });
            res.send("Scrape complete");
            res.redirect
            // res.json(foo);
        });
    });


    // all articles in json 
    app.get("/api/articles", function (req, res) {
        // Grab every document in the Article collection
        db.Article.find({})
            .then(function (dbArticle) {
                // If we were able to successfully find Article, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

    //   article by id in json
    app.get("/api/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({
                _id: req.params.id
            })
            // ..and populate all of the notes associated with it
            .populate("notes")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

}