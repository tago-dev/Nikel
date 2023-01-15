const myModal = new bootstrap.Modal("#transaction-modal");
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
}

document.getElementById("button-logout").addEventListener("click", logout);
document.getElementById("transactions-button").addEventListener("click", function() {
    window.location.href = "transactions.html";
});

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

    getCashIn();
    getCashOut();
    getTotal();
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
    }

    getCashIn();
    getCashOut();
    getTotal();
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
            cashInHtml += `
            <div class="row mb-4">
                    <div class="col-12">
                      <h3 class="fs-2">R$ ${cashIn[index].value.toFixed(2)}</h3>
                      <div class="container p-0">
                        <div class="row">
                          <div class="col-12 col-md-8">
                            <p>${cashIn[index].description}</p>
                          </div>
                          <div class="col-12 col-md-3 d-flex justify-content-end">
                          ${cashIn[index].date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
            `

        }

        document.getElementById("cash-in-list").innerHTML = cashInHtml;
    }
}

function getCashOut() {
    const transactions = data.transactions;

    const cashIn = transactions.filter((item) => item.type === "2");

    if (cashIn.length) {
        let cashInHtml = ``;
        let limit = 0;

        if (cashIn.length > 5) {
            limit = 5;
        } else {
            limit = cashIn.length;
        }

        for (let index = 0; index < limit; index++) {
            cashInHtml += `
            <div class="row mb-4">
                    <div class="col-12">
                      <h3 class="fs-2">R$ ${cashIn[index].value.toFixed(2)}</h3>
                      <div class="container p-0">
                        <div class="row">
                          <div class="col-12 col-md-8">
                            <p>${cashIn[index].description}</p>
                          </div>
                          <div class="col-12 col-md-3 d-flex justify-content-end">
                          ${cashIn[index].date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
            `

        }

        document.getElementById("cash-out-list").innerHTML = cashInHtml;
    }
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