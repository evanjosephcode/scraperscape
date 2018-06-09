var db = require("./../models");

module.exports = function (app) {

    app.get("/", (req, res) => {
        // res.render("index");
        res.send("hello world");
    });

}