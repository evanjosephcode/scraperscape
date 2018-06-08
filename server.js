var express = require("express");
var expresshb = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan");

// Set mongoose to leverage built in JavaScript ES6 Promises
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
//   partialsDir: path.join(__dirname, '/views/partials'),
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
    res.json(foo);
  });
});

app.get("/all", function (req, res) {
  // Find all results from the scrapedData collection in the db
  db.Article.find({}, function (error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});