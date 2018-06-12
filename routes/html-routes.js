var db = require("./../models");

module.exports = function (app) {

    app.get("/", (req, res) => {
        db.Article.find({})
            .then(function (articles) {
                // If we were able to successfully find Article, send them back to the client
                res.render('index', { results: articles });
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });

}