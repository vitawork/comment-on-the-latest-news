var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

var scraped = false;

module.exports = function(app) {
  app.get("/scrape", function(req, res) {
    var results = [];
    axios.get("https://www.nytimes.com").then(function(response) {
      var $ = cheerio.load(response.data);

      $("article").each(function(i, element) {
        var title = $(element)
          .find("h2")
          .text();
        var link = $(element)
          .find("a")
          .attr("href");

        var summary = $(element)
          .find("p")
          .text();
        if (summary !== "") {
        //   db.Article.findOne({ link: "https://www.nytimes.com" + link })
        //     .then(function(dbArt) {
        //       if (!dbArt) {
        //         scraped = true;
                results.push({
                  title: title,
                  link: "https://www.nytimes.com" + link,
                  summary: summary
                });
            //   }
            // })
            // .catch(function(err) {
            //   res.json(err);
            // });
        }
      });

      res.render("home", { news: results });
    });
  });

  app.get("/home", function(req, res) {
    scraped ? res.redirect("./scrape") : res.render("home");
  });

  app.get("/clear", function(req, res) {
    scraped = false;
    res.render("home");
  });

  app.post("/savingarticle", function(req, res) {
    db.Article.create(req.body)
      .then(function(dbArticle) {
        res.send(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, log it
        console.log(err);
      });
  });

  app.get("*", function(req, res) {
    res.render("home");
  });
};
