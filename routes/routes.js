var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

var scraped = false;

module.exports = function(app) {
  app.get("/scrape", function(req, res) {
    var results = [];
    var ind = -1;
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
          // db.Article.findOne({ link: "https://www.nytimes.com" + link })
          //   .then(function(dbArt) {
          //     if (!dbArt) {

                scraped = true;
                ind += 1;
                results.push({
                  title: title,
                  link: "https://www.nytimes.com" + link,
                  summary: summary,
                  ind: ind
                });

        //       }
        //     })
        //     .catch(function(err) {
        //       res.json(err);
        //     });
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

  app.get("/savedarticles", function(req, res) {
    db.Article.find({})
      .then(function(dbArt) {
        res.render("saved", { news: dbArt });
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Removes article
  app.post("/deletingarticle/:id", (req, res) => {
    console.log("222222222222222222222222 " + req.params.id); ///////////////

    db.Article.deleteOne({
      _id: req.params.id
    })
      .then(result => {
        console.log("33333333333333333333333333 " + JSON.stringify(result)); ////////////
        res.end();
      })
      .catch(error => {
        res.send(err);
      });
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
