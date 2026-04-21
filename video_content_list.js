var overlay = $('<div id="overlay" ></div>');
var loader = $(
  '<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">'
);

function showLoader() {
  overlay.appendTo(document.body);
  loader.appendTo(overlay);
}

function hideLoader() {
  overlay.remove();
}

function toggleBurger() {
  const burger = document.getElementById("burger");
  const rightTab = document.querySelector(".right-tab ");
  const isShrunk = burger.classList.toggle("shrink");

  if (window.innerWidth <= 992) {
    if (isShrunk) {
      rightTab.style.marginLeft = "20px";
    } else {
      rightTab.style.marginLeft = "20px";
    }
  }
}
document.querySelectorAll(".list-menu li a").forEach((menuItem) => {
  menuItem.addEventListener("click", () => {
    const chartTable = document.querySelector(".chart-table");
    chartTable.style.display = "block";
    chartTable.classList.add("cube-animation");
    setTimeout(() => {
      chartTable.classList.remove("cube-animation");
    }, 600);
  });
});

function handleFileSelection(file, maxSize, allowedTypes) {
  if (!file) return;

  if (file.size > maxSize) {
    Swal.fire({
      icon: "error",
      title: "File Too Large",
      text: `File size exceeds maximum limit of ${(
        maxSize /
        (1024 * 1024)
      ).toFixed(0)}MB`,
    });
    resetFileInput();
    return;
  }

  const fileExt = file.name.split(".").pop().toLowerCase();
  if (!allowedTypes.includes(fileExt)) {
    Swal.fire({
      icon: "error",
      title: "Invalid File Type",
      text: `Allowed formats: ${allowedTypes.join(", ")}`,
    });
    resetFileInput();
    return;
  }

  $("#fileName").text(file.name);
  $("#fileSize").text(formatFileSize(file.size));
  $("#fileInfo").removeClass("d-none");
}

function resetFileInput() {
  $("#videoFile").val("");
  $("#fileInfo").addClass("d-none");
}

// function generateVideoCard(video) {
//   // const token = btoa(`${video.guid}:${expires}`).replace(/[^a-zA-Z0-9]/g, '');
//   const embedUrl = `https://iframe.mediadelivery.net/embed/<?php echo BUNNY_LIBRARY_ID; ?>/${video.guid}`;
//   const thumbnailBaseUrl = "https://thumbs.mediadelivery.net/"; // Set your actual thumbnail base URL here
//   const thumbnailUrl = video.thumbnailFileName
//     ? `${thumbnailBaseUrl}${encodeURIComponent(video.guid)}/${encodeURIComponent(
//         video.thumbnailFileName
//       )}`
//     : "";

//   const statusText =
//     video.status && typeof video.status === "string" ? video.status : "Unknown";
//   const statusClass = "status-" + statusText.toLowerCase();

//   const duration = video.length
//     ? formatDuration(video.length)
//     : "Processing...";
//   const uploadDate = video.dateUploaded
//     ? formatDate(video.dateUploaded)
//     : "Unknown";

//   return `
//       <div class="col-xl-3 col-lg-4 col-md-6 mb-4">
//         <div class="video-card h-100">
//           ${thumbnailUrl
//       ? `<img src="${thumbnailUrl}" class="video-thumbnail" alt="Thumbnail">`
//       : `<div class="video-thumbnail d-flex align-items-center justify-content-center bg-primary">
//               <i class="fas fa-video fa-3x text-black"></i>
//             </div>`
//     }
//         <div class="video-info p-3">
//           <h6 class="mb-2 text-truncate" title="${escapeHtml(video.title)}">${escapeHtml(
//       video.title
//     )}</h6>
//           <div class="mb-2">
//             <span class="badge ${statusClass}">${video.status}</span>
//           </div>
//           <small class="text-muted d-block mb-2">
//             <i class="fas fa-clock"></i> ${duration}<br>
//             <i class="fas fa-calendar"></i> ${uploadDate}
//           </small>
//           <div class="d-flex flex-wrap justify-content-center gap-2 mt-3">
//             <button class="btn btn-sm btn-outline-secondary" onclick="copyVideoId('${video.guid
//     }')" title="Copy ID">
//               <i class="fas fa-copy"></i>
//             </button>
//             <button class="btn btn-sm btn-outline-primary" onclick="playVideo('${embedUrl}', '${escapeHtml(
//       video.title
//     )}')" title="Play">
//               <i class="fas fa-play"></i>
//             </button>
//             <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${video.guid
//     }', '${escapeHtml(video.title)}')" title="Delete">
//               <i class="fas fa-trash"></i>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//     `;
// }

function uploadVideoFile(file, uploadUrl, apiKey) {
  $("#uploadBtn").html('<i class="fas fa-spinner fa-spin"></i> Uploading...');
  uploadStartTime = Date.now();
  lastProgressTime = uploadStartTime;
  lastProgressLoaded = 0;

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", uploadUrl, true);
  xhr.setRequestHeader("AccessKey", apiKey);
  xhr.setRequestHeader("Content-Type", "application/octet-stream");

  xhr.upload.addEventListener("progress", function (e) {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      $(".progress-bar").css("width", `${percent}%`);
      $("#progressText").text(`${percent}%`);

      // Calculate speed and ETA
      const currentTime = Date.now();
      const timeDiff = (currentTime - lastProgressTime) / 1000;
      const bytesDiff = e.loaded - lastProgressLoaded;

      if (timeDiff > 0.5) {
        const speed = bytesDiff / timeDiff;
        const speedMB = (speed / 1024 ** 2).toFixed(2);
        const remainingBytes = e.total - e.loaded;
        const eta = remainingBytes / speed;

        $("#speedText").text(`${speedMB} MB/s`);
        $("#etaText").text(formatTime(eta));

        lastProgressTime = currentTime;
        lastProgressLoaded = e.loaded;
      }
    }
  });

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      $.post(
        "",
        {
          video_uploaded: true,
          file_name: file.name,
          file_size: file.size,
          upload_url: uploadUrl,
        },
        function (response) {
          Swal.fire({
            icon: "success",
            title: "Upload Complete!",
            text: "Your video was uploaded successfully",
            timer: 2000,
            showConfirmButton: false,
          });
          $("#uploadModal").modal("hide");
          $("#uploadForm").trigger("reset");
        }
      );
    } else {
      resetUploadButton();
      showError(`Upload failed: ${xhr.statusText || "Unknown error"}`);
    }
  };

  xhr.onerror = function () {
    resetUploadButton();
    showError("Upload failed due to network error");
  };

  xhr.send(file);
}

function resetUploadButton() {
  $("#uploadBtn")
    .prop("disabled", false)
    .html('<i class="fas fa-upload"></i> Upload Video');
}

function startUpload() {
  const title = $("#videoTitle").val().trim();
  const fileInput = $("#videoFile")[0];

  if (!title) {
    Swal.fire({
      icon: "warning",
      title: "Missing Title",
      text: "Please enter a video title",
    });
    return;
  }

  if (!fileInput.files || !fileInput.files[0]) {
    Swal.fire({
      icon: "warning",
      title: "No File Selected",
      text: "Please select a video file to upload",
    });
    return;
  }

  const file = fileInput.files[0];
  $("#uploadBtn")
    .prop("disabled", true)
    .html('<i class="fas fa-spinner fa-spin"></i> Creating...');
  $("#uploadProgress").show();
  $("#uploadStatus").removeClass("d-none");

  $.post(
    "",
    {
      create_video: true,
      title,
    },
    function (response) {
      if (response.success) {
        uploadVideoFile(file, response.upload_url);
      } else {
        resetUploadButton();
        showError(response.error || "Failed to create video entry");
      }
    },
    "json"
  ).fail(() => {
    resetUploadButton();
    showError("Failed to communicate with server");
  });
}

function resetUploadForm() {
  $("#videoTitle").val("");
  resetFileInput();
  $("#uploadProgress").hide();
  $("#uploadStatus").addClass("d-none");
  $(".progress-bar").css("width", "0%");
  $("#progressText").text("0%");
  resetUploadButton();
}

function formatFileSize(bytes) {
  if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + " MB";
  return (bytes / 1024).toFixed(2) + " KB";
}

function formatDuration(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(dateString) {
  try {
    var date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  } catch (e) {
    return "Unknown";
  }
}

function playVideo(embedUrl, title) {
	showLoader();

   if (!embedUrl.includes("autoplay=1")) {
    embedUrl += (embedUrl.includes("?") ? "&" : "?") + "autoplay=1";
  }
  // Set the title and src each time modal is opened
  $("#modalVideoPlayer").attr("src", embedUrl);
  hideLoader();
  $("#videoModalTitle").html('<i class="fas fa-play-circle me-2"></i>' + title);
 

  // Show modal
  if (typeof bootstrap !== "undefined" && bootstrap.Modal) {
    var modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();
  } else {
    $("#videoModal").modal("show");


  }

  // Reset video src and title when modal is closed to prevent appending or playback issues
  $("#videoModal").off("hidden.bs.modal").on("hidden.bs.modal", function () {
    $("#modalVideoPlayer").attr("src", "");
    $("#videoModalTitle").html("");
  });
}


function stopVideo() {
  $("#modalVideoPlayer").attr("src", "");
}


function formatTime(seconds) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600)
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showError(message) {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
  });
}

function copyVideoId(videoId) {
  navigator.clipboard
    .writeText(videoId)
    .then(function () {
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Video ID copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    })
    .catch(function () {
      var textArea = document.createElement("textarea");
      textArea.value = videoId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "Video ID copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    });
}

function confirmDelete(videoId, title) {
  Swal.fire({
    title: "Delete Video?",
    text:
      'Are you sure you want to delete "' +
      title +
      '"? This action cannot be undone.',
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: '<i class="fas fa-trash"></i> Yes, Delete',
    cancelButtonText: '<i class="fas fa-times"></i> Cancel',
  }).then((result) => {
    if (result.isConfirmed) {
      deleteVideo(videoId, title);
    }
  });
}

function deleteVideo(videoId, title) {
  Swal.fire({
    title: "Deleting...",
    text: "Please wait while we delete the video",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  $.post(
    "",
    {
      delete_video: true,
      video_id: videoId,
    },
    function (response) {
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: 'Video "' + title + '" has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        showError("Failed to delete video: " + response.error);
      }
    },
    "json"
  ).fail(function () {
    showError("Failed to communicate with server");
  });
}

$(document).ready(function () {
  // var overlay = jQuery('<div id="overlay"></div>');
  // var itemPerPage = 20;
  var itemPerPage = $("#pagi_record_per_page").val();

  var currentPageNo = 1;
  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };

  $("#pagi_holder").pagination({
    items: 0,
    itemsOnPage: itemPerPage,
    useAnchors: false,
    cssStyle: "light-theme",
    onPageClick: function (pageNumber, event) {
      currentPageNo = pageNumber;
      load_page(currentPageNo);
    },
  });

  load_page(currentPageNo);

  $("#pagi_record_per_page").on('change', function () {
    itemPerPage = $("#pagi_record_per_page").val();
    $(function () {
      $("#pagi_holder").pagination('updateItemsOnPage', itemPerPage);
    });
  });

  function load_page(pageNo) {
    // overlay.appendTo(document.body);
    showLoader();

    var src_video_title = "";
    if (getUrlParameter("src_video_title") !== undefined) {
      src_video_title = getUrlParameter("src_video_title").replace(/\+/g, " ");
    } else {
      src_video_title = "";
    }

    var src_sort_by = "";
    if (getUrlParameter("src_sort_by") !== undefined) {
      src_sort_by = getUrlParameter("src_sort_by").replace(/\+/g, " ");
    } else {
      src_sort_by = "";
    }

    var btn = "";
    if (getUrlParameter("src") !== undefined) {
      btn = getUrlParameter("src").replace(/\+/g, " ");
    } else {
      btn = "";
    }

    sl_no = pageNo * itemPerPage - itemPerPage + 1;

    $("#show_result").html("");

    $.post(
      "controllers/video_content_list_ctrl",
      {
        post_page_no: pageNo,
        post_itemPer_page: itemPerPage,
        src_video_title: src_video_title,
        src_sort_by: src_sort_by,
        post_btn: btn,
      },
      function (backdata) {
        hideLoader();

        var ret_data = JSON.parse(backdata);
        $(function () {
          $("#pagi_holder").pagination("updateItems", ret_data["total_records"]);
        });

        $("#pagi_total_records").html(
          "Total Records: " + ret_data["total_records"]
        );

        $.each(ret_data["table_data"], function (index, items) {
          if (items.end_list == 0) {
            var embedUrl = items.Embed_URL;
            // var embedUrl = `https://iframe.mediadelivery.net/embed/` + libraryId + `/${items.Bunny_Video_ID}`;

            var copy_btn = `<button class="btn btn-sm btn-outline-secondary" onclick="copyVideoId('${items.Bunny_Video_ID}')" title="Copy ID"><i class="fas fa-copy"></i></button>`;
            var play_btn = `<button class="btn btn-sm btn-outline-primary" onclick="playVideo('${embedUrl}', '${escapeHtml(items.Title)}')" title="Play"><i class="fas fa-play"></i></button>`;
            var delete_btn = `<button class="btn btn-sm btn-outline-danger" onclick="confirmDelete('${items.Bunny_Video_ID}', '${escapeHtml(items.Title)}')" title="Delete"><i class="fas fa-trash"></i></button>`;

            function formatValue(value) {
              return value === null || value === undefined || value === ""
                ? "-"
                : value;
            }

            $("#show_result").append(
              `
            <tr>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${sl_no}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${copy_btn}${play_btn}${delete_btn}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${formatValue(items.Title)}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${formatValue(items.Duration)}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${formatValue(items.File_Size)}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">${formatValue(items.Views)}</td>
              <td style="white-space:nowrap;text-align:center" class="text-md font-weight-normal">
                ${
                items.Is_Public == 1
                  ? '<i class="fas fa-globe text-success" title="Public"></i>'
                  : '<i class="fas fa-eye-slash text-danger" title="Unpublished"></i>'
                }
              </td>
              <td style="white-space:break-spaces;text-align:center" class="text-md font-weight-normal">${formatValue(items.Upload_DateTime)}</td>
            </tr>
          `);
                // <td style="white-space:break-spaces;text-align:center" class="text-md font-weight-normal">${formatValue(items.Is_Featured)}</td>

            sl_no = sl_no + 1;
          } else {
            var columnCount = $("#show_result").closest("table").find("thead th").length || 9;
            $("#show_result").append(
              `<tr>
            <td class="text-lg" style="color:red; white-space:nowrap;text-align:center" colspan="${columnCount}">No Video Found!</td>
          </tr>`
            );
          }
        });
      }
    )
  }
})
