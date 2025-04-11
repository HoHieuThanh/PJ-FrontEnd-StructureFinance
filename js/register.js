document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const userNameInput = document.getElementById("userName");
    const passwordInput = document.getElementById("userPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const errorE = document.querySelector(".error");
    const btnHide = document.getElementById("hide-btn");
    const errorContent = document.getElementById("error-content");
    let usersLocal = JSON.parse(localStorage.getItem("users")) || [];

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const userName = userNameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        function displayError() {
            errorE.style.display = "block";
            setTimeout(() => {
                errorE.style.display = "none";
            }, 2000);
        }

        // Kiểm tra userName trống
        if (userName === "") {
            errorContent.innerHTML = ("Tên người dùng không được để trống");
            displayError();
            return;
        }
        
        // Kiểm tra userName đúng định dạng
        const regex = /^[a-zA-Z0-9._%+-]+$/;
        if (!regex.test(userName)) {
            errorContent.innerHTML = ("Tên người dùng không đúng định dạng");
            displayError();
            return;
        }

        // Kiểm tra userName đã tồn tại
        const existingUser = usersLocal.find(user => user.userName === userName);
        if (existingUser) {
            errorContent.innerHTML = "Tên người dùng đã tồn tại";
            displayError();
            return;
        }

        // Kiểm tra mật khẩu trống
        if (password === "") {
            errorContent.innerHTML = ("Mật khẩu không được để trống");
            displayError();
            return;
        }

        // Kiểm tra mật khẩu tối thiểu 6 ký tự
        if (password.length < 6) {
            errorContent.innerHTML = ("Mật khẩu phải có ít nhất 6 ký tự");
            displayError();
            return;
        }

        // Kiểm tra mật khẩu đúng định dạng
        if (!regex.test(password)) {
            errorContent.innerHTML = ("Mật khẩu không đúng định dạng");
            displayError();
            return;
        }

        // Kiểm tra mật khẩu xác nhận trống
        if (confirmPassword === "") {
            errorContent.innerHTML = ("Mật khẩu xác nhận không được để trống");
            displayError();
            return;
        }

        // Kiểm tra mật khẩu xác nhận trùng
        if (password !== confirmPassword) {
            errorContent.innerHTML = ("Mật khẩu xác nhận không trùng khớp");
            displayError();
            return;
        }

        // Lưu vào Local
        const id = usersLocal.length + 1;
        const user = {
            id,
            userName,
            password
        }
        usersLocal.push(user);
        localStorage.setItem("users", JSON.stringify(usersLocal));

        // Chuyển trang loin
        errorContent.innerHTML = ("Đăng ký thành công!");
        errorContent.style.color = "green";
        errorE.style.border = "1px solid #d9ffd4";
        errorE.style.backgroundColor = "#f9fff9";
        btnHide.style.display = "none";
        errorE.style.display = "block";
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
        
    });
    btnHide.addEventListener("click", () => {
        errorE.style.display = "none"
    })
});