let totalBudget = 0;
let totalExpense = 0;

let expenses = [];
let editId = null;

// Load saved data

function loadData() {

    let savedData = localStorage.getItem("expenseTracker");

    if (savedData) {

        try {

            let data = JSON.parse(savedData);

            totalBudget = Number(data.totalBudget) || 0;

            expenses = Array.isArray(data.expenses)
                ? data.expenses
                : [];

            totalExpense = expenses.reduce((total, expense) => {
                return total + Number(expense.cost);
            }, 0);

        } catch (error) {

            totalBudget = 0;
            totalExpense = 0;
            expenses = [];

        }
    }

    updateUI();
}

// Save data

function saveData() {

    let data = {
        totalBudget: totalBudget,
        expenses: expenses
    };

    localStorage.setItem("expenseTracker", JSON.stringify(data));
}

// Set Budget

function setBudget() {

    let budgetInput = document.getElementById("budget");

    let budget = Number(budgetInput.value);

    if (budgetInput.value.trim() === "" ||
        !Number.isFinite(budget) ||
        budget <= 0) {

        alert("Please enter a valid budget");
        return;
    }

    // Budget cannot be less than existing expenses

    if (budget < totalExpense) {

        alert("Budget cannot be less than your total expenses!");
        return;
    }

    totalBudget = budget;

    budgetInput.value = "";

    saveData();

    updateUI();

    alert("Budget updated successfully!");
}

// Add Expense

function addExpense() {

    let titleInput = document.getElementById("title");

    let costInput = document.getElementById("cost");

    let title = titleInput.value.trim();

    let cost = Number(costInput.value);

    if (title === "" || costInput.value.trim() === "") {

        alert("Please fill all fields");
        return;
    }

    if (!Number.isFinite(cost) || cost <= 0) {

        alert("Please enter a valid expense amount");
        return;
    }

    if (totalBudget <= 0) {

        alert("Please set your budget first!");
        return;
    }

    // Calculate remaining budget

    let currentExpense = totalExpense;

    // Exclude old expense amount during editing

    if (editId !== null) {

        let oldExpense = expenses.find(item => item.id === editId);

        if (!oldExpense) {

            editId = null;

            document.getElementById("expenseButton").innerText = "Add Expense";

            alert("Expense not found!");
            return;
        }

        currentExpense -= Number(oldExpense.cost);
    }

    let remainingBalance = totalBudget - currentExpense;

    // Prevent expense exceeding budget

    if (cost > remainingBalance) {

        alert("Expense exceeds your remaining budget!");
        return;
    }

    // Update existing expense

    if (editId !== null) {

        let index = expenses.findIndex(item => item.id === editId);

        if (index !== -1) {

            expenses[index].title = title;

            expenses[index].cost = cost;

        }

        editId = null;

        document.getElementById("expenseButton").innerText = "Add Expense";

    }

    // Add new expense

    else {

        expenses.push({

            id: Date.now(),

            title: title,

            cost: cost

        });

    }

    titleInput.value = "";

    costInput.value = "";

    saveData();

    updateUI();

}

// Edit Expense

function editExpense(id) {

    let expense = expenses.find(item => item.id === id);

    if (!expense) return;

    document.getElementById("title").value = expense.title;

    document.getElementById("cost").value = expense.cost;

    document.getElementById("expenseButton").innerText = "Update Expense";

    editId = id;

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// Delete Expense

function deleteExpense(id) {

    let confirmDelete = confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) return;

    expenses = expenses.filter(item => item.id !== id);

    // Reset edit mode if deleted expense was being edited

    if (editId === id) {

        editId = null;

        document.getElementById("title").value = "";

        document.getElementById("cost").value = "";

        document.getElementById("expenseButton").innerText = "Add Expense";

    }

    saveData();

    updateUI();

}

// Update UI

function updateUI() {

    totalExpense = expenses.reduce((total, expense) => {

        return total + Number(expense.cost);

    }, 0);

    let balance = totalBudget - totalExpense;

    document.getElementById("budgetAmount").innerText =
        totalBudget.toLocaleString();

    document.getElementById("expenseAmount").innerText =
        totalExpense.toLocaleString();

    document.getElementById("balanceAmount").innerText =
        balance.toLocaleString();

    displayExpenses();

}

// Display Expenses

function displayExpenses() {

    let expenseList = document.getElementById("expenseList");

    expenseList.innerHTML = "";

    if (expenses.length === 0) {

        expenseList.innerHTML =
            `<p class="empty-message">No expenses added yet.</p>`;

        return;
    }

    expenses.forEach(expense => {

        let item = document.createElement("div");

        item.classList.add("expense-item");

        let title = document.createElement("span");

        title.innerText = expense.title;

        let amount = document.createElement("span");

        amount.classList.add("expense-amount");

        amount.innerText = Number(expense.cost).toLocaleString();

        let actions = document.createElement("div");

        actions.classList.add("actions");

        // Edit button

        let editIcon = document.createElement("i");

        editIcon.className = "fa-solid fa-pen edit-icon";

        editIcon.title = "Edit Expense";

        editIcon.onclick = () => editExpense(expense.id);

        // Delete button

        let deleteIcon = document.createElement("i");

        deleteIcon.className = "fa-solid fa-trash delete-icon";

        deleteIcon.title = "Delete Expense";

        deleteIcon.onclick = () => deleteExpense(expense.id);

        actions.appendChild(editIcon);

        actions.appendChild(deleteIcon);

        item.appendChild(title);

        item.appendChild(amount);

        item.appendChild(actions);

        expenseList.appendChild(item);

    });

}

// Start Application

loadData();
