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
    function initJoditEditor(selector) {
        return new Jodit(selector, {
            height: 280,
            toolbar: true,
            editorClassName: 'textColor'
        });
    }

    var shortDetailsEditor = initJoditEditor("#shortDetails");

    $('#aboutUs').change(function () {
        var selectedOption = $(this).val();

        $('label[for="shortDetails"]').html(selectedOption + ' <span class="text-danger">*</span>');

        const match = aboutUsData[0];

        if (match && selectedOption) {
            let content = match[selectedOption] || '';
            shortDetailsEditor.setEditorValue(content);
        }
    });

    $('#submitBtn').click(function () {
        var aboutUsValue = $('#aboutUs').val();
        var shortDetailsContent = shortDetailsEditor.getEditorValue();


        var strippedContent = shortDetailsContent.replace(/<[^>]*>/g, '').trim();

        if (!aboutUsValue || !strippedContent) {
            $('#error-alert').addClass('show');
            setTimeout(function () {
                $('#error-alert').removeClass('show');
            }, 3000);
            return false;
        }

        var formData = new FormData();
        formData.append('aboutUs', aboutUsValue);
        formData.append('shortDetails', shortDetailsContent);
        showLoader();
        $.ajax({
            url: 'aboutUs-mgmt',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (response) {
                hideLoader();

                let returnData = response;

                if (returnData.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: returnData.message
                    }).then(() => {
                        location.reload();
                    });

                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: returnData.message
                    });
                }
            },
            error: function (xhr, status, error) {
                hideLoader();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while processing your request'
                });
            }
        });
    });
});