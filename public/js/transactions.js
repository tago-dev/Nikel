const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
}

document.getElementById("button-logout").addEventListener("click", logout);

// adicionar lancamento
document.getElementById("transaction-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const valor = parseFloat(document.getElementById("value-input").value);
    const description = document.getElementById("description-input").value;
    const date = document.getElementById("date-input").value;
    const type = document.querySelector('input[name="type-input"]:checked').value;

    data.transactions.unshift({
        value: valor, type: type, description: description, date: date
    })

    saveData(data);
    e.target.reset();
    myModal.hide();

    getTransactions()
    alert("Lançamento adicionado com sucesso!")
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

    getTransactions()
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

            if (item.type === "2") {
                type = "Saída";
            }

            transactionsHtml += `
            <tr>
                <th scope="row">${item.date}</th>
                <td>${item.value.toFixed(2)}</td>
                <td>${type}</td>
                <td>${item.description}</td>
            </tr>
            `
        })
    }
    document.getElementById("transactions-list").innerHTML = transactionsHtml;
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