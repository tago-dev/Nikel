// Variables
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    login: "",
    password: "",
    name: "",
    photo: "",
    transactions: []
};

// Elements
const photoInput = document.getElementById("profile-photo-input");
const photoDisplay = document.getElementById("profile-photo");
const headerPhotoDisplay = document.getElementById("header-photo");
const photoName = document.getElementById("photo-name");
const nameInput = document.getElementById("name-input");
const emailDisplay = document.getElementById("profile-email");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const profileForm = document.getElementById("profile-form");
const logoutButton = document.getElementById("button-logout");

// Event listeners
document.addEventListener("DOMContentLoaded", checkLogged);
photoInput.addEventListener("change", handlePhotoChange);
profileForm.addEventListener("submit", saveProfile);
logoutButton.addEventListener("click", logout);

// Functions
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

        // Fill form with user data
        if (data.name) {
            nameInput.value = data.name;
        }

        emailDisplay.value = data.login;

        if (data.photo) {
            displayProfilePhoto(data.photo);
            displayHeaderPhoto(data.photo);
        }
    }
}

function handlePhotoChange(e) {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const photoBase64 = event.target.result;
            displayProfilePhoto(photoBase64);
            displayHeaderPhoto(photoBase64);
            photoName.textContent = file.name;

            // Store the photo temporarily
            data.photo = photoBase64;
        };

        reader.readAsDataURL(file);
    }
}

function displayProfilePhoto(photoSrc) {
    // Clear existing content
    photoDisplay.innerHTML = "";

    // Create and add image
    const img = document.createElement("img");
    img.src = photoSrc;
    img.alt = "Profile Photo";
    photoDisplay.appendChild(img);
}

function displayHeaderPhoto(photoSrc) {
    // Clear existing content
    headerPhotoDisplay.innerHTML = "";

    // Create and add image
    const img = document.createElement("img");
    img.src = photoSrc;
    img.alt = "Profile Photo";
    headerPhotoDisplay.appendChild(img);
}

function saveProfile(e) {
    e.preventDefault();

    // Validate name
    const name = nameInput.value.trim();
    if (name === "") {
        alert("Por favor, informe seu nome.");
        return;
    }

    // Update name
    data.name = name;

    // Check if password change was requested
    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (currentPassword || newPassword || confirmPassword) {
        // Validate current password
        if (currentPassword !== data.password) {
            alert("Senha atual incorreta.");
            return;
        }

        // Validate new password
        if (newPassword.length < 4) {
            alert("A nova senha deve ter pelo menos 4 caracteres.");
            return;
        }

        // Validate confirmation
        if (newPassword !== confirmPassword) {
            alert("As senhas não coincidem.");
            return;
        }

        // Update password
        data.password = newPassword;
    }

    // Save data
    saveData(data);

    // Reset password fields
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    alert("Perfil atualizado com sucesso!");
}

function saveData(data) {
    localStorage.setItem(data.login, JSON.stringify(data));
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");
    window.location.href = "index.html";
} 