 var overlay = $('<div id="overlay"></div>');
    var loader = $('<img src="images/circleLoader.gif" alt="Loading..." id="loader" class="loader">');

    function showLoader() {
        overlay.appendTo(document.body);
        loader.appendTo(overlay);
    }

    function hideLoader() {
        overlay.remove();
    }

    $(".frm_check").on("input", function () {
        $(this).css({
            "background-color": "transparent",
            "border": ""
        });
        $("#err_res").html("");
    });

    function verify() {
        let validation = true;
        let errorMsg = "";

        $(".frm_check").each(function () {
            if ($.trim($(this).val()) === "") {
                $(this).css({
                    "background-color": "#f2cbcb",
                    "border": "1px solid red"
                });
                validation = false;
            }
        });

        if (!validation) {
            $("#err_res").text("All fields are required.");
            return false;
        }

        let user_name = $.trim($("#user").val());
        let email_id = $.trim($("#email_id").val());

        let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email_id)) {
            $("#email_id").css({
                "background-color": "#f2cbcb",
                "border": "1px solid red"
            });
            $("#err_res").text("Please enter a valid email address.");
            return false;
        }

        // Show loader
        showLoader();

        $("#sub")
            .text("Processing...")
            .prop("disabled", true)
            .css("opacity", "0.7");

        $("#log_form").submit();
    }

    $(document).ready(function () {

        $('#log_form').on('keypress', function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                verify();
            }
        });

        $("#sub").click(function () {
            verify();
        });

    });