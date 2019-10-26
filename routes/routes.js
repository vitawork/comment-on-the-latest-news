var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

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
          db.Article.create({
            title: title,
            link: "https://www.nytimes.com" + link,
            summary: summary,
            saved: false
          }).then(function(dbArticle) {});
        }
      });
      res.redirect("/");
    });
  });

  app.get("/home", function(req, res) {
    res.redirect("/");
  });

  app.get("/clear", function(req, res) {
    db.Article.deleteMany({ saved: false })
      .then(() => {
        res.render("home");
      })
      .catch(error => {
        console.log(error);
      });
  });

  app.get("/clearsavedart", function(req, res) {
    db.Article.deleteMany({ saved: true })
      .then(() => {
        db.Note.deleteMany({})
          .then(() => {
            res.redirect("/");
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
  });

  app.get("/savedarticles", function(req, res) {
    db.Article.find({ saved: true })
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
      });
  });

  // Removes note
  app.post("/deletingnote/:id", (req, res) => {
    db.Note.deleteOne({
      _id: req.params.id
    })
      .then(result => {
        res.end();
      })
      .catch(error => {
        res.send(err);
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

  app.post("/savingarticle/:id", function(req, res) {
    db.Article.findOneAndUpdate(
      {
        _id: req.params.id
      },
      { saved: true }
    )
      .then(function(dbArticle) {
        res.send(dbArticle);
      })
      .catch(function(err) {
        console.log(err);
      });
  });

  // Adds a new note
  app.post("/newnote/:id", (req, res) => {
    var noteid;
    db.Note.create(req.body)
      .then(function(dbNote) {
        noteid = dbNote._id;
        return db.Article.findOneAndUpdate(
          {
            _id: req.params.id
          },
          { $push: { note: noteid } },
          { new: true }
        );
      })
      .then(function(dbUser) {
        res.send(noteid);
      })
      .catch(function(err) {
        res.json(err);
      });
  });

  app.get("*", function(req, res) {
    db.Article.find({ saved: false })
      .then(function(dbArt) {
        res.render("home", { news: dbArt });
      })
      .catch(function(err) {
        res.json(err);
      });
  });
};
