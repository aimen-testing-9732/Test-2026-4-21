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

var overlay = $('<div id="overlay" ></div>');
var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

function showLoader() {
    overlay.appendTo(document.body);
    loader.appendTo(overlay);
}

function hideLoader() {
    overlay.remove();
}

$(document).ready(function () {
    //to remove red border when correct input is given after submit
    $(".frm_chk").on("input", function () {
        if ($.trim($(this).val()) !== "") {
            $(this).removeClass('is-invalid');
            $(this).css("border-color", "");
        }
    });
    $("#contentImage").on("input", function () {
        if ($.trim($(this).val()) !== "") {
            $(this).removeClass('is-invalid');
            $(this).css("border-color", "");
        }
    });
    $("#submitBtn").click(function () {
        var sub_ok = 1;

        $(".frm_chk").removeClass('is-invalid');

        $(".frm_chk").each(function () {
           
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

        var categoryId = $("#CategoryId").val().trim();
        var heading = $("#heading").val().trim();


        var image = $("#image")[0].files[0];
        if (!image) {
            sub_ok = 0;
            $('#image').css('border-color', 'red');
        } else {
            var imageExt = image.name.split('.').pop().toLowerCase();
            var allowedExtensions = ['jpg', 'jpeg', 'png'];
            if ($.inArray(imageExt, allowedExtensions) == -1) {
                sub_ok = 0;
                $('#image').css('border-color', 'red');
            } else if (image.size > 2 * 1024 * 1024) { // 10 MB
                // Compress the image if it exceeds 10 MB
                sub_ok = 0;
                $('#image').css('border-color', 'red');
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
                            
                        })
                        .catch(err => {
                            
                            formData.append('image', image);
                        })
                );
            } else {
                // alert('without compressing image');
                formData.append('image', image);
            }
        }



        formData.append("categoryId", categoryId);
        formData.append("heading", heading);

        showLoader();

        Promise.all(compressionPromises)
            .then(() => {
                $.ajax({
                    // url: 'add-blog',
                    url: 'controllers/exam',
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
const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
var oldImage = '';
function load_page(pageNo) {

    $("#show_result").html("");
    showLoader();
    sl_no = ((pageNo * itemPerPage) - itemPerPage) + 1;
    $.post("blog-views",
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
                    var status = '';
                    if (items.status == 1) {
                        status = 'active';
                    } else {
                        status = 'inactive';
                    }
                    var edit_btn = '<form id="editForm" action="customize-blog-content" method="POST" target="_blank" > \
                    <input type="hidden" name="id" value="' + items.Blog_ID + '"> \
                    <button type="submit" class="btn btn-info card-btn">Content</button>\
                </form>';

                    $("#show_result").append('\
                    <div class="col">\
                        <div class="card h-100">\
                            <img src="'+ items.Blog_Image + '" class="card-img-top" alt="Blog Image" style="object-fit: cover; width: 100%; height: 200px;">\
                            <div class="card-body">\
                                <h5 class="card-title Card-heading">'+ items.Heading + '</h5>\
                                <p class="card-text category-tag"> <span class="Category">Category :</span> '+ items.Blog_Category + '</p>\
                            </div>\
                              <div class="card-footer">\
                <div class="buttons d-flex text-end">\
                                    '+ edit_btn + '\
                                    <button type="button" data-id="'+ items.Blog_ID + '" class="btn btn-small btn-primary edit-btn mx-2 card-btn">Edit</button>\
                                    <button type="button" data-id="'+ items.Blog_ID + '" class="btn btn-danger del-btn card-btn">Delete</button>\
                                </div>\
                  </div>\
                        </div>\
                    </div>');




                } else {
                    $("#show_result").append('\
					<tr style="border:0px solid #E8E8E8 ;">\
					<td class="text-lg" style="color:red; white-space:nowrap;text-align:center" colspan="19">No Record Found!</td>\
					</tr>\
    				');
                }
            });



            $('.edit-btn').click(function () {
                $('#modelImage').html("");
                const upimage = document.getElementById('editImage');
                upimage.value = '';
                blogId = $(this).data('id');
                showLoader();

                $.post('blog-modal', { 'Blog_id': blogId }, function (data) {
                    hideLoader();


                    var blogData = JSON.parse(data);
                    document.getElementById('ediHeading').value = blogData['reason'].Heading;
                    oldImage = blogData['reason'].Blog_Image;



                    $('#modelImage').append('<img id="modalImage" src="' + oldImage + '" class="card-img-top" alt="..." style="object-fit: cover; width: 100%; height: 200px;">')
                    //editImage

                    const ediCategoryId = document.getElementById('ediCategoryId');
                    ediCategoryId.value = blogData['reason'].Category;

                    const statusSelect = document.getElementById('editStatus');
                    statusSelect.value = blogData['reason'].Active_sts; //=== 1 ? 'active' : 'inactive';
                    const updataimage = document.getElementById('modalImage');

                    upimage.addEventListener('input', (e) => {
                        var imageurl = URL.createObjectURL(e.target.files[0]);
                        updataimage.src = imageurl;
                    });

                });
                modal.show();
            });

            $('.del-btn').click(function () {
                blogID = $(this).data('id');
                var formData = new FormData();
                formData.append('blogID', blogID);
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
                            url: 'blog-delete',
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

$('#editSubmit').click(function () {
    sub_ok = 1;
    var image = $("#editImage")[0].files[0];
    if (!image) {

    } else {
        var imageExt = image.name.split('.').pop().toLowerCase();
        var allowedExtensions = ['jpg', 'jpeg', 'png'];
        if ($.inArray(imageExt, allowedExtensions) == -1) {
            sub_ok = 0;
            $('#editImage').css('border-color', 'red');
        } else if (image.size > 2 * 1024 * 1024) { // 10 MB
            // Compress the image if it exceeds 10 MB
            sub_ok = 0;
            $('#editImage').css('border-color', 'red');
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

            formData.append('image', image);
        }
    }

    var heading = $('#ediHeading').val();
    formData.append('heading', heading);
    var Category = $('#ediCategoryId').val();
    formData.append('Category', Category);
    var Status = $('#editStatus').val();
    formData.append('Status', Status);
    formData.append('Blog_id', blogId);
    formData.append('oldImage', oldImage);


    Swal.fire({
        title: "Do you want to save the changes?",
        // showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        // denyButtonText: `Don't save`
    }).then((result) => {



        if (result.isConfirmed) {

            showLoader();

            Promise.all(compressionPromises)
                .then(() => {

                    $.ajax({
                        url: 'edit-blog',
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
                })
                .catch(err => {
                    hideLoader();

                    console.error('Error in compression promises:', err);
                });

        } 
        // else if (result.isDenied) {
        //     Swal.fire("Changes are not saved", "", "info");
        // }
        modal.hide();
    });
});



