/*
    AVIA MESSENGER
    Без сервера.
    Данные сохраняются в localStorage.
*/


// =====================================
// CONFIG
// =====================================

// Для демо.
// Если этот email зарегистрирован,
// аккаунт получает возможности разработчика.

const DEVELOPER_EMAIL = "developer@avia.local";


// =====================================
// STORAGE
// =====================================

const USERS_KEY = "avia_users";
const CURRENT_USER_KEY = "avia_current_user";
const POSTS_KEY = "avia_official_posts";


// =====================================
// HELPERS
// =====================================

function getUsers() {

    return JSON.parse(
        localStorage.getItem(USERS_KEY) || "[]"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


function getPosts() {

    return JSON.parse(
        localStorage.getItem(POSTS_KEY) || "[]"
    );

}


function savePosts(posts) {

    localStorage.setItem(
        POSTS_KEY,
        JSON.stringify(posts)
    );

}


function getCurrentUser() {

    return JSON.parse(
        localStorage.getItem(CURRENT_USER_KEY) || "null"
    );

}


function setCurrentUser(user) {

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(user)
    );

}


function removeCurrentUser() {

    localStorage.removeItem(
        CURRENT_USER_KEY
    );

}


function getInitial(name) {

    if (!name) {
        return "A";
    }

    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================
// SCREENS
// =====================================

const authScreen =
    document.getElementById("authScreen");

const mainScreen =
    document.getElementById("mainScreen");

const channelScreen =
    document.getElementById("channelScreen");

const profileScreen =
    document.getElementById("profileScreen");


function hideAllScreens() {

    authScreen.classList.add("hidden");
    mainScreen.classList.add("hidden");
    channelScreen.classList.add("hidden");
    profileScreen.classList.add("hidden");

}


function showMain() {

    hideAllScreens();

    mainScreen.classList.remove("hidden");

    updateUserInterface();

}


function showChannel() {

    hideAllScreens();

    channelScreen.classList.remove("hidden");

    renderPosts();

}


function showProfile() {

    hideAllScreens();

    profileScreen.classList.remove("hidden");

    updateProfile();

}


// =====================================
// AUTH FORMS
// =====================================

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");


document
    .getElementById("goRegister")
    .addEventListener("click", () => {

        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");

        document.getElementById("loginError").textContent = "";

    });


document
    .getElementById("goLogin")
    .addEventListener("click", () => {

        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        document.getElementById("registerError").textContent = "";

    });


// =====================================
// REGISTER
// =====================================

document
    .getElementById("registerButton")
    .addEventListener("click", register);


function register() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const username =
        document
            .getElementById("registerUsername")
            .value
            .trim()
            .replace(/^@/, "");

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const error =
        document.getElementById("registerError");


    error.textContent = "";


    if (!name) {

        error.textContent =
            "Введи своё имя.";

        return;
    }


    if (!username) {

        error.textContent =
            "Придумай username.";

        return;
    }


    if (username.length < 3) {

        error.textContent =
            "Username должен содержать минимум 3 символа.";

        return;
    }


    if (!email.includes("@")) {

        error.textContent =
            "Введи корректный email.";

        return;
    }


    if (password.length < 6) {

        error.textContent =
            "Пароль должен содержать минимум 6 символов.";

        return;
    }


    const users = getUsers();


    const emailExists =
        users.some(
            user => user.email === email
        );


    if (emailExists) {

        error.textContent =
            "Аккаунт с таким email уже существует.";

        return;
    }


    const usernameExists =
        users.some(
            user =>
                user.username.toLowerCase()
                === username.toLowerCase()
        );


    if (usernameExists) {

        error.textContent =
            "Этот username уже занят.";

        return;
    }


    const user = {

        id:
            crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),

        name,

        username,

        email,

        password,

        role:
            email === DEVELOPER_EMAIL
                ? "admin"
                : "user",

        createdAt:
            new Date().toISOString()

    };


    users.push(user);

    saveUsers(users);

    setCurrentUser(user);


    // Автоматическая подписка
    // логически происходит сразу:
    user.subscribedToOfficialChannel = true;


    showMain();

}


// =====================================
// LOGIN
// =====================================

document
    .getElementById("loginButton")
    .addEventListener("click", login);


function login() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim()
            .toLowerCase();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const error =
        document.getElementById("loginError");


    error.textContent = "";


    const users = getUsers();


    const user =
        users.find(
            item =>
                item.email === email &&
                item.password === password
        );


    if (!user) {

        error.textContent =
            "Неверный email или пароль.";

        return;
    }


    setCurrentUser(user);

    showMain();

}


// =====================================
// USER INTERFACE
// =====================================

function updateUserInterface() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }


    document
        .getElementById("headerUser")
        .textContent =
            `@${user.username}`;


    document
        .getElementById("headerAvatar")
        .textContent =
            getInitial(user.name);

}


// =====================================
// PROFILE
// =====================================

function updateProfile() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }


    document
        .getElementById("profileAvatar")
        .textContent =
            getInitial(user.name);


    document
        .getElementById("profileName")
        .textContent =
            user.name;


    document
        .getElementById("profileUsername")
        .textContent =
            `@${user.username}`;


    document
        .getElementById("profileEmail")
        .textContent =
            user.email;

}


// =====================================
// OFFICIAL CHANNEL
// =====================================

document
    .getElementById("officialChat")
    .addEventListener(
        "click",
        showChannel
    );


document
    .getElementById("backChannel")
    .addEventListener(
        "click",
        showMain
    );


// =====================================
// POSTS
// =====================================

function renderPosts() {

    const container =
        document.getElementById("posts");

    const posts = getPosts();


    container.innerHTML = "";


    if (posts.length === 0) {

        container.innerHTML = `
            <div class="no-posts">
                <h3>Пока нет новостей</h3>
                <p>Здесь будут появляться обновления AVIA.</p>
            </div>
        `;

    } else {

        [...posts]
            .reverse()
            .forEach(post => {

                const element =
                    document.createElement("article");

                element.className = "post";


                const date =
                    new Date(post.createdAt);


                element.innerHTML = `
                    <div class="post-date">
                        ${date.toLocaleString("ru-RU")}
                    </div>

                    <div class="post-text">
                        ${escapeHTML(post.text)}
                    </div>
                `;


                container.appendChild(element);

            });

    }


    updateAdminPanel();

}


// =====================================
// ADMIN
// =====================================

function updateAdminPanel() {

    const user = getCurrentUser();

    const panel =
        document.getElementById("adminPanel");


    if (
        user &&
        user.role === "admin"
    ) {

        panel.classList.remove("hidden");

    } else {

        panel.classList.add("hidden");

    }

}


document
    .getElementById("publishButton")
    .addEventListener(
        "click",
        publishPost
    );


function publishPost() {

    const user = getCurrentUser();


    if (
        !user ||
        user.role !== "admin"
    ) {

        return;
    }


    const input =
        document.getElementById("newsInput");

    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    const posts = getPosts();


    posts.push({

        id:
            crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),

        text,

        author:
            user.username,

        createdAt:
            new Date().toISOString()

    });


    savePosts(posts);


    input.value = "";


    renderPosts();

}


// =====================================
// PROFILE NAVIGATION
// =====================================

document
    .getElementById("headerProfile")
    .addEventListener(
        "click",
        showProfile
    );


document
    .getElementById("profileNav")
    .addEventListener(
        "click",
        showProfile
    );


document
    .getElementById("backProfile")
    .addEventListener(
        "click",
        showMain
    );


// =====================================
// LOGOUT
// =====================================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        () => {

            removeCurrentUser();

            hideAllScreens();

            authScreen.classList.remove("hidden");

            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");

            document.getElementById("loginEmail").value = "";
            document.getElementById("loginPassword").value = "";

        }
    );


// =====================================
// SEARCH
// =====================================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .trim()
                    .toLowerCase();

            const official =
                document.getElementById("officialChat");


            if (
                !query ||
                "cats developer studio"
                    .includes(query) ||
                "avia"
                    .includes(query)
            ) {

                official.style.display = "flex";

            } else {

                official.style.display = "none";

            }

        }
    );


// =====================================
// START
// =====================================

function startApp() {

    const user = getCurrentUser();


    if (user) {

        showMain();

    } else {

        hideAllScreens();

        authScreen.classList.remove("hidden");

    }

}


startApp();