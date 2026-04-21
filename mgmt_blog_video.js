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
const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
const alertBox = document.getElementById('error-alert');
$(document).ready(function () {
    //to remove red border when correct input is given after submit
    $(".frm_chk").on("input", function () {
        if ($.trim($(this).val()) !== "") {
            $(this).removeClass('is-invalid');
            $(this).css("border-color", "");
        }
    });
})

$('#edit-btn').click(function () {
    alertBox.classList.add('disnone');


    showLoader();
    $.post('blog-video', function (data) {
        hideLoader();

        var data = JSON.parse(data);
        document.getElementById('link').value = data['reason']['video_link'];
    });
    modal.show();
});


$('#editSubmit').click(function () {
    sub_ok = 1;
    $(".frm_chk").each(function () {
        if ($.trim($(this).val()) == "") {
            sub_ok = 0;
            $(this).addClass('is-invalid    ');
            $(this).css("border-color", "red");
        }
        else {
            $(this).css("border-color", "");
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    }
    );
    if (sub_ok == 0) {
        const alertBox = document.getElementById('error-link');
        // alertBox.classList.add('show');
        alertBox.classList.remove('disnone');

        setTimeout(() => {
            // alertBox.classList.remove('show');
            alertBox.classList.add('disnone');
        }, 7000);
        return;
    }
    var formData = new FormData();




    var link = $('#link').val();

    formData.append('link', link);


    Swal.fire({
        title: "Do you want to save the changes?",
        showCancelButton: true,
        confirmButtonText: "Save",

    }).then((result) => {
        showLoader();
        $.ajax({
            url: 'blog-video-edit',
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


        modal.hide();
    });

});