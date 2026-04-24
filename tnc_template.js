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


function isInputEmpty(inputValue) {
    let strippedContent = $('<div>').html(inputValue).text().trim();
    if (inputValue.trim() === '' || inputValue.trim() === '<p><br></p>' || strippedContent === '') {
        sub_ok = 0;
        Swal.fire({
            title: 'Error!',
            text: "Value cannot be empty!",
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}
// <----------- overlay ------------->
var overlay = $('<div id="overlay"></div>');
var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

function showLoader() {
    overlay.appendTo(document.body);
    loader.appendTo(overlay);
}

function hideLoader() {
    overlay.remove();
}

$(document).ready(function () {
   var editor = Jodit.make('#editor', {
    width: 794,   // A4 width
    height: 1123, // A4 height
    toolbar: true,
    editorClassName: 'textColor'
});

    $('.insertVarBtn').click(function () {
        var val = $(this).data('value');
        editor.selection.insertHTML(val);
    });
    $('.insertImgBtn').click(function () {
        var val = $(this).data('value');
        editor.selection.insertHTML('<img src="' + val + '" style="max-width:100%;">');
    });
$('.pdfConfig').click(function () {
        var val = $(this).data('value');
        editor.selection.insertHTML(val);
    });

    $('#uploadBtn').click(function () {
        sub_ok = 1;
        var image = $("#imageUpload")[0].files[0];
        if (!image) {
            Swal.fire({
                icon: 'error',
                title: 'File Error',
                text: 'Please select an image to upload.',
                allowOutsideClick: false
            });
            return;
        } else {
            var imageExt = image.name.split('.').pop().toLowerCase();
            var allowedExtensions = ['jpg', 'jpeg', 'png'];
            if ($.inArray(imageExt, allowedExtensions) == -1) {
                sub_ok = 0;
                $('#editImage').css('border-color', 'red');
            } else if (image.size > 2 * 1024 * 1024) {
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
        var formData = new FormData();

        const compressionPromises = [];

        if (image) {
            if (image.size > 0.2 * 1024 * 1024) {
                compressionPromises.push(
                    compressImage(image, 0.2)
                        .then(result => {
                            formData.append('image', result.file);
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
        Swal.fire({
            title: "After uploading the image, the template will reset. Please save the template before uploading the image!.",
            showCancelButton: true,
            confirmButtonText: "Upload",
        }).then((result) => {
            if (result.isConfirmed) {
                showLoader();

                Promise.all(compressionPromises)
                    .then(() => {
                        $.ajax({
                            url: "add-tnc-template-image",
                            type: "POST",
                            data: formData,
                            contentType: false,
                            processData: false,
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
                            },
                            error: function () {
                                alert("Image upload failed!");
                            }
                        });
                    })
                    .catch(err => {
                        hideLoader();

                        console.error('Error in compression promises:', err);
                    });
            }
        });
    });

    $('.deleteImgBtn').click(function () {
        var filename = $(this).data('file');
        Swal.fire({
            title: "After Deleting the image, the template will reset. Please save the template before Deleting the image!.",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then((result) => {
            if (result.isConfirmed) {
                showLoader();
                $.post('delete-tnc-template-image', {
                    filename: filename
                }, function (response) {
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
                ).fail(function () {
                    hideLoader();
                    Swal.fire({
                        title: 'Error!',
                        text: 'Failed to delete image.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
            }
        });

    });

    $('#saveContentBtn').click(function () {
        sub_ok = 1;
        var content = editor.getEditorValue();
        isInputEmpty(content);
        if (sub_ok == 1) {
            showLoader();
            $.post("tnc-template-content", { content: content }, function (response) {
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
            }).fail(function () {
                hideLoader();
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete image.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            });
        }
    });


})