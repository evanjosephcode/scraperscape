var db = require("./../models");

module.exports = function (app) {

    app.get("/*", (req, res) => {
        db.Article.find({})
            .then(function (dbArticle) {
                res.render("index", {
                    articles: dbArticle
                });
            })
            .catch(function (err) {
                res.json(err);
            });
    });

};