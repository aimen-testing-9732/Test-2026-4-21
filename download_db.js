var overlay = $('<div id="overlay" ></div>');
var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

// overlay show
function showLoader() {
    overlay.appendTo(document.body);
    loader.appendTo(overlay);
}


function hideLoader() {
    overlay.remove();
}
function generateRandomString() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }

    return result;
}



$(document).ready(function () {

    $('#download').on('click', function () {
        const randomString = generateRandomString();
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Download it!"
        }).then((result) => {
            if (result.isConfirmed) {
            showLoader();

                $.post(
                    'Download-db',
                    { 'downloadId': randomString },
                    function () {
                        console.log(randomString);
                        hideLoader();
                    }
                );
            }
        });
    });

});