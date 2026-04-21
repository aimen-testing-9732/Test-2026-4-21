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

// var itemPerPage = $("#pagi_record_per_page").val();
// var currentPageNo = 1;

// $("#pagi_holder").pagination({
//   items: 0,
//   itemsOnPage: itemPerPage,
//   useAnchors: false,
//   cssStyle: "light-theme",
//   onPageClick: function (pageNumber, event) {
//     currentPageNo = pageNumber;
//     load_page(currentPageNo);
//   },
// });

// load_page(currentPageNo);

// $("#pagi_record_per_page").on("change", function () {
//   itemPerPage = $("#pagi_record_per_page").val();
//   $(function () {
//     $("#pagi_holder").pagination("updateItemsOnPage", itemPerPage);
//   });
// });

$(document).on("click", ".editAudit", function () {
  $("#edit_audit_id").val($(this).data("id"));
  $("#edit_fn_year").val($(this).data("year"));
  $("#edit_audit_sts").val($(this).data("status"));
  $("#edit_remarks").val($(this).data("remark"));

  $("#editAuditModal").modal("show");
});

$(document).on("click", "#updateAudit", function () {

  var audit_id = $("#edit_audit_id").val();
  var fn_year = $("#edit_fn_year").val();
  var audit_sts = $("#edit_audit_sts").val();
  var remarks = $("#edit_remarks").val();

  $.post(
    "update-audit",
    {
      audit_id: audit_id,
      fn_year: fn_year,
      audit_sts: audit_sts,
      remarks: remarks
    },
    function (response) {

      var resp = JSON.parse(response);

      if (resp.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: resp.message,
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: resp.message,
          confirmButtonText: "OK",
        });
      }
    }
  );
});

// function load_page(pageNo) {
//   showLoader();

//   sl_no = pageNo * itemPerPage - itemPerPage + 1;

//   $("#show_result").empty();

//   $.post(
//     "view-job-list",
//     {
//       post_page_no: pageNo,
//       post_itemPer_page: itemPerPage,
//     },
//     function (backdata) {
//       hideLoader();

//       var ret_data = JSON.parse(backdata);

//       $("#pagi_holder").pagination("updateItems", ret_data.total_records);
//       $("#pagi_total_records").html("Total Records: " + ret_data.total_records);

//       if (ret_data.table_data && ret_data.table_data.length > 0) {
//         // var sl_no = 1;

//         $.each(ret_data.table_data, function (index, items) {
//           if (items.end_list == 0) {

// 				 let edit_td = '';

//     if (ret_data.editpermission == 1) {

//         let edit_btn =
//             '<a href="javascript:void(0)" ' +
//             'class="btn btn-outline btn-sm btn-rounded btn-info editBtn" ' +
//             'data-id="' + items.application_Id + '" ' +
//             'data-name="' + items.applied_for + '" ' +
//             'data-desc="' + items.position_applied + '" ' +
//             'data-status="' + items.status + '">' +
//             '<i class="fa fa-pencil"></i>' +
//             '</a>';

//         edit_td = `<td style="text-align:center">${edit_btn}</td>`;
//           }
//             $("#show_result").append(`
//             <tr>
//               <td style="text-align:center">${sl_no}</td>

//               ${edit_td}

//               <td style="text-align:center; color:${
//                 items.status === "1" ? "green" : "red"
//               }!important">
//                 ${items.status === "1" ? "Active" : "Inactive"}
//               </td>

//               <td style="text-align:center">${items.application_Id}</td>
//               <td style="text-align:center">${items.applied_for}</td>
//               <td style="text-align:left; white-space: pre-wrap; word-break: break-word;" >${
//                 items.position_applied
//               }</td>
//               <td style="text-align:center">${items.application_date}</td>
//               <td style="text-align:center">${items.time}</td>
//             </tr>
//           `);

//             sl_no++;
//           } else {
//             $("#show_result").append(`
//           <tr>
//             <td colspan="8" style="text-align:center;color:red;">
//               No Record Found!
//             </td>
//           </tr>
//         `);
//           }
//         });
//       }
//     }
//   );
// }