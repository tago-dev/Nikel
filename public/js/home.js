const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
}

document.getElementById("button-logout").addEventListener("click", logout);
document.getElementById("transactions-button").addEventListener("click", function () {
    window.location.href = "transactions.html";
});

// Gerenciar categorias
document.querySelectorAll(".category-badge").forEach(badge => {
    badge.addEventListener("click", selectCategory);
});

// Mudança de tipo de transação
document.querySelectorAll('input[name="type-input"]').forEach(radio => {
    radio.addEventListener("change", toggleCategoryVisibility);
});

// Inicializar visualização de categorias baseada no tipo selecionado
function initCategories() {
    const selectedType = document.querySelector('input[name="type-input"]:checked').value;
    toggleCategoryVisibility({ target: { value: selectedType } });

    // Selecionar categoria "Outros" como padrão
    document.querySelector(`.category-badge[data-category="other"][data-type="${selectedType}"]`).click();
}

// Alternar a visibilidade das categorias baseado no tipo de transação selecionado
function toggleCategoryVisibility(e) {
    const type = e.target.value;

    // Ocultar todas as categorias
    document.querySelectorAll('.category-badge').forEach(badge => {
        badge.style.display = 'none';
    });

    // Mostrar apenas as categorias do tipo selecionado
    document.querySelectorAll(`.category-badge[data-type="${type}"]`).forEach(badge => {
        badge.style.display = 'inline-flex';
    });

    // Limpar a seleção atual
    document.querySelectorAll('.category-badge').forEach(badge => {
        badge.classList.remove('active');
    });

    // Selecionar a categoria "Outros" por padrão
    document.querySelector(`.category-badge[data-category="other"][data-type="${type}"]`).classList.add('active');
    document.getElementById('category-input').value = 'other';
}

// Selecionar uma categoria
function selectCategory(e) {
    // Limpar seleção anterior
    document.querySelectorAll('.category-badge').forEach(badge => {
        badge.classList.remove('active');
    });

    // Selecionar nova categoria
    e.currentTarget.classList.add('active');

    // Atualizar o input hidden
    document.getElementById('category-input').value = e.currentTarget.dataset.category;
}

// adicionar lancamento
document.getElementById("transaction-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const valor = parseFloat(document.getElementById("value-input").value);
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;
    const type = document.querySelector('input[name="type-input"]:checked').value;
    const category = document.getElementById("category-input").value;

    data.transactions.unshift({
        value: valor,
        type: type,
        description: description,
        date: date,
        category: category
    });

    saveData(data);
    e.target.reset();
    myModal.hide();

    getCashIn();
    getCashOut();
    getTotal();
    alert("Lançamento adicionado com sucesso!");
});

checkLogged();

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

    getCashIn();
    getCashOut();
    getTotal();

    // Inicializar seleção de categorias
    initCategories();
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
}

function getCashIn() {
    const transactions = data.transactions;

    const cashIn = transactions.filter((item) => item.type === "1");

    if (cashIn.length) {
        let cashInHtml = ``;
        let limit = 0;

        if (cashIn.length > 5) {
            limit = 5;
        } else {
            limit = cashIn.length;
        }

        for (let index = 0; index < limit; index++) {
            const categoryClass = cashIn[index].category ? `category-${cashIn[index].category}` : 'category-other';
            const categoryIcon = getCategoryIcon(cashIn[index].category);
            const categoryName = getCategoryName(cashIn[index].category);

            cashInHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="fs-2">R$ ${cashIn[index].value.toFixed(2)}</h3>
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p>${cashIn[index].description}
                                    <span class="transaction-category ${categoryClass}">
                                        ${categoryIcon} ${categoryName}
                                    </span>
                                </p>
                            </div>
                            <div class="col-12 col-md-3 d-flex justify-content-end">
                                ${cashIn[index].date}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        document.getElementById("cash-in-list").innerHTML = cashInHtml;
    }
}

function getCashOut() {
    const transactions = data.transactions;

    const cashOut = transactions.filter((item) => item.type === "2");

    if (cashOut.length) {
        let cashOutHtml = ``;
        let limit = 0;

        if (cashOut.length > 5) {
            limit = 5;
        } else {
            limit = cashOut.length;
        }

        for (let index = 0; index < limit; index++) {
            const categoryClass = cashOut[index].category ? `category-${cashOut[index].category}` : 'category-other';
            const categoryIcon = getCategoryIcon(cashOut[index].category);
            const categoryName = getCategoryName(cashOut[index].category);

            cashOutHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class="fs-2">R$ ${cashOut[index].value.toFixed(2)}</h3>
                    <div class="container p-0">
                        <div class="row">
                            <div class="col-12 col-md-8">
                                <p>${cashOut[index].description}
                                    <span class="transaction-category ${categoryClass}">
                                        ${categoryIcon} ${categoryName}
                                    </span>
                                </p>
                            </div>
                            <div class="col-12 col-md-3 d-flex justify-content-end">
                                ${cashOut[index].date}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        }

        document.getElementById("cash-out-list").innerHTML = cashOutHtml;
    }
}

// Obter ícone da categoria
function getCategoryIcon(category) {
    const icons = {
        'food': '<i class="bi bi-egg-fried"></i>',
        'transport': '<i class="bi bi-car-front"></i>',
        'entertainment': '<i class="bi bi-controller"></i>',
        'health': '<i class="bi bi-heart-pulse"></i>',
        'education': '<i class="bi bi-book"></i>',
        'shopping': '<i class="bi bi-bag"></i>',
        'bills': '<i class="bi bi-receipt"></i>',
        'salary': '<i class="bi bi-wallet2"></i>',
        'investment': '<i class="bi bi-graph-up-arrow"></i>',
        'other': '<i class="bi bi-three-dots"></i>'
    };

    return icons[category] || icons['other'];
}

// Obter nome da categoria
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

function getTotal() {
    const transactions = data.transactions;
    let total = 0;

    transactions.forEach((item) => {
        if (item.type === "1") {
            total += item.value;
        } else {
            total -= item.value;
        }
    });

    document.getElementById("total").innerHTML = `R$ ${total.toFixed(2)}`;
}

function saveData(data) {
    localStorage.setItem(data.login, JSON.stringify(data));
}

// Display profile photo in header
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