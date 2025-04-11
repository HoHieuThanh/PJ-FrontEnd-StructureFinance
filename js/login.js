document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const userNameInput = document.getElementById("userName");
    const passwordInput = document.getElementById("userPassword");
    let usersLocal = JSON.parse(localStorage.getItem("users")) || [];
    const errorE = document.querySelector(".error");
    const btnHide = document.getElementById("hide-btn");
    const errorContent = document.getElementById("error-content");
    let flag;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        function displayError() {
            errorE.style.display = "block";
            setTimeout(() => {
                errorE.style.display = "none";
            }, 2000);
        }
        const userName = userNameInput.value.trim();
        const password = passwordInput.value.trim();
        let idLogin;
        if (userName === "" || password === "") {
            errorContent.innerHTML = ("Tên người dùng và mật khẩu không được để trống");
            displayError();
            return;
        }

        usersLocal.forEach(user => {
            if (userName === user.userName && password === user.password) {
                idLogin = user.id;
                localStorage.setItem("idLogin", JSON.stringify(idLogin));
                errorContent.style.color = "green";
                errorContent.innerHTML = ("Đăng nhập thành công!");
                errorE.style.border = "1px solid #d9ffd4";
                errorE.style.backgroundColor = "#f9fff9";
                btnHide.style.display = "none";
                errorE.style.display = "block";
                flag = true;
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            }
            
        });
        if(!flag){
            errorContent.innerHTML = ("Tên người dùng hoặc mật khẩu không đúng");
            displayError();
        }
               
    });
    btnHide.addEventListener("click", () => {
        errorE.style.display = "none"
    })
});
