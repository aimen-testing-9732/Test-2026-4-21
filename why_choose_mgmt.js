
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

function initJoditEditor(selector) {
    return new Jodit(selector, {
        height: 280,
        toolbar: true,
        editorClassName: 'textColor'
    });
}

const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
const alertBox = document.getElementById('error-alert');


// var paragraphEditor = initJoditEditor("#paragraph");





var key = '';

$('.edit-btn').click(function () {
    var id = $(this).data('id');
    var hID = id['Heading'];
    var dID = id['description'];
    alertBox.classList.remove('show');
    alertBox.classList.add('fade');
    alertBox.style.display = 'none';

    showLoader();
    $.post('why-choose-modal', { 'hID': hID , 'dID':dID }, function (data) {
        hideLoader();

        var whydata = JSON.parse(data);
        key = whydata['Key'];

        console.log(whydata);
        // $('#modalTittle').text(key);
        // paragraphEditor.value = whydata['paragraph'];
        // $('#Heading').val(whydata['Heading']);
        document.getElementById('Heading').value = whydata['heading'];
        document.getElementById('description').value = whydata['Point'];


    });


    modal.show();

    $('#edit-choose').click(function () {

        var sub_ok = 1;
        $(".frm_chk").removeClass('is-invalid');
 
        $(".frm_chk").each(function () {
            if ($.trim($(this).val()) == "") {
                sub_ok = 0;
                
                $(this).addClass('is-invalid');
                $(this).css("border-color","red");
                
            }
            else if ($(this).val().length > 250) {
                sub_ok = 0;
                $(this).addClass('is-invalid');
                $(this).css("border-color", "red");
            }
            else{
                $(this).css("border-color","");
                $(this).removeClass('is-invalid');
                $(this).addClass('is-valid');
            }
        });
    
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
        var heading = $('#Heading').val();
        var description = $('#description').val();
        formData.append('heading', heading);
        formData.append('description', description);
        formData.append('heading_hID', hID);
        formData.append('description_dID', dID);






        Swal.fire({
            title: "Do you want to save the changes?",
            showCancelButton: true,
            confirmButtonText: "Save",
        }).then((result) => {
            if (result.isConfirmed) {
                showLoader();
                $.ajax({
                    url: 'why-choose-edit',
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

});






