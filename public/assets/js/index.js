function SavingArticle() {
  var ind = $(this).data("ind");

  var art = {
    title: $(this + " #" + ind + ":parent a.article-link").text(),
    link: $(this).data("link"),
    summary: $(this + " #" + ind + ":parent .card-body").text()
  };

  $(this + " #" + ind + ":parent").remove();

  $.ajax({
    url: "/savingarticle",
    type: "POST",
    data: art
  }).then(function(result) {});
}

function DeletingArticle() {
  $.post(`/deletingarticle/${$(this).attr("id")}`, result => {
    $(this + " div#" + $(this).attr("id") + ":parent").remove();
  });
}

function SavingNote() {
  if (
    $("#message-text")
      .val()
      .trim() !== ""
  ) {
    var id = $(this).data("id");
    $.ajax({
      method: "POST",
      url: `/newnote/${id}`,
      data: {
        body: $("#message-text")
          .val()
          .trim()
      }
    }).then(function(data) {
      $("#message-text").val("");
      $("#btnsavenote").attr("data-id", "");
      location.reload();
    });
  } else {
    $("#message-text").css("background", "rgb(240, 207, 207)");
  }
}

function FillingModal() {
  var id = $(this).data("id");
  $("#btnsavenote").attr("data-id", id);

  $.post(`/aarticle/${id}`, result => {
    var notes = result.note;
    $("#noteslist").empty();
    if (notes.length === 0) {
      $("#noteslist").append("<li>There are not notes yet.</li>");
    } else
      for (let i = 0; i < notes.length; i++) {
        $("#noteslist").append("<li>" + notes[i].body + "</li>");
      }
  });
}

$(document).ready(function() {
  $(document).on("click", ".save", SavingArticle);
  $(document).on("click", ".delete", DeletingArticle);
  $(document).on("click", ".savenote", SavingNote);
  $(document).on("click", ".notes", FillingModal);
  $(document).on("click", ".textempty", () => {
    $("#message-text").val("");
  });
  $(document).on("blur", ".savenote", () => {
    $("#message-text").css("background", "white");
  });
});
