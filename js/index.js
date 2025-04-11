// Tài khoản
const selectElement = document.getElementById("accout");
const idLoginLocal = JSON.parse(localStorage.getItem("idLogin"));

// Chọn tháng
const monthInputE = document.getElementById("month-input");
const monthlyBudgetInput = document.getElementById("monthly-budget-input");
const monthlyBudgetForm = document.getElementById("monthly-budget-form");
const remainingAmountE = document.querySelector(".content-remaining");
let monthlyCategoriesLocal = JSON.parse(localStorage.getItem(`monthlyCategories${idLoginLocal}`)) || [];
let currentMonth = "";

// Quản lý danh mục
const manageForm = document.getElementById("manage-form");
const manageCategoryInput = document.getElementById("manage-category-input");
const manageLimitInput = document.getElementById("manage-limit-input");
const manageBtnAdd = document.getElementById("manage-btn-add");
const manageList = document.getElementById("manage-list");
const manageItem = document.getElementById("manage-item");
let editCategoryId = null;

// Hàm đăng xuất
function handleLogoutOption() {
    if (selectElement.value === "logout") {
        Swal.fire({
            title: "Bạn có chắc chắn muốn đăng xuất?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Chắc chắn!"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Đăng xuất thành công!",
                    icon: "success"
                });
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);
            } else {
                selectElement.value = "";
            }
        });
    }
}

// Cập nhật giao diện khi chọn tháng
monthInputE.addEventListener("input", (e) => {
    currentMonth = e.target.value;
    monthlyBudgetInput.value = "";
    manageCategoryInput.value = "";
    manageLimitInput.value = "";
    displayAmount();
    renderCategories();
});

// Lưu ngân sách tháng
monthlyBudgetForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentMonth) {
        Swal.fire({
            icon: "info",
            text: "Vui lòng chọn tháng trước!",
        });
        return;
    }

    let monthlyBudgetValue = monthlyBudgetInput.value;
    if (!monthlyBudgetValue) {
        Swal.fire({
            icon: "info",
            text: "Vui lòng nhập số tiền!",
        });
    } else if (monthlyBudgetValue < 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Số tiền không được âm!",
        });
    } else {
        let existingMonth = monthlyCategoriesLocal.find(item => item.month === currentMonth);
        if (existingMonth) {
            existingMonth.monthlyBudget = +monthlyBudgetValue;
        } else {
            monthlyCategoriesLocal.push({ id: monthlyCategoriesLocal.length + 1, month: currentMonth, monthlyBudget: monthlyBudgetValue });
        }
        localStorage.setItem(`monthlyCategories${idLoginLocal}`, JSON.stringify(monthlyCategoriesLocal));
        displayAmount();
    }
    monthlyBudgetInput.value = "";
});

// Hàm cập nhật giao diện số tiền còn lại
function displayAmount() {
    let monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
    remainingAmountE.style.color = "#22C55E";
    if (monthData) {
        remainingAmountE.textContent = `${Number(monthData.monthlyBudget).toLocaleString("vi-VN") + " VND"}`;
    } else {
        remainingAmountE.textContent = "0 VND";
    }
}

// Thêm danh mục
manageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentMonth) {
        Swal.fire({
            icon: "info",
            text: "Vui lòng chọn tháng trước!",
        });
        return;
    }

    let name = manageCategoryInput.value.trim();
    if (!name) {
        Swal.fire({
            icon: "info",
            text: "Vui lòng nhập danh mục!",
        });
        return;
    }

    // Viết hoa chữ đầu
    name = name.charAt(0).toUpperCase() + name.slice(1);
    const nameLower = name.toLowerCase();

    const budget = manageLimitInput.value;
    if (!budget) {
        Swal.fire({
            icon: "info",
            text: "Vui lòng nhập số tiền!",
        });
        return;
    }
    if (budget < 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Số tiền không được âm!",
        });
        return;
    }

    let monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
    if (!monthData) {
        monthData = { month: currentMonth, monthlyBudget: 0, categories: [] };
        monthlyCategoriesLocal.push(monthData);
    }

    if (!monthData.categories) monthData.categories = [];

    if (editCategoryId !== null) {
        // Sửa danh mục
        const category = monthData.categories.find(c => c.id === editCategoryId);
        if (category) {
            category.name = name;
            category.budget = budget;
        }
        editCategoryId = null;
        manageBtnAdd.textContent = "Thêm danh mục";
    } else {
        // Kiểm tra trùng tên danh mục
        const isDuplicate = monthData.categories.some(c => c.name.toLowerCase() === nameLower);
        if (isDuplicate) {
            Swal.fire({
                icon: "error",
                title: "Trùng tên danh mục!",
                text: "Tên danh mục đã tồn tại."
            });
            return;
        }

        // Gán id
        let categoryIdCounter = parseInt(localStorage.getItem(`categoryIdCounter${idLoginLocal}`)) || 1;
        const id = categoryIdCounter++;
        localStorage.setItem(`categoryIdCounter${idLoginLocal}`, categoryIdCounter.toString());

        monthData.categories.push({ id, name, budget });
    }

    localStorage.setItem(`monthlyCategories${idLoginLocal}`, JSON.stringify(monthlyCategoriesLocal));
    renderCategories();
    updateCategoryOptions();
    manageCategoryInput.value = "";
    manageLimitInput.value = "";
});

// Render danh sách danh mục
function renderCategories() {
    manageList.innerHTML = "";
    const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
    if (!monthData || !monthData.categories) return;

    monthData.categories.forEach(category => {
        const li = document.createElement("li");
        li.className = "manage-li";
        li.innerHTML = `
            <span>${category.name} - Giới hạn:${Number(category.budget).toLocaleString("vi-VN") + " VND"}</span>
            <span>
              <button class="manage-li-btn" data-action="edit" data-id="${category.id}">Sửa</button>
              <button class="manage-li-btn" data-action="delete" data-id="${category.id}">Xóa</button>
            </span>
        `;
        manageList.appendChild(li);
    });
}

// Chức năng nút
manageList.addEventListener("click", (e) => {
    if (!e.target.matches(".manage-li-btn")) return;

    const action = e.target.getAttribute("data-action");
    const id = parseInt(e.target.getAttribute("data-id"));
    const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
    if (!monthData) return;

    if (action === "edit") {
        const category = monthData.categories.find(c => c.id === id);
        if (category) {
            manageCategoryInput.value = category.name;
            manageLimitInput.value = category.budget;
            editCategoryId = category.id;
            manageBtnAdd.textContent = "Lưu danh mục";
        }
    } else if (action === "delete") {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Có, hãy xóa!"
        }).then((result) => {
            if (result.isConfirmed) {
                monthData.categories = monthData.categories.filter(c => c.id !== id);
                localStorage.setItem(`monthlyCategories${idLoginLocal}`, JSON.stringify(monthlyCategoriesLocal));
                renderCategories();
                updateCategoryOptions();
                Swal.fire({
                    title: "Xóa thành công!",
                    icon: "success"
                });
            }
        });
    }
});

// GIAO DỊCH
const transactionForm = document.querySelector(".spent");
const transactionAmountInput = document.getElementById("spent-amount-input");
const transactionDescriptionInput = document.getElementById("spent-note-input");
const transactionCategorySelect = document.querySelector(".spent-category");
const historyList = document.querySelector(".history-list");
const historyNav = document.querySelector(".history-nav");
const historySearch = document.querySelector(".history-content-input");
const historySort = document.querySelector(".history-sort");
const historySearchBtn = document.querySelector(".history-btn-search");
const warningContent = document.querySelector(".warning");
let transactionsLocal = JSON.parse(localStorage.getItem(`transactions${idLoginLocal}`)) || [];
let transactionIdCounter = parseInt(localStorage.getItem(`transactionIdCounter${idLoginLocal}`)) || 1;
const itemsPage = 5;
let currentPage = 1;
let totalSpentForCategory = 0;

// Cập nhật danh sách danh mục theo tháng hiện tại
function updateCategoryOptions() {
  transactionCategorySelect.innerHTML = '<option value="">Tiền chi tiêu</option>';
  const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
  if (!monthData) return;
  monthData.categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    transactionCategorySelect.appendChild(option);
  });
}

// Trả về index của tháng hiện tại trong mảng monthlyCategoriesLocal
function getMonthCategoryIndex() {
  const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
  if (!monthData) return null;
  return monthlyCategoriesLocal.indexOf(monthData);
}

// Lấy tên danh mục dựa vào id
function getCategoryNameById(id) {
  for (let m of monthlyCategoriesLocal) {
    const cat = m.categories?.find(c => c.id === id);
    if (cat) return cat.name;
  }
  return;
}


// Cập nhật số tiền còn lại theo ngân sách
function renderRemainingAmount() {
  const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
  if (!monthData) return;
  const totalSpent = transactionsLocal
    .filter(t => t.date === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = monthData.monthlyBudget - totalSpent;
  if(remaining > 0){
    remainingAmountE.style.color = "#22C55E"
  } else {
    remainingAmountE.style.color = "red"
  }
  remainingAmountE.textContent = `${remaining.toLocaleString("vi-VN")} VND`;
}

// Tạo các nút chuyển trang cho lịch sử giao dịch
function renderPagination(totalPages) {
  historyNav.innerHTML = "";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.className = "history-nav-previous " + (currentPage !== 1 ? "btn-hover" : "");
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactionList();
    }
  };
  historyNav.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "history-nav-number " + (i === currentPage ? " active" : "btn-hover");
    btn.onclick = () => {
      currentPage = i;
      renderTransactionList();
    };
    historyNav.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.className = "history-nav-next " + (currentPage !== totalPages ? "btn-hover" : "");
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderTransactionList();
    }
  };
  historyNav.appendChild(nextBtn);
}

// Hiển thị danh sách giao dịch theo tháng, tìm kiếm, sắp xếp và phân trang
function renderTransactionList() {
  const monthTransactions = transactionsLocal.filter(t => {
    const monthStr = t.date;
    return monthStr === currentMonth;
  });

  const keyword = historySearch.value.trim().toLowerCase();
  const filtered = monthTransactions.filter(t =>
    t.description.toLowerCase().includes(keyword)
  );

  let sorted = [...filtered];
  const sort = historySort.value;
  if (sort === "increase") {
    sorted.sort((a, b) => a.amount - b.amount);
  } else if (sort === "decrease") {
    sorted.sort((a, b) => b.amount - a.amount);
  }

  const totalPages = Math.ceil(sorted.length / itemsPage);
  currentPage = Math.min(currentPage, totalPages || 1);
  const start = (currentPage - 1) * itemsPage;
  const pageItems = sorted.slice(start, start + itemsPage);

  historyList.innerHTML = "";
  pageItems.forEach(t => {
    const li = document.createElement("li");
    li.className = "history-items";
    li.innerHTML = `
      <span class="history-items-content">
        ${getCategoryNameById(t.categoryId)} - ${t.description}: ${Number(t.amount).toLocaleString("vi-VN")} VND
      </span>
      <button class="history-items-btn" onclick = "historyDelete(${t.id})" data-id="${t.id}">Xóa</button>
    `;
    historyList.appendChild(li);
  });
  renderPagination(totalPages);
}

// Chức năng xóa lịch sử giao dịch
function historyDelete (id) {
    Swal.fire({
        title: "Bạn có chắc chắn muốn xóa?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, hãy xóa!"
    }).then((result) => {
        if (result.isConfirmed) {

            transactionsLocal = transactionsLocal.filter(item => item.id !== id);
            localStorage.setItem(`transactions${idLoginLocal}`, JSON.stringify(transactionsLocal));
            renderRemainingAmount();
            renderTransactionList();
            Swal.fire({
                title: "Xóa thành công!",
                icon: "success"
            });
        }
    });
}

// Thêm giao dịch
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!currentMonth) {
    Swal.fire({
        icon: "info",
        text: "Vui lòng chọn tháng trước!",
    });
    return;
  }

  // Lấy dữ liệu từ form
  const amount = +transactionAmountInput.value;
  const description = transactionDescriptionInput.value.trim();
  const categoryId = parseInt(transactionCategorySelect.value);
  const monthCategoryId = getMonthCategoryIndex() + 1;
  if(!amount){
    Swal.fire({
        icon: "info",
        text: "Vui lòng nhập số tiền!",
    });
    return;
  }

  if(amount < 0){
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Số tiền không được âm!",
    });
    return;
  }
  if (isNaN(categoryId)) {
    Swal.fire({
      icon: "info",
      text: "Vui lòng chọn danh mục!"
    });
    return;
  }
  
  if(!description){
    Swal.fire({
        icon: "info",
        text: "Vui lòng nhập nội dung chi tiêu!",
    });
    return;
  }

  // Kiểm tra tổng chi tiêu danh mục hiện tại có vượt quá giới hạn không
    const monthData = monthlyCategoriesLocal.find(item => item.month === currentMonth);
    if(!monthData) return;
    const category = monthData.categories.find(c => c.id === categoryId);
    totalSpentForCategory = transactionsLocal
    .filter(t => t.categoryId === categoryId && t.date === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0) + amount;

  if (category && totalSpentForCategory > category.budget) {
    warningContent.innerText = `Danh mục "${category.name}" đã vượt quá giới hạn: ${Number(totalSpentForCategory).toLocaleString("vi-VN")}/${Number(category.budget).toLocaleString("vi-VN")} VND`;
  } else {
    warningContent.innerText = "Hãy chi tiêu thật hợp lý nhé!";
  }

  // Tạo và lưu giao dịch mới
  const newTransaction = {
    id: transactionIdCounter++,
    date: currentMonth,
    amount,
    description,
    categoryId,
    monthCategoryId
  };

  transactionsLocal.push(newTransaction);
  localStorage.setItem(`transactions${idLoginLocal}`, JSON.stringify(transactionsLocal));
  localStorage.setItem(`transactionIdCounter${idLoginLocal}`, transactionIdCounter.toString());

  // Cập nhật giao diện sau khi thêm giao dịch
  transactionForm.reset();
  renderTransactionList();
  renderRemainingAmount();
});

// Tìm kiếm giao dịch khi nhấn nút tìm
historySearchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  renderTransactionList();
});

// Sắp xếp giao dịch theo giá tiền
historySort.addEventListener("change", renderTransactionList);

// Khi thay đổi tháng, cập nhật lại danh mục, giao dịch và số dư
monthInputE.addEventListener("input", () => {
  updateCategoryOptions();
  renderTransactionList();
  renderRemainingAmount();
});

// Khởi tạo giao diện ban đầu
updateCategoryOptions();
renderTransactionList();
renderRemainingAmount();
