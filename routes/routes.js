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
      .populate("note")
      .then(function(dbArt) {
        res.render("saved", { news: dbArt });
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  // Removes article
  app.post("/deletingarticle/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArt) {
        //remiving art now
        db.Article.deleteOne({
          _id: req.params.id
        })
          .then(result => {
            res.end();
          })
          .catch(error => {
            res.send(err);
          });
        //removing notes if has
        if (dbArt) {
          var notes = dbArt.note;
          for (let i = 0; i < notes.length; i++) {
            db.Note.deleteOne({
              _id: notes[i]._id
            }).then(result => {});
          }
        }
        //remiving art now
        db.Article.deleteOne({
          _id: req.params.id
        })
          .then(result => {
            res.end();
          })
          .catch(error => {
            res.send(err);
          });
      });
  });

  app.post("/savingarticle", function(req, res) {
    db.Article.create(req.body)
      .then(function(dbArticle) {
        res.send(dbArticle);
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  // Adds a new note
  app.post("/newnote/:id", (req, res) => {
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Article.findOneAndUpdate(
          {
            _id: req.params.id
          },
          { $push: { note: dbNote._id } },
          { new: true }
        );
      })
      .then(function(dbUser) {
        res.json(dbUser);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  //
  app.post("/aarticle/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
      .populate("note")
      .then(function(dbArt) {
        res.send(dbArt);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.get("*", function(req, res) {
    res.render("home");
  });
};
