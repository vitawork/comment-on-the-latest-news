console.log("###########################");

function SavingArticle() {
  var ind = $(this).data("ind");

  var art = {
    title: $(this + " #" + ind + ":parent a.article-link").text(),
    link: $(this).data("link"),
    summary: $(this + " #" + ind + ":parent .card-body").text()
  };

  $(this + " #" + ind + ":parent").remove();
  //   $.post("/savingarticle", art)
  //   .then(function(result) {});

  $.ajax({
    url: "/savingarticle",
    type: "POST",
    data: art
  }).then(function(result) {});
}

function DeletingArticle() {
  console.log("1111111111111111111111"); ///////////////////////////

  $.post(`/deletingarticle/${$(this).attr("id")}`, result => {
    console.log(`Removed note`); ///////////////////////////////////
    $(this + " div#" + $(this).attr("id") + ":parent").remove();
  });
}

$(document).ready(function() {
  $(document).on("click", ".save", SavingArticle);
  $(document).on("click", ".delete", DeletingArticle);
});
