let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
};

// Charts
let incomeExpenseChart = null;
let expenseCategoryChart = null;
let balanceChart = null;

// Elements
const periodSelect = document.getElementById("period-select");
const dateStart = document.getElementById("date-start");
const dateEnd = document.getElementById("date-end");
const filtersForm = document.getElementById("filters-form");
const logoutButton = document.getElementById("button-logout");

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    checkLogged();
    initializeDates();
    loadTransactions();
});

periodSelect.addEventListener("change", handlePeriodChange);
filtersForm.addEventListener("submit", handleFiltersSubmit);
logoutButton.addEventListener("click", logout);

function checkLogged() {
    if (session) {
        sessionStorage.setItem("logged", session);
        logged = session;
    }

    if (!logged) {
        window.location.href = "index.html";
        return;
    }

    const dataUser = localStorage.getItem(logged);
    if (dataUser) {
        data = JSON.parse(dataUser);

        // Display profile photo in header if available
        if (data.photo) {
            displayHeaderPhoto(data.photo);
        }
    }
}

function initializeDates() {
    // Set default dates (last month)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    dateStart.value = formatDate(lastMonth);
    dateEnd.value = formatDate(today);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function handlePeriodChange() {
    const period = periodSelect.value;
    const today = new Date();
    let startDate = new Date();

    switch (period) {
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(today.getMonth() - 3);
            break;
        case 'semester':
            startDate.setMonth(today.getMonth() - 6);
            break;
        case 'year':
            startDate.setFullYear(today.getFullYear() - 1);
            break;
    }

    dateStart.value = formatDate(startDate);
    dateEnd.value = formatDate(today);
}

function handleFiltersSubmit(e) {
    e.preventDefault();
    loadTransactions();
}

function loadTransactions() {
    // Parse dates
    const startDate = new Date(dateStart.value);
    const endDate = new Date(dateEnd.value);

    // Filter transactions by date
    const filteredTransactions = data.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });

    // Generate charts
    generateIncomeExpenseChart(filteredTransactions);
    generateExpenseCategoryChart(filteredTransactions);
    generateBalanceChart(filteredTransactions);
}

function generateIncomeExpenseChart(transactions) {
    // Group transactions by month
    const monthlyData = groupTransactionsByMonth(transactions);

    // Prepare data for chart
    const labels = Object.keys(monthlyData).sort();
    const incomeData = [];
    const expenseData = [];

    labels.forEach(month => {
        incomeData.push(monthlyData[month].income);
        expenseData.push(monthlyData[month].expense);
    });

    // Format labels for display (Month Year)
    const formattedLabels = labels.map(month => {
        const [year, monthNum] = month.split('-');
        const monthNames = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    });

    // Create/update chart
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    incomeExpenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: formattedLabels,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    backgroundColor: 'rgba(52, 211, 153, 0.7)',
                    borderColor: 'rgba(52, 211, 153, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    backgroundColor: 'rgba(248, 113, 113, 0.7)',
                    borderColor: 'rgba(248, 113, 113, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.dataset.label + ': R$ ' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

function generateExpenseCategoryChart(transactions) {
    // Filter expense transactions only
    const expenses = transactions.filter(transaction => transaction.type === '2');

    // Group by category
    const categoryData = {};

    expenses.forEach(expense => {
        const category = expense.category || 'other';

        if (!categoryData[category]) {
            categoryData[category] = 0;
        }

        categoryData[category] += expense.value;
    });

    // Prepare data for chart
    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    // Get category names and colors
    const categoryNames = labels.map(category => getCategoryName(category));
    const backgroundColors = labels.map(category => getCategoryColor(category));

    // Create/update chart
    const ctx = document.getElementById('expenseCategoryChart').getContext('2d');

    if (expenseCategoryChart) {
        expenseCategoryChart.destroy();
    }

    expenseCategoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categoryNames,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: R$ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                },
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function generateBalanceChart(transactions) {
    // Sort transactions by date
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate cumulative balance over time
    let balance = 0;
    const balanceData = [];
    const dates = [];

    sortedTransactions.forEach(transaction => {
        if (transaction.type === '1') {
            balance += transaction.value;
        } else {
            balance -= transaction.value;
        }

        balanceData.push(balance);
        dates.push(transaction.date);
    });

    // Create/update chart
    const ctx = document.getElementById('balanceChart').getContext('2d');

    if (balanceChart) {
        balanceChart.destroy();
    }

    balanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Saldo',
                data: balanceData,
                backgroundColor: 'rgba(58, 125, 250, 0.2)',
                borderColor: 'rgba(58, 125, 250, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function (value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return 'Saldo: R$ ' + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Helper functions
function groupTransactionsByMonth(transactions) {
    const monthlyData = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[month]) {
            monthlyData[month] = {
                income: 0,
                expense: 0
            };
        }

        if (transaction.type === '1') {
            monthlyData[month].income += transaction.value;
        } else {
            monthlyData[month].expense += transaction.value;
        }
    });

    return monthlyData;
}

function getCategoryName(category) {
    const names = {
        'food': 'Alimentação',
        'transport': 'Transporte',
        'entertainment': 'Lazer',
        'health': 'Saúde',
        'education': 'Educação',
        'shopping': 'Compras',
        'bills': 'Contas',
        'salary': 'Salário',
        'investment': 'Investimento',
        'other': 'Outros'
    };

    return names[category] || 'Outros';
}

function getCategoryColor(category) {
    const colors = {
        'food': '#FFE0B2',
        'transport': '#B3E5FC',
        'entertainment': '#E1BEE7',
        'health': '#C8E6C9',
        'education': '#BBDEFB',
        'shopping': '#FFCCBC',
        'bills': '#D7CCC8',
        'salary': '#C8E6C9',
        'investment': '#B2DFDB',
        'other': '#CFD8DC'
    };

    return colors[category] || '#CFD8DC';
}

function displayHeaderPhoto(photoSrc) {
    const headerPhotoDisplay = document.getElementById("header-photo");

    // Clear existing content
    headerPhotoDisplay.innerHTML = "";

    // Create and add image
    const img = document.createElement("img");
    img.src = photoSrc;
    img.alt = "Profile Photo";
    headerPhotoDisplay.appendChild(img);
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
} 