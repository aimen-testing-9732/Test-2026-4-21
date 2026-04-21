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

    const faqModal = new bootstrap.Modal(document.getElementById('modalfaq'));

    function showFaqModal() {
        faqModal.show();
    }

    function hideFaqModal() {
        faqModal.hide();
    }

    //regex pattern 
    const alphaRegex = /^[A-Za-z][A-Za-z0-9\s?.,!'()"-]*$/;

    // Character limits
    const QUESTION_MAX_CHARS = 250;
    const ANSWER_MAX_CHARS = 450;

    // Function to validate a field and update UI accordingly
    function validateField(field, errorElement, maxChars) {
        const value = field.val().trim();

        if (value === '') {
            field.addClass('border-danger');
            errorElement.text('This field is required.').removeClass('d-none');
            return false;
        } else if (!alphaRegex.test(value)) {
            field.addClass('border-danger');
            errorElement.text('Only alphabets and basic punctuation are allowed.').removeClass('d-none');
            return false;
        } else if (value.length > maxChars) {
            field.addClass('border-danger');
            errorElement.text(`Maximum ${maxChars} characters allowed.`).removeClass('d-none');
            return false;
        } else {
            field.removeClass('border-danger');
            errorElement.addClass('d-none');
            return true;
        }
    }

    // validation on Question input
    $('#Question').on('input', function () {
        const inputField = $(this);
        const currentLength = inputField.val().length;

        // Trim if exceeds the max limit
        if (currentLength > QUESTION_MAX_CHARS) {
            inputField.val(inputField.val().slice(0, QUESTION_MAX_CHARS)); // Trim to max length
        }

        // Check max character limit is reached
        if (currentLength === QUESTION_MAX_CHARS) {
            inputField.addClass('text-danger');
        } else {
            inputField.removeClass('text-danger');
        }

        // Validate the field
        validateField(inputField, $('#questionError'), QUESTION_MAX_CHARS);
    });

    //validation on Answer input
    $('#Answer').on('input', function () {
        const inputField = $(this);
        const currentLength = inputField.val().length;

        //  allowed length if it exceeds the max limit
        if (currentLength > ANSWER_MAX_CHARS) {
            inputField.val(inputField.val().slice(0, ANSWER_MAX_CHARS));
        }

        // Check if the max character limit is reached, and add text-danger class
        if (currentLength === ANSWER_MAX_CHARS) {
            inputField.addClass('text-danger');
        } else {
            inputField.removeClass('text-danger');
        }

        // Validate the field
        validateField(inputField, $('#answerError'), ANSWER_MAX_CHARS);
    });

    $('#saveFaqBtn').click(function (e) {
        e.preventDefault(e);

        // Reset error states
        $('#Question, #Answer').removeClass('border-danger text-danger');
        $('#questionError, #answerError').addClass('d-none');

        // Validate both fields
        const questionValid = validateField($('#Question'), $('#questionError'), QUESTION_MAX_CHARS);
        const answerValid = validateField($('#Answer'), $('#answerError'), ANSWER_MAX_CHARS);

        if (!questionValid || !answerValid) return;

        const formData = {
            Question: $('#Question').val().trim(),
            Answer: $('#Answer').val().trim(),
        };
        showLoader();
        $.post({
            url: 'faQ-mgmt',
            data: formData,
            dataType: 'json',  // Explicitly tell jQuery to expect and parse JSON
            success: function (retData) {

                hideLoader();
                if (retData.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: retData.message,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.reload();
                        }
                    });

                    hideFaqModal();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: retData.message,
                        confirmButtonText: 'OK'
                    });
                }
            },
            error: function () {
                hideLoader();
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong. Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        });
    });

    // Delete FAQ 
    $('.delete-btn').click(function () {
        const slNo = $(this).data('sl-no');

        Swal.fire({
            title: 'Are you sure?',
            text: `Do You Want To Delete This:?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.post({
                    url: 'delete-faq',
                    data: { SL: slNo },
                    dataType: 'json',
                    success: function (retData) {
                        hideLoader();
                        if (retData.status) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: retData.message || 'FAQ Has Been Deleted Successfully.',
                                timer: 1000,
                                showConfirmButton: false
                            });
                            setTimeout(() => {
                                location.reload();
                            }, 1000);
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: retData.message || 'Failed To Delete FAQ.',
                                confirmButtonText: 'OK'
                            });
                        }
                    },
                    error: function () {
                        hideLoader();
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Something Went Wrong. Please Try Again Later.',
                            confirmButtonText: 'OK'
                        });
                    }
                });
            }
        });
    });

    window.showFaqModal = showFaqModal;
    window.hideFaqModal = hideFaqModal;
});
