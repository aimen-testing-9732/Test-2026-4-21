document.addEventListener("DOMContentLoaded", () => {

    const inputs = Array.from(document.querySelectorAll(".otp-box"));
    const hiddenInput = document.getElementById("verify_otp");

    // ✅ Handle typing
    inputs.forEach((input, index) => {

        input.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");
            e.target.value = value;

            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            updateOTP();
            removeError();
        });

        // ✅ FIXED backspace behavior
        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                if (!input.value && index > 0) {
                    inputs[index - 1].focus();
                }
            }
        });

        // ✅ Paste support
        input.addEventListener("paste", (e) => {
            e.preventDefault();

            let pasteData = (e.clipboardData || window.clipboardData)
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 6);

            inputs.forEach((box, i) => {
                box.value = pasteData[i] || "";
            });

            updateOTP();
        });

    });

    // ✅ Update hidden OTP
    function updateOTP() {
        hiddenInput.value = inputs.map(i => i.value).join("");
    }


    const submitBtn = document.getElementById("sub_otp");
    const form = document.getElementById("otp_form");

    submitBtn.addEventListener("click", () => {

        let otp = hiddenInput.value.trim();

        removeError();

        if (otp === "") {
            showError("OTP cannot be blank");
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            showError("Enter valid 6-digit OTP");
            return;
        }

        // ✅ Disable button ONLY when valid
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing...";
        submitBtn.style.opacity = "0.7";

        // ✅ Submit form
        form.submit();
    });

    function showError(msg) {
        document.getElementById("otp_error_text").innerText = msg;
        document.getElementById("otp_error").style.display = "block";
        inputs.forEach(i => i.classList.add("is-invalid"));
    }

    function removeError() {
        document.getElementById("otp_error").style.display = "none";
        inputs.forEach(i => i.classList.remove("is-invalid"));
    }

});