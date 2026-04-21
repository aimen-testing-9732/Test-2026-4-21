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

        let quality = Math.max(0.8, Math.min(0.9, maxSizeMB / fileSizeMB));

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
$(document).ready(function () {
    var overlay = $('<div id="overlay" ></div>');
    var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

    function showLoader() {
        overlay.appendTo(document.body);
        loader.appendTo(overlay);
    }

    function hideLoader() {
        overlay.remove();
    }

    let postDataObj = {};
    let isOk2Send = false;

    function showHideFields(checkboxId, targetSelector, inverse) {
        const isChecked = $(checkboxId).is(":checked");
        $(targetSelector).toggle(inverse ? !isChecked : isChecked);

        $(checkboxId).on("change", function () {
            const checked = $(this).is(":checked");
            $(targetSelector).toggle(inverse ? !checked : checked);
        });
    }

    function check4EmptyFields() {
        let hasEmptyFields = false;
        $(".required").each(function () {
            let inputValue = $(this);
            if (inputValue.val() === "") {
                inputValue.css("border-color", "red");
                hasEmptyFields = true;
            }
        });
        return hasEmptyFields;
    }

    function checkEmptyDeadlineFields() {
        let hasEmptyFields = false;
        $(".purchaseFlds .required").each(function () {
            let inputValue = $(this);
            if (inputValue.val() === "") {
                inputValue.css("border-color", "red");
                hasEmptyFields = true;
            }
        });
        return hasEmptyFields;
    }

    function meetingData() {
        postDataObj = new FormData();

        postDataObj.append('title', $("#title").val());
        postDataObj.append('mbrLimit', $("#mbrLmt").val());
        postDataObj.append('meetDescription', $("#meetDescrip").val());
        postDataObj.append('meetDate', $("#meetDate").val());
        postDataObj.append('meetingTime', $("#fromTime").val());
        postDataObj.append('duration', $("#duration").val());
        postDataObj.append('timeUnit', $("#timeUnit").val());
        postDataObj.append('actualPrice', $("#actualPrice").val());
        postDataObj.append('discountPrice', $("#discountPrice").val());
        postDataObj.append('publish2Web', $("input[name=publish2Web]:checked").val());
        postDataObj.append('registrationStatus', $("input[name=registrationStatus]:checked").val());

        const zoomcheckBox = $("#zm_chkBx").is(":checked");
        postDataObj.append('createNewZoom', zoomcheckBox ? "1" : "0");
        if (!zoomcheckBox) {
            const zoomId = $("#zoomId").val();
            if (zoomId === "") {
                $("#zoomId").css("border-color", "red");
                return false;
            }
            /**Validate zoom ID */
            const regex = /^\d{10,20}$/;
            if (!regex.test(zoomId)) {
                $("#zoomId").css("border-color", "red");
                return false;
            }
            postDataObj.append('zoomId', zoomId);
        }

        const gstChkBx = $("#gst_chkBx").is(":checked");
        postDataObj.append('addGst', gstChkBx ? "1" : "0");
        if (gstChkBx) {
            const gstValue = $("#gst").val();
            if (!/^\d+$/.test(gstValue) || parseInt(gstValue, 10) <= 0 || parseInt(gstValue, 10) > 100) {
                $("#gst").css("border-color", "red");
                return false;
            }
            postDataObj.append('gst', gstValue);
        }

        const apChkBx = $("#allowPurchase").is(":checked");
        postDataObj.append('allowPurchase', apChkBx ? "1" : "0");
        if (!apChkBx) {
            if (checkEmptyDeadlineFields()) {
                return false;
            }
            postDataObj.append('purchsDate', $("#purchsDate").val());
            postDataObj.append('purchsTime', $("#purchsTime").val());
        }
        return true;
    }

    showHideFields("#zm_chkBx", "#zoomId", true);
    showHideFields("#gst_chkBx", "#gst", false);
    showHideFields("#allowPurchase", ".purchaseFlds", true);

    /**Validate zoom ID */
    $("#zoomId").on("input", function () {
        let id = $(this).val();
        const regex = /^\d{10,20}$/;

        let idNum = id.replace(/[^0-9]/g, "");
        idNum = idNum.replace(/^0+/, "");
        $(this).val(idNum.substring(0, 20));

        $(this).css("border-color", regex.test(idNum) ? "green" : "red");
    });

    /**Validate member limit */
    $("#mbrLmt").on("input", function () {
        const limit = $(this).val();
        let mlimit = limit.replace(/[^0-9]/g, "");
        mlimit = mlimit.replace(/^0+/, "");
        $(this).val(mlimit.substring(0, 3));
    });

    /**Validate meeting duration */
    $("#duration").on("input", function () {
        const duraVal = $(this).val();
        let duraNum = duraVal.replace(/[^0-9]/g, "");
        duraNum = duraNum.replace(/^0+/, "");
        $(this).val(duraNum);
    });

    /**Validate GST */
    $("#gst").on("input", function () {
        const gstval = $(this).val();
        let gstNum = gstval.replace(/[^0-9]/g, "");
        gstNum = gstNum.replace(/^0+/, "");
        $(this).val(gstNum.substring(0, 3));
    });

    /**Validate actual price */
    $("#actualPrice").on("input", function () {
        let apVal = $(this).val();
        let apNum = apVal.replace(/[^0-9]/g, "");
        apNum = apNum.replace(/^0+/, "");
        $(this).val(apNum);
    });

    /**Validate discounted price */
    $("#discountPrice").on("input", function () {
        let dpVal = $(this).val();
        let dpNum = dpVal.replace(/[^0-9]/g, "");
        dpNum = dpNum.replace(/^0+/, "");
        $(this).val(dpNum);
    });


    /**Clearing the border when input changes*/
    $(".required").on("input", function () {
        if ($(this).val() !== "") {
            $(this).css("border-color", "");
        }
    });

    /************************* Save Button *********************************************/
    $("#saveBtn").click(function (e) {
        e.preventDefault();
        isOk2Send = true;

        var image = $("#image")[0].files[0];
        if (!image) {
            isOk2Send = false;
            $('#image').css('border-color', 'red');
        } else {
            var imageExt = image.name.split('.').pop().toLowerCase();
            var allowedExtensions = ['jpg', 'jpeg', 'png'];
            if ($.inArray(imageExt, allowedExtensions) == -1) {
                isOk2Send = false;
                $('#image').css('border-color', 'red');

            } else if (image.size > 1 * 1024 * 1024) {
                // Compress the image if it exceeds 10 MB

                $('#image').css('border-color', 'red');


                Swal.fire({
                    icon: 'error',
                    title: 'File Size Error',
                    text: 'Image size should not exceed 100 kb',
                    allowOutsideClick: false
                });
                isOk2Send = false;
            }
        }

        const apChkBx = $("#allowPurchase").is(":checked");
        let apChkBxVal = apChkBx ? "1" : "0";
        if (apChkBx) {
            $(".required").not(".purchaseFlds .required").each(function () {
                let inputValue = $(this);
                if (inputValue.val() === "") {
                    inputValue.css("border-color", "red");
                    isOk2Send = false;
                } else {
                    var start = new Date($("#meetDate").val() + ' ' + $("#fromTime").val());
                    var end = new Date($("#purchsDate").val() + ' ' + $("#purchsTime").val());
                    var diffInMinutes = (start - end) / 1000 / 60;
                    if (diffInMinutes < 2) {
                        inputValue.css("border-color", "red");
                        isOk2Send = false;
                        Swal.fire({
                            icon: 'warning',
                            title: 'Invalid Time Difference',
                            text: 'The purchase deadline must be at least 2 minutes before the meeting time.',
                        });
                    }
                }
            });
        } else {
            if (check4EmptyFields()) {
                isOk2Send = false;
            }
        }

        const zoomcheckBox = $("#zm_chkBx").is(":checked");
        if (!zoomcheckBox && $("#zoomId").val() === "") {
            $("#zoomId").css("border-color", "red");
            isOk2Send = false;
        }

        if (isOk2Send) {
            isOk2Send = meetingData();
            const compressionPromises = [];

            if (image) {
                if (image.size > 0.1 * 1024 * 1024) {
                    // alert('compressing image');
                    compressionPromises.push(
                        compressImage(image, 0.1)
                            .then(result => {
                                postDataObj.append('image', result.file);
                                //console.log(`PAN image compressed from ${image.size / (1024 * 1024)} MB to ${result.size} MB with quality ${result.quality}`);
                            })
                            .catch(err => {

                                postDataObj.append('image', image);


                            })
                    );
                } else {
                    // alert('without compressing image');
                    postDataObj.append('image', image);
                }
            }

            showLoader();
            Promise.all(compressionPromises)
                .then(() => {
                    $.ajax({
                        url: "controllers/mgmt_webinar_ctrl",
                        method: "POST",
                        data: postDataObj, // Send FormData directly
                        processData: false, // Important: Don't process the data
                        contentType: false, // Important: Don't set content type (let browser set it)
                        success: function (response) {
                            try {
                                hideLoader();
                                const jsonResponse = JSON.parse(response);
                                if (jsonResponse.status === true) {
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Success',
                                        text: jsonResponse.message,
                                    }).then(() => {
                                        $("#resetBtn").trigger("click");
                                    });
                                } else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Error',
                                        text: jsonResponse.message || 'An error occurred while adding the meeting.',
                                    });
                                }
                            } catch (error) {
                                hideLoader();
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Invalid response from the server.',
                                });
                            }
                        },
                        error: function () {
                            hideLoader();
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Failed to connect to the server.',
                            });
                        }
                    });
                })
                .catch(err => {
                    hideLoader();
                    console.error('Error in compression promises:', err);
                });
        }
    });


    $("#meetDate").datepicker({
        changeYear: true,
        changeMonth: true,
        showAnim: "fadeIn",
        dateFormat: "dd-mm-yy",
        minDate: 0,
    });

    $("#meetDate").mask("00-00-0000", {
        placeholder: "dd-mm-yyyy"
    });

    $("#meetDate").on("change", function () {
        const dateValue = $(this).val();
        if (!isValidDate(dateValue)) {
            $("#meetDate").val("");
        }
    });

    $("#purchsDate").datepicker({
        changeYear: true,
        changeMonth: true,
        showAnim: "fadeIn",
        dateFormat: "dd-mm-yy",
        minDate: 0,
    });

    $("#purchsDate").mask("00-00-0000", {
        placeholder: "dd-mm-yyyy"
    });

    $("#purchsDate").on("change", function () {
        const dateValue1 = $(this).val();
        if (!isValidDate(dateValue1)) {
            $("#purchsDate").val("");
        }
    });
    /*-----------------------------------------------------------*/

    function isValidDate(dateStr) {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return false;

        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        const date = new Date(year, month, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day
        );
    }

    setupTimePicker("#fromTime", "#meetDate");
    setupTimePicker("#purchsTime", "#purchsDate");

    function setupTimePicker(selector, dateSelector) {
        flatpickr(selector, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: false,
            onOpen: function (selectedDates, dateStr, instance) {
                const selectedDate = $(dateSelector).val();
                const todayStr = $.datepicker.formatDate('yy-mm-dd', new Date());

                if (selectedDate === todayStr) {
                    const now = new Date();
                    const currentTime = now.getHours().toString().padStart(2, '0') + ":" +
                        now.getMinutes().toString().padStart(2, '0');
                    instance.set('minTime', currentTime);
                } else {
                    instance.set('minTime', "00:00");
                }
            }
        });
    }

    /******************************** Reset Button **************************************/
    $("#resetBtn").click(function (e) {
        e.preventDefault();
        $("input[type='text'], input[type='time'], textarea").val("");

        $("#timeUnit").val("minutes");

        $("input[name=publish2Web][value='yes']").prop("checked", true);
        $("input[name=registrationStatus][value='active']").prop("checked", true);

        $("#zm_chkBx").prop("checked", true);
        $("#gst_chkBx").prop("checked", true);
        $("#allowPurchase").prop("checked", false);
        $("#zm_chkBx, #gst_chkBx, #allowPurchase").trigger("change");
        $("#zoomId").val("");
        $("#zoomId").css("border-color", "");

        $(".required").css("border-color", "");

        if (typeof flatpickrInstance !== 'undefined') {
            flatpickrInstance.clear();
        }

        $("#meetDate").datepicker("setDate", null);

        scrollToSection("meetingCreate")
    });
});

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        switch (sectionId) {
            case 'meetingCreate':
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                break;
        }
    }
}