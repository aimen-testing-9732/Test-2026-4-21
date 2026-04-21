
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        switch (sectionId) {
            case 'bannerTableSection':
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'end'
                });
                break;

            default:
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                section.focus({
                    preventScroll: true
                })
                break;
        }
    }
}
/************************************/
// Image Compression
function compressImage(file, maxSizeMB, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.match('image.*')) {
            reject('Not an image file');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const canvas = document.createElement('canvas');

                let width = img.width;
                let height = img.height;

                let currentQuality = quality;

                const getImageSize = (dataUrl) => {
                    return Math.round((dataUrl.length * 3) / 4) - 22;
                };

                const compressWithQuality = (startQuality) => {
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

                    const dataUrl = canvas.toDataURL('image/jpeg', startQuality);

                    const maxSizeBytes = maxSizeMB * 1024 * 1024;
                    const currentSize = getImageSize(dataUrl);

                    if (currentSize <= maxSizeBytes || startQuality <= 0.1) {
                        const binaryString = atob(dataUrl.split(',')[1]);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }

                        const blob = new Blob([bytes], {
                            type: 'image/jpeg'
                        });

                        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        resolve({
                            file: compressedFile,
                            size: currentSize / (1024 * 1024),
                            quality: startQuality
                        });
                    } else {
                        const newQuality = Math.max(startQuality - 0.1, 0.1);
                        compressWithQuality(newQuality);
                    }
                };

                compressWithQuality(currentQuality);
            };

            img.onerror = function () {
                reject('Error loading image');
            };
        };

        reader.onerror = function () {
            reject('Error reading file');
        };

        reader.readAsDataURL(file);
    });
}
/**************************************************** */


$(document).ready(function () {

    // JoditEditor Initialization
    function initJoditEditor(selector) {
        return Jodit.make(selector, {
            height: 50,
            toolbar: true,
            editorClassName: 'textColor'
        });
    }
    /*************************************************************/

    // Overlay
    var overlay = $('<div id="overlay" ></div>');
    var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

    function showLoader() {
        overlay.appendTo(document.body);
        loader.appendTo(overlay);
    }

    function hideLoader() {
        overlay.remove();
    }
    /******************************************************/

    //Calling scroll function on add-banner button
    $(".search-button").on('click', function () {
        scrollToSection("bkImg");
    })


    var leftContentEditor = initJoditEditor("#leftContent");
    var rightContentEditor = initJoditEditor("#rightContent");
    var currentBannerId = null;


    // Function to validate image extension
    function validateImage(file) {
        if (!file) return true; // Skip validation if no file selected (for updates)

        const validExtensions = ['jpg', 'jpeg', 'png'];
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid File',
                text: 'Please upload only jpg, jpeg or png images.'
            });
            return false;
        }
        return true;
    }

    $('#submitBtn').on('click', function () {
        var leftContentValue = leftContentEditor.getEditorValue();
        var rightContentValue = rightContentEditor.getEditorValue();
        
        var leftContentText = leftContentValue.replace(/<[^>]*>/g, '').trim();
        var rightContentText = rightContentValue.replace(/<[^>]*>/g, '').trim();


        var backgroundImg = $("#bkImg")[0].files[0];
        // var foregroundImg = $("#foreImg")[0].files[0];
        // var responsiveImg = $("#respnImg")[0].files[0];

        if (!leftContentText || !rightContentText) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'all filds are required!'
            });
            return;
        }

        // if (!backgroundImg || !foregroundImg || !responsiveImg) {
        if (!backgroundImg) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'All images are required!'
            });
            return;
        }

        // Validate image extensions
        // if (!validateImage(backgroundImg) || !validateImage(foregroundImg) || !validateImage(responsiveImg)) {

        if (!validateImage(backgroundImg)) {
            return;
        }

        var formData = new FormData();

        const compressionPromises = [];

        if (backgroundImg) {
            compressionPromises.push(
                compressImage(backgroundImg, 0.20)
                    .then(result => {
                        formData.append('background_img', result.file);
                    })
                    .catch(err => {
                        formData.append('background_img', backgroundImg);
                    })
            );
        }

        // if (foregroundImg) {
        //     compressionPromises.push(
        //         compressImage(foregroundImg, 0.20)
        //             .then(result => {
        //                 formData.append('foreground_img', result.file);
        //             })
        //             .catch(err => {
        //                 formData.append('foreground_img', foregroundImg);
        //             })
        //     );
        // }

        // if (responsiveImg) {
        //     compressionPromises.push(
        //         compressImage(responsiveImg, 0.20)
        //             .then(result => {
        //                 formData.append('responsive_img', result.file);
        //             })
        //             .catch(err => {
        //                 formData.append('responsive_img', responsiveImg);
        //             })
        //     );
        // }

        formData.append('left_content', leftContentValue);
        formData.append('right_content', rightContentValue);

        formData.append('action', 'add');
        showLoader();
        Promise.all(compressionPromises)
            .then(() => {
                $.ajax({
                    url: "banner-mgmt",
                    type: "POST",
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        hideLoader();
                        var res = JSON.parse(response);
                        if (res.status === true) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: res.message
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: res.message
                            });
                        }
                    },
                });
            })
            .catch(err => {
                console.error('Error in compression promises:', err);
            });
    });

    function EditBanner(id, slno) {
        currentBannerId = id;

        var bannerRow = $("#banner-" + slno);
        var LeftContentText = bannerRow.find(".banner-Left-content").html();

        var RightContentText = bannerRow.find(".banner-Right-content").html();
        var bgImgSrc = bannerRow.find(".banner-bg-img img").attr("src");
        // var fgImgSrc = bannerRow.find(".banner-fg-img img").attr("src");
        // var respImgSrc = bannerRow.find(".banner-resp-img img").attr("src");

        // Reset and update Jodit editors
        leftContentEditor.value = "";
        rightContentEditor.value = ""; 
        leftContentEditor.value = LeftContentText;
        rightContentEditor.value = RightContentText;


        if (bgImgSrc) {
            $("#bkImgPreview").attr("src", bgImgSrc).show();
        } else {
            $("#bkImgPreview").hide();
        }

        // if (fgImgSrc) {
        //     $("#foreImgPreview").attr("src", fgImgSrc).show();
        // } else {
        //     $("#foreImgPreview").hide();
        // }

        // if (respImgSrc) {
        //     $("#respnImgPreview").attr("src", respImgSrc).show();
        // } else {
        //     $("#respnImgPreview").hide();
        // }


    }
    
    $(".editBtn").on('click', function () {
        var id = $(this).data('edit-bnnrid');
        var slno = $(this).data('editsl');
        $("#updateBtn").show();
        $("#submitBtn").hide();
        EditBanner(id, slno);
        scrollToSection("bkImg");

    });

    // Update banner function
    $("#updateBtn").on('click', function () {
        var leftContentValue = leftContentEditor.getEditorValue();
        var rightContentValue = rightContentEditor.getEditorValue();
        
        var leftContentText = leftContentValue.replace(/<[^>]*>/g, '').trim();
        var rightContentText = rightContentValue.replace(/<[^>]*>/g, '').trim();

        var backgroundImg = $("#bkImg")[0].files[0];
        // var foregroundImg = $("#foreImg")[0].files[0];
        // var responsiveImg = $("#respnImg")[0].files[0];


        if (!leftContentText || !rightContentText ) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'all filds are required!'
            });
            return;
        }

        // if (!validateImage(backgroundImg) || !validateImage(foregroundImg) || !validateImage(responsiveImg)) {

        if (!validateImage(backgroundImg)) {
            return;
        }

        var formData = new FormData();
        const compressionPromises = [];

        if (backgroundImg) {
            compressionPromises.push(
                compressImage(backgroundImg, 0.20)
                    .then(result => {
                        formData.append('background_img', result.file);
                    })
                    .catch(err => {
                        formData.append('background_img', backgroundImg);
                    })
            );
        }


           formData.append('left_content', leftContentValue);
        formData.append('right_content', rightContentValue);
        formData.append('banner_id', currentBannerId);
        formData.append('action', 'update');
        showLoader();
        Promise.all(compressionPromises)
            .then(() => {
                $.ajax({
                    url: "banner-mgmt",
                    type: "POST",
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        hideLoader();
                        var res = JSON.parse(response);
                        if (res.status === true) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success',
                                text: res.message
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: res.message
                            });
                        }
                    },
                });
            })
            .catch(err => {
                console.error('Error in compression promises:', err);
            });
    });

    // Delete banner function
    $(".delBtn").on('click', function () {
        var bannerId = $(this).data('del-bnnrid');

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                var formData = new FormData();
                formData.append('banner_id', bannerId);
                formData.append('action', 'delete');

                $.ajax({
                    url: "banner-mgmt",
                    type: "POST",
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        var res = JSON.parse(response);
                        if (res.status === true) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: res.message
                            }).then(function () {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: res.message
                            });
                        }
                    },
                });
            }
        });
    });

    // Toggle active status
    $(document).on('change', '.status-checkbox', function () {
        var bannerId = $(this).data('banner-id');
        var isChecked = $(this).is(':checked') ? 1 : 0;

        var formData = new FormData();
        formData.append('banner_id', bannerId);
        formData.append('active_status', isChecked);
        formData.append('action', 'toggle_status');

        $.ajax({
            url: "banner-mgmt",
            type: "POST",
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                var res = JSON.parse(response);
                if (res.status === true) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: res.message,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: res.message
                    });
                }
            },
        });
    });

    function previewImage(input, previewId) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $("#" + previewId).attr("src", e.target.result).show();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#bkImg").change(function () {
        previewImage(this, "bkImgPreview");
    });
    // $("#foreImg").change(function () {
    //     previewImage(this, "foreImgPreview");
    // });
    // $("#respnImg").change(function () {
    //     previewImage(this, "respnImgPreview");
    // });

    // Reset form
    $(".cancelBtn").on('click', function () {
        topHeadingEditor.value = "";
        headlineEditor.value = "";
        subheadingEditor.value = "";
        // $("#bkImgPreview, #foreImgPreview, #respnImgPreview").hide();
        // $("#bkImg, #foreImg, #respnImg").val("");
        $("#bkImgPreview").hide();
        $("#bkImg").val("");
        $("#updateBtn").hide();
        $("#submitBtn").show();
        currentBannerId = null;
        scrollToSection("bannerTableSection")
    });
});




