function SavingArticle() {
  var id = $(this).data("id");

  $(this + " #" + id + ":parent").remove();

  $.post(`/savingarticle/${id}`, result => {});
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
      $("#noteslist p").empty();
      $("#noteslist").append(
        "<li id=" +
          data +
          ">" +
          $("#message-text").val() +
          " <button id=" +
          data +
          " class='btn btn-link'> X</button></li>"
      );
      $("#message-text").val("");
      $("#btnsavenote").attr("data-id", "");
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
      $("#noteslist").append("<p>There are not notes yet.</p>");
    } else
      for (let i = 0; i < notes.length; i++) {
        $("#noteslist").append(
          "<li id=" +
            notes[i]._id +
            ">" +
            notes[i].body +
            " <button id=" +
            notes[i]._id +
            " class='btn btn-link'> X</button></li>"
        );
      }
  });
}

function DeletingNote() {
  $.post(`/deletingnote/${$(this).attr("id")}`, result => {
    $("#" + $(this).attr("id")).remove();
  });
}

$(document).ready(function() {
  $(document).on("click", ".save", SavingArticle);
  $(document).on("click", ".delete", DeletingArticle);
  $(document).on("click", ".savenote", SavingNote);
  $(document).on("click", ".notes", FillingModal);
  $(document).on("click", ".btn-link", DeletingNote);
  $(document).on("click", ".textempty", () => {
    $("#message-text").val("");
  });
  $(document).on("blur", ".savenote", () => {
    $("#message-text").css("background", "white");
  });
});
