var express = require("express");
var expresshb = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/mongoHeadlines");


var PORT = 3000;
var app = express();
app.use(logger("dev"));

// hb config
// app.engine('handlebars', exphbs({
//   extname: '.handlebars',
//   defaultLayout: 'main',
//   layoutsDir: path.join(__dirname, '/views/layouts')
// }));

// app.set('view engine', 'handlebars');
// app.set('views', path.join(__dirname, '/views'));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// routes
// require("./routes/api-routes.js")(app);
// require("./routes/html-routes.js")(app);


app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});

var db = require("./models");



// put in server file 

app.get("/scrape", function (req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.washingtonpost.com/", function (error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    var foo = {};
    // For each element with a "title" class
    $(".pb-feature").each(function (i, element) {
      var result = {};
      // var foo = {};

      // Add the text and href of every link, and save them as properties of the result object
      if (!$(this).find(".blurb").text() || !$(this).find(".headline a").attr("href") || !$(this).find(".headline a").text()) {
        return;
      }

      result.summary = $(this).find(".blurb").text();
      result.link = $(this).find(".headline a").attr("href");
      result.headline = $(this).find(".headline a").text();

      // console.log(JSON.stringify(result, null, 2));


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


app.get("/", (req, res) => {
  // res.render("index");
  res.send("hello world");
});

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

app.get("/api/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
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
