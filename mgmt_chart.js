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

$(".frm_chk").on("input", function () {
    if ($.trim($(this).val()) !== "") {
        $(this).removeClass('is-invalid');
        $(this).css("border-color", "");
    }
});
$('#src_to_date').val(new Date().toLocaleDateString('en-GB').split('/').join('-'));
$('#src_from_date').val(new Date().toLocaleDateString('en-GB').split('/').join('-'));
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

function pageLoad(fs1, ss1, total1, fs2, ss2, total2, fs3, ss3, total3) {
    function drawPieChart(containerId, failure, success, total, targetNum) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Responsive width/height: use parent/container width, max 350px, min 180px
        const parentWidth = container.parentElement ? container.parentElement.offsetWidth : window.innerWidth;
        const width = Math.max(Math.min(parentWidth, 350), 270);
        const height = Math.max(Math.min(window.innerHeight * 0.4, 250), 160);

        const data = [{
            values: [failure, success],
            labels: ['Failed', 'Success'],
            type: 'pie',
            marker: {
                colors: ['#eda01b', '#1761db']
            },
            textinfo: 'percent+label',
            textposition: 'inside',
            automargin: true
        }];

        const layout = {
            title: {
                text: `Target ${targetNum} Performance (Total Target: ${total})`,
                font: { size: 14 }
            },
            height,
            width,
            margin: { t: 50, l: 10, r: 10, b: 10 },
            legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.1 }
        };

        const config = {
            displaylogo: false,
            responsive: true
        };

        Plotly.newPlot(containerId, data, layout, config);
    }

    // Helper to clear and redraw a chart
    function updateChart(containerId, failure, success, total, targetNum, cardSelector) {
        if (total > 0) {
            document.getElementById(containerId).innerHTML = '';
            drawPieChart(containerId, failure, success, total, targetNum);
            $(cardSelector).removeClass('d-none');
        } else {
            $(cardSelector).addClass('d-none');
        }
    }

    // Initial responsive draw (on load)
    setTimeout(function() {
        updateChart('myDiv', fs1, ss1, total1, 1, '#c1');
        updateChart('myDiv2', fs2, ss2, total2, 2, '#c2');
        updateChart('myDiv3', fs3, ss3, total3, 3, '#c3');
    }, 0);

    if (total1 === 0 && total2 === 0 && total3 === 0) {
        Swal.fire({
            title: "No Data",
            text: "No data available for the selected date.",
            icon: "info",
            confirmButtonText: "OK"
        });
        return;
    }

    // Debounce resize handler for performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateChart('myDiv', fs1, ss1, total1, 1, '#c1');
            updateChart('myDiv2', fs2, ss2, total2, 2, '#c2');
            updateChart('myDiv3', fs3, ss3, total3, 3, '#c3');
        }, 200);
    }, { passive: true });
}

window.addEventListener("load", (event) => {
    $.post('search-piechart', function (data) {
        hideLoader();

        let returnData = JSON.parse(data);
        if (returnData.status === true) {
            pageLoad(
                returnData.data.target1.failure,
                returnData.data.target1.success,
                returnData.data.target1.total_set,

                returnData.data.target2.failure,
                returnData.data.target2.success,
                returnData.data.target2.total_set,

                returnData.data.target3.failure,
                returnData.data.target3.success,
                returnData.data.target3.total_set
            );

            // window.location.href = "mgmt_chart";    

        } else {
            Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }).fail(function (xhr, status, error) {

        hideLoader();
        Swal.fire({
            title: "Error",
            text: "An error occurred while processing your request. Please try again later.",
            icon: "error",
            confirmButtonText: "OK"
        });
    }
    );
});

$(".dateInput, .dateInput2").datepicker({
    changeYear: true,
    changeMonth: true,
    showAnim: "fadeIn",
    dateFormat: "dd-mm-yy",
}).mask("00-00-0000", {
    placeholder: "dd-mm-yyyy"
}).on("blur", function () {
    if (!isValidDate($(this).val())) {
        $(this).val("");
    }
});
$('#submit').click(function () {
    var sub_ok = 1;

    $(".frm_chk").each(function () {
        if ($.trim($(this).val()) == "") {
            sub_ok = 0;
            $(this).addClass('is-invalid');
            $(this).css("border-color", "red");
        }
        else {
            $(this).css("border-color", "");
            $(this).removeClass('is-invalid');
            $(this).addClass('is-valid');
        }
    });
    if (sub_ok === 0) {
        const alertBox = document.getElementById('error-alert');
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
    var ToDate = $('#src_to_date').val();
    var FromDate = $('#src_from_date').val();
    showLoader();
    $.post('search-piechart', {
        'FromDate': FromDate,
        'ToDate': ToDate,
    }, function (data) {
        hideLoader();

        let returnData = JSON.parse(data);
        if (returnData.status === true) {
            pageLoad(
                returnData.data.target1.failure,
                returnData.data.target1.success,
                returnData.data.target1.total_set,

                returnData.data.target2.failure,
                returnData.data.target2.success,
                returnData.data.target2.total_set,

                returnData.data.target3.failure,
                returnData.data.target3.success,
                returnData.data.target3.total_set
            );

        } else {
            Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }).fail(function (xhr, status, error) {

        hideLoader();
        Swal.fire({
            title: "Error",
            text: "An error occurred while processing your request. Please try again later.",
            icon: "error",
            confirmButtonText: "OK"
        });
    }
    );

});