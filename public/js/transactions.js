const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
}

document.getElementById("button-logout").addEventListener("click", logout);

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

    getTransactions();
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

    getTransactions();

    // Inicializar seleção de categorias
    initCategories();
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");

    window.location.href = "index.html";
}

function getTransactions() {
    const transactions = data.transactions;
    let transactionsHtml = ``;

    if (transactions.length) {
        transactions.forEach((item) => {
            let type = "Entrada";
            let typeClass = "text-success";

            if (item.type === "2") {
                type = "Saída";
                typeClass = "text-danger";
            }

            // Categoria
            const categoryClass = item.category ? `category-${item.category}` : 'category-other';
            const categoryIcon = getCategoryIcon(item.category);
            const categoryName = getCategoryName(item.category);

            transactionsHtml += `
            <tr>
                <td class="text-center">${item.date}</td>
                <td class="text-center ${typeClass}">R$ ${item.value.toFixed(2)}</td>
                <td class="text-center">
                    <span class="badge ${item.type === "1" ? "bg-success" : "bg-danger"}">
                        ${type}
                    </span>
                </td>
                <td class="text-center">
                    <span class="transaction-category ${categoryClass}">
                        ${categoryIcon} ${categoryName}
                    </span>
                </td>
                <td>${item.description}</td>
            </tr>
            `;
        });
    }
    document.getElementById("transactions-list").innerHTML = transactionsHtml;
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