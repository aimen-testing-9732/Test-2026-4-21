function compressImage(file, maxSizeMB) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.match('image.*')) {
            reject('Not an image file');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (fileSizeMB <= maxSizeMB) {
            resolve({ file, size: fileSizeMB, quality: 1 });
            return;
        }

        let quality = Math.max(0.7, Math.min(0.9, maxSizeMB / fileSizeMB));

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;

                if (width > 2000 || height > 2000) {
                    const scaleFactor = Math.min(2000 / width, 2000 / height);
                    width = Math.floor(width * scaleFactor);
                    height = Math.floor(height * scaleFactor);
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, width, height);

                const getImageSize = (dataUrl) => Math.round((dataUrl.length * 3) / 4) - 22;

                const compress = (currentQuality) => {
                    const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                    const currentSize = getImageSize(dataUrl);

                    if (currentSize <= maxSizeBytes || currentQuality <= 0.3) {
                        const binaryString = atob(dataUrl.split(',')[1]);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        const blob = new Blob([bytes], { type: 'image/jpeg' });
                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", { type: 'image/jpeg', lastModified: Date.now() });

                        resolve({ file: compressedFile, size: currentSize / (1024 * 1024), quality: currentQuality });
                    } else {
                        compress(currentQuality - 0.1);
                    }
                };

                compress(quality);
            };

            img.onerror = () => reject('Error loading image');
        };

        reader.onerror = () => reject('Error reading file');
        reader.readAsDataURL(file);
    });
}

// <-------chack empty -------->
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

$(document).ready(function () {
    //to remove red border when correct input is given after submit
    $(".frm_chk").on("input", function () {
        if ($.trim($(this).val()) !== "") {
            $(this).removeClass('is-invalid');
            $(this).css("border-color", "");
        }
    });
    
    function initJoditEditor(selector) {
        return new Jodit(selector, {
            height: 280,
            toolbar: true,
            editorClassName: 'textColor'
        });
    }

    var DescriptionEditor = initJoditEditor("#Description");
    DescriptionEditor.events.on('change', () => {
    $('#Description-error').css({ 'display': 'none' });
});
    $("#submitBtn").click(function () {
        var sub_ok = 1;
    
        // Reset previous error states
        $(".frm_chk").removeClass('is-invalid');

      
        $(".frm_chk").each(function () {
            // console.log($(this));
            if ($.trim($(this).val()) == "") {
                sub_ok = 0;

                $(this).addClass('is-invalid');
                $(this).css("border-color", "red");
                console.log($(this));

            }
            else {
                $(this).css("border-color", "");
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            }
        });

       var Description = DescriptionEditor.getEditorValue();

        isInputEmpty(Description, "#Description-error");

        if (isEmptyContent(Description)) {
            sub_ok = 0;
            $('#Description').closest('.jodit-editor').addClass('error');
        } else {
            $('#Description').closest('.jodit-editor').removeClass('error');
        }


        var image = $("#Image")[0].files[0];
        if (!image) {
            sub_ok = 0;
            $('#Image').css('border-color', 'red');
        } else {
            var imageExt = image.name.split('.').pop().toLowerCase();
            var allowedExtensions = ['jpg', 'jpeg', 'png'];
            if ($.inArray(imageExt, allowedExtensions) == -1) {
                sub_ok = 0;
                $('#Image').css('border-color', 'red');
            } else if (image.size > 2 * 1024 * 1024) { // 10 MB
                // Compress the image if it exceeds 10 MB
                sub_ok = 0;
                $('#Image').css('border-color', 'red');
                Swal.fire({
                    icon: 'error',
                    title: 'File Size Error',
                    text: 'Image size should not exceed 2 MB',
                    allowOutsideClick: false
                });
            }
        }
        if (sub_ok == 0) {
            const alertBox = document.getElementById('error-alert');
            alertBox.classList.add('show');
            alertBox.classList.remove('fade');

            setTimeout(() => {
                alertBox.classList.remove('show');
                alertBox.classList.add('fade');
            }, 7000);
            return;
        }
        var formData = new FormData();

        const compressionPromises = [];

        if (image) {
            if (image.size > 0.2 * 1024 * 1024) {
                // alert('compressing image');
                compressionPromises.push(
                    compressImage(image, 0.2)
                        .then(result => {
                            formData.append('image', result.file);
                            //console.log(`PAN image compressed from ${image.size / (1024 * 1024)} MB to ${result.size} MB with quality ${result.quality}`);
                        })
                        .catch(err => {
                            // console.error('Error compressing PAN image:', err);
                            formData.append('image', image);
                        })
                );
            } else {
                // alert('without compressing image');
                formData.append('image', image);
            }
        }

                formData.append('description', Description);

        showLoader();

        Promise.all(compressionPromises)
            .then(() => {
                // AJAX request
                $.ajax({
                    url: 'add-services',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (response) {
                        hideLoader();
                        let returnData = JSON.parse(response);
                        if (returnData.status) {
                            Swal.fire({
                                title: 'Success!',
                                text: returnData.reason,
                                icon: 'success',
                                confirmButtonText: 'OK'
                            }).then(() => {
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                title: 'Error!',
                                text: returnData.reason,
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        }
                    }
                });
           
            })
            .catch(err => {
                hideLoader();

                console.error('Error in compression promises:', err);
            });
   
        })
})



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

var blogId = '';
var oldImage = '';
function load_page(pageNo) {

    $("#show_result").html("");
    showLoader();
    sl_no = ((pageNo * itemPerPage) - itemPerPage) + 1;
    $.post("view-services",
        {
            post_page_no: pageNo,
            post_itemPer_page: itemPerPage,
        }, function (backdata) {
            hideLoader();
            var ret_data = JSON.parse(backdata);
            console.log(ret_data);
            $(function () {
                $("#pagi_holder").pagination('updateItems', ret_data['total_records']);
            });

            $("#pagi_total_records").html("Total Records: " + ret_data['total_records']);
            $.each(ret_data['card_data'], function (index, items) {
                if (items.end_list == 0) {
                   

                    $("#show_result").append('\
						<tr style="border:1px solid #E8E8E8 ;">\
							<td style="white-space:nowrap;text-align:center ;" class="text-md font-weight-normal">'+ sl_no + '</td>\
  							<td style="white-space:nowrap;text-align:center ;" class="text-md font-weight-normal"><img src="'+ items.Image + '" class="card-img-top" alt="User Image" style="object-fit: cover; width: 70px; height: 70px;"></td>\
							<td style="white-space: pre-line;" class="text-md font-weight-normal">'+items.Description+ '</td>\
							<td style="white-space:nowrap;text-align:center ;" class="text-md font-weight-normal"><button type="button" data-id="'+items.Sl+'" class="btn  btn-danger del-btn ">Delete</button></td>\
						</tr>\
					');
                    sl_no = sl_no + 1;
         


                } else {
                    $("#show_result").append('\
					<tr style="border:0px solid #E8E8E8 ;">\
					<td class="text-lg" style="color:red; white-space:nowrap;text-align:center" colspan="4">No Record Found!</td>\
					</tr>\
    				');
                }
            });




            $('.del-btn').click(function () {
                del_id = $(this).data('id');
                var formData = new FormData();
                formData.append('del_id', del_id);
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
                            url: 'delete-services',
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

        });
};




