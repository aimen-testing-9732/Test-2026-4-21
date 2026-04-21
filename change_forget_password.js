$("#sub_otp").click(function () {

    var btn = $(this); 
    var pass = $("#pass");
    var conpass = $("#conpass");

    var passval = pass.val().trim();
    var conpassval = conpass.val().trim();

    pass.removeClass("is-invalid");
    conpass.removeClass("is-invalid");
    $("#otp_error").hide();


    if (passval === "") {
        showError("Password cannot be blank", pass);
        return;
    }

    if (passval.length < 8) {
        showError("Password must be at least 8 characters long", pass);
        return;
    }

    if (conpassval === "") {
        showError("Confirm Password cannot be blank", conpass);
        return;
    }

    if (passval !== conpassval) {
        showError("Password and Confirm Password should match", conpass);
        return;
    }

    btn.prop("disabled", true)
        .text("Processing...")
        .css("opacity", "0.7");

    $("#otp_form").submit();
});

$("#pass").on("keyup", function () {
    var val = $(this).val();
    var strength = checkStrength(val);

    if (val.length >= 8) {
        $("#otp_error_text").text("Password Strength: " + strength.text);
        $("#otp_error").show();
        $("#otp_error").css("color", strength.color);
    } else {
        $("#otp_error").hide();
    }
});

function checkStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W]/.test(password)) strength++;

    if (strength <= 2) {
        return {
            text: "Weak",
            color: "red"
        };
    } else if (strength === 3 || strength === 4) {
        return {
            text: "Medium",
            color: "orange"
        };
    } else {
        return {
            text: "Strong",
            color: "green"
        };
    }
}

function showError(msg, element) {
    $("#otp_error_text").text(msg);
    $("#otp_error").fadeIn().css("color", "#dc3545");
    element.addClass("is-invalid").focus();
}

$(".toggle-password").click(function () {

    var input = $($(this).attr("toggle"));
    var icon = $(this).find("i");

    if (input.attr("type") === "password") {
        input.attr("type", "text");
        icon.removeClass("fa-eye").addClass("fa-eye-slash");
    } else {
        input.attr("type", "password");
        icon.removeClass("fa-eye-slash").addClass("fa-eye");
    }
});