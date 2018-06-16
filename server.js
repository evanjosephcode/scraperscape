var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan");
var path = require("path");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


var PORT = 3000;
var app = express();
app.use(logger("dev"));

// hb config
app.engine('handlebars', exphbs({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '/views/layouts')
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


// routes
require("./routes/api-routes.js")(app);
require("./routes/html-routes.js")(app);


app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});