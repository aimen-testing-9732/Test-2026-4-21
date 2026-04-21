var overlay = $('<div id="overlay"></div>');
var loader = $(
  '<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">'
);

function showLoader() {
  if ($("#overlay").length === 0) {
    overlay.appendTo(document.body);
    loader.appendTo(overlay);
  }
}

function hideLoader() {
  $("#overlay").remove();
}

function isEmptyContent(content) {
  return content.trim() === '<p><br></p>' || content.trim() === '' || $('<div>').html(content).text().trim() === "";
}

function isInputEmpty(inputValue, errorSpan) {
  let strippedContent = $('<div>').html(inputValue).text().trim();
  if (inputValue.trim() === '' || inputValue.trim() === '<p><br></p>' || strippedContent === '') {
    sub_ok = 0;
    $(errorSpan).css({ 'display': 'block' });
  } else {
    $(errorSpan).css({ 'display': 'none' });
  }
}
function initJoditEditor(selector) {
  return new Jodit(selector, {
    height: 280,
    toolbar: true,
    editorClassName: "textColor",
  });
}

$(document).ready(function () {
  var shortDetailsEditor = initJoditEditor("#shortDetails");
  $("#updateShortDetails").on("click", function (e) {
    e.preventDefault();
    var shortDetails = shortDetailsEditor.getEditorValue();
    var sub_ok = 1;
    isInputEmpty(shortDetails, "#shortDetails-error");
    if (isEmptyContent(shortDetails)) {
      sub_ok = 0;
      $("#shortDetails").closest(".jodit-editor").addClass("error");
    } else {
      $("#shortDetails").closest(".jodit-editor").removeClass("error");
    }
    if (sub_ok === 0) {

      return false;
    }

    showLoader();

    $.post(
      "update-audit-description",
      {
        shortDetails: shortDetails
      },
      function (response) {

        hideLoader();

        let resData = JSON.parse(response);

        if (resData.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: resData.message,
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: resData.message,
            confirmButtonText: "OK",
          });
        }
      }
    );
  });
  /*--------------------- Submit Audit -------------------------*/
  $("#submitAudit").on("click", function (e) {
    e.preventDefault();

    let fn_year = $("#fn_year").val().trim();
    let audit_sts = $("#audit_sts").val().trim();
    let remarks = $("#remarks").val().trim();

    // Validation
    if (fn_year === "" || audit_sts === "") {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all fields",
        confirmButtonText: "OK",
      });
      return;
    }

    showLoader();

    $.post(
      "add-audit",
      {
        fn_year: fn_year,
        audit_sts: audit_sts,
        remarks: remarks,
      },
      function (response) {
        hideLoader();

        let resData = JSON.parse(response);

        if (resData.status === true) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: resData.message,
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: resData.message,
            confirmButtonText: "OK",
          });
        }
      }
    );
  });

});