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
mongoose.connect(MONGODB_URI);

  
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
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


// routes
// require("./routes/api-routes.js")(app);
// require("./routes/html-routes.js")(app);


app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});

var databaseUrl = "scraper";
var collections = ["scrapedData"];


// put in server file 

app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.washingtonpost.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".no-skin").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element

      var summary = $(element).children(".blurb").text();
      var link = $(element).children(".headline").attr("href");
      var headline = $(element).children(".headline").text();

      // If this found element had both link & headline
      if (link && headline && summary) {
        // Insert the data in the scrapedData db
        db.scrapedData.insert({
          link: link,
          headline: headline,
          summary: summary
        },
      // elseif (link && headline && summary == null) {
      //     // Insert the data in the scrapedData db
      //     db.scrapedData.insert({
      //       link: link,
      //       headline: headline,
      //       summary: "Summary is not avaialble for this article"
      //     },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
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



