// var overlay = jQuery('<div id="overlay"></div>');

var overlay = $('<div id="overlay" ></div>');
var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

function showLoader() {
  overlay.appendTo(document.body);
  loader.appendTo(overlay);
}

function hideLoader() {
  overlay.remove();
}



function IsDecimal(e) {
  var chrCode = (e.which) ? e.which : event.keyCode
  return (chrCode > 47 && chrCode < 58) || chrCode == 8 || chrCode == 45 || chrCode == 46 ? true : false;
}


var itemPerPage = $("#pagi_record_per_page").val();

var currentPageNo = 1;

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

$("#pagi_holder").pagination({
  items: 0,
  itemsOnPage: itemPerPage,
  useAnchors: false,
  cssStyle: 'light-theme',
  onPageClick: function (pageNumber, event) {

    currentPageNo = pageNumber;
    load_page(currentPageNo);
  }
});

//$("#loading_spinner").hide();

load_page(currentPageNo);


$("#pagi_record_per_page").on('change', function () {

  itemPerPage = $("#pagi_record_per_page").val();

  $(function () {
    $("#pagi_holder").pagination('updateItemsOnPage', itemPerPage);
  });

});

// $("#src_btn").click(function () {
//   $("#search_modal").modal('show')
//   //alert("okkk")
// })

function load_page(pageNo) {
  //overlay.appendTo(document.body);
  showLoader()
  //   var frm_date = "";

  //   if (getUrlParameter('from_date') !== undefined) {
  //     frm_date = getUrlParameter('from_date').replace(/\+/g, ' ');
  //   }
  //   else {
  //     frm_date = "";
  //   }

  //   var to_date = "";

  //   if (getUrlParameter('to_date') !== undefined) {
  //     to_date = getUrlParameter('to_date').replace(/\+/g, ' ');
  //   }
  //   else {
  //     to_date = "";
  //   }


  //   var btn = "";

  //   if (getUrlParameter('src_btn') !== undefined) {
  //     btn = getUrlParameter('src_btn').replace(/\+/g, ' ');
  //   }
  //   else {
  //     btn = "";
  //   }
  sl_no = ((pageNo * itemPerPage) - itemPerPage) + 1;

  $("#result_table").html("")
  $.post('leads', {
    post_page_no: pageNo,
    post_itemPer_page: itemPerPage,
  }, function (result) {
    //alert(result)
    // overlay.remove()
    hideLoader()
    var ret_data = JSON.parse(result);

    $(function () {
      $("#pagi_holder").pagination('updateItems', ret_data['total_records']);

    });

    $("#pagi_total_records").html("Total Records: " + ret_data['total_records']);


    $.each(ret_data['table_data'], function (index, items) {

      //alert(items.end_list);

      var delete_btn = '<button type="button" class="btn btn-outline btn-sm btn-rounded btn-danger delete_btn" id="' + items.sl + '"><i class="fa fa-close" aria-hidden="true"></i>&nbsp;Delete</button>';

      if (items.end_list == 0) {

        //var btn='<button type="button" class="btn btn-info btn-rounded btn-sm view_btn" id="'+items.inv_no+'"><i class="fa fa-eye" aria-hidden="true"></i>  </button>';
        if (items.sts == 0) {
          var sts = "<button class='btn btn-success btn-sm block_sts_btn' id='1' cus='" + items.cus_id + "'>Active</button>"
        } else {
          var sts = "<button class='btn btn-danger btn-sm block_sts_btn' id='0' cus='" + items.cus_id + "'>Deactive</button>"
        }

        $("#result_table").append('\
  <tr style="border:0px solid #E8E8E8 ;">\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ sl_no + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ delete_btn + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.name + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.email + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.mobile + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.firm + '</td>\
    <td style="white-space:nowrap; width: 50px;" class="text-sm font-weight-normal">'+ items.msg + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.date + '</td>\
    <td style="white-space:nowrap" class="text-sm font-weight-normal">'+ items.time + '</td>\
  </tr>\
  ');
        sl_no = sl_no + 1;


      }

      else {
        $("#result_table").append('\
  <tr style="border:0px solid #E8E8E8 ;">\
    <td class="text-lg font-weight-normal" style="color:red; white-space:nowrap;text-align:center;font-size:20px" colspan="12">No Data Found!</td>\
   </tr>\
  ');
      }





    });

    $(".delete_btn").click(function () {
      var itemId = $(this).attr("id");



      Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this item?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {



          $.post("leads-delete", { sl: itemId }, function (response) {



            if (typeof response === "string") {
              response = JSON.parse(response);
            }

            if (response.status) {
              Swal.fire(
                'Deleted!',
                response.message,
                'success'
              ).then(() => {

                location.reload();
              });
            } else {
              Swal.fire(
                'Failed!',
                response.message || 'Unable to delete the item.',
                'error'
              );
            }
          }).fail(function () {
            Swal.fire(
              'Error!',
              'Server error. Try again later.',
              'error'
            );
          });
        }
      });
    });






  })

}
