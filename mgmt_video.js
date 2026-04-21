
function isEmptyContent(content) {
    return content.trim() === '<p><br></p>' || content.trim() === '' || $('<div>').html(content).text().trim() === "";
}
// chack end
function isInputEmpty(inputValue, errorSpan) {
    let strippedContent = $('<div>').html(inputValue).text().trim();
    if (inputValue.trim() === '' || inputValue.trim() === '<p><br></p>' || strippedContent === '') {
        sub_ok = 0;
        $(errorSpan).css({ 'display': 'block' });
    } else {
        $(errorSpan).css({ 'display': 'none' });
    }
}
//  <----------- overlay ------------->   

var overlay = $('<div id="overlay" ></div>');
var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

// overlay show
function showLoader() {
    overlay.appendTo(document.body);
    loader.appendTo(overlay);
}

// overlay Remove
function hideLoader() {
    overlay.remove();
}
// <----------overlay end---------->

$(".frm_chk").on("input", function () {
    if ($.trim($(this).val()) !== "") {
        $(this).removeClass('is-invalid');
        $(this).css("border-color", "");
    }
});

const alertBox = document.getElementById('error-alert');


$('#submitBtn').click(function () {
    var sub_ok = 1;
    $(".frm_chk").removeClass('is-invalid');
    $(".frm_chk").each(function () {
        if ($.trim($(this).val()) == "") {
            sub_ok = 0;
            $(this).addClass('is-invalid');
            $(this).css("border-color", "red");
        }
        else {
            $(this).css("border-color", "");
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    }
    );
    if (sub_ok === 0) {
        alertBox.classList.add('show');
        alertBox.classList.remove('fade');
        alertBox.style.display = 'block';

        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.classList.add('fade');
            alertBox.style.display = 'none';

        }, 7000);
        return;
    }
    var formData = new FormData();
    var video = $('#video').val();
    formData.append('video', video);
    Swal.fire({
        title: "Do you want to save the changes?",
        showCancelButton: true,
        confirmButtonText: "Save",
    }).then((result) => {
        if (result.isConfirmed) {
            showLoader();
            $.ajax({
                url: 'add-video',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    hideLoader();
                    let returnData = JSON.parse(response);
                    if (returnData.status === true) {
                        Swal.fire({
                            title: 'Success!',
                            text: returnData.message,
                            icon: 'success',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: returnData.message,
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }
            });
            if (typeof modal !== 'undefined') modal.hide();
        }
    });

});

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
}
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

load_page(currentPageNo);

$("#pagi_record_per_page").on('change', function () {
    itemPerPage = $("#pagi_record_per_page").val();
    $(function () {
        $("#pagi_holder").pagination('updateItemsOnPage', itemPerPage);
    });
});

function load_page(pageNo) {
    sl_no = ((pageNo * itemPerPage) - itemPerPage) + 1;

    $("#show_result").html("");
    showLoader();
    sl_no = ((pageNo * itemPerPage) - itemPerPage) + 1;
    $.post("view-video",
        {
            post_page_no: pageNo,
            post_itemPer_page: itemPerPage,
        }, function (backdata) {
            hideLoader();
            var ret_data = JSON.parse(backdata);
            $(function () {
                $("#pagi_holder").pagination('updateItems', ret_data['total_records']);
            });

            $("#pagi_total_records").html("Total Records: " + ret_data['total_records']);

            $.each(ret_data['card_data'], function (index, items) {


                if (items.end_list == 0) {

                    var del = '<button type="button"  data-id="' + items.sl + '" class="btn btn-danger d-flex ms-auto del-btn card-btn deBtn">Delete</button>';
                    $("#show_result").append('\
                        <div class="col">\
                            <div class="card h-100">\
                                <iframe style="width: 100%; height: 250px;" src="' + items.Video_Link + '" allowfullscreen ></iframe>\
                                <div class="card-footer">\
                                    <div class="buttons d-flex text-end">\
                                        ' + del + '\
                                    </div>\
                                </div>\
                            </div>\
                        </div>');
                } else {
                    $("#show_result").append('\
                        <div class="card py-5 text-center">\
                           <h5 >No Video Found</h5>\
                        </div>');
                }

            });
        });
    $('#show_result').on('click', '.deBtn', function () {
        delID = $(this).data('id');
        var formData = new FormData();
        formData.append('delID', delID);
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {

                $.ajax({
                    url: 'delete-video',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {

                        hideLoader();
                        let returnData = JSON.parse(response);
                        if (returnData.status === true) {
                            Swal.fire({
                                title: "Deleted!",
                                text: returnData.message,
                                icon: "success",
                                confirmButtonText: 'OK'
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: returnData.message,
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                });
            }
        });
    });
};