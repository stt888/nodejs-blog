$(document).ready(function() {
  $(".delete-article").on("click", function(e) {
    var id = $(e.target).attr("data-id");
    console.log(id);
    $.ajax({
      type: "DELETE",
      url: "/articles/" + id,
      success: function() {
        alert("delete success.");
        window.location.href = "/";
      },
      erorr: function(err) {
        console.log(err);
      }
    });
  });
});
