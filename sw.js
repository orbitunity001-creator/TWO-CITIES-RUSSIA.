"use strict";

/* =====================================================
   AVION MESSENGER — SCRIPT v40
===================================================== */


/* =====================================================
   VERSION / STORAGE
===================================================== */

const VERSION = "v40";

const USERS_KEY =
    "avion_users_" + VERSION;

const CURRENT_KEY =
    "avion_current_" + VERSION;


/* =====================================================
   HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}


function getUsers() {

    try {

        const data =
            localStorage.getItem(USERS_KEY);

        return data
            ? JSON.parse(data)
            : [];

    } catch (error) {

        console.error(
            "AVION: ошибка чтения пользователей",
            error
        );

        return [];

    }

}


function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


function normalizePhone(value) {

    return String(value || "")
        .replace(/\D/g, "");

}


function formatPhone(phone) {

    phone = String(phone || "");

    if (phone.length === 11) {

        return (
            "+" +
            phone[0] +
            " " +
            phone.slice(1, 4) +
            " " +
            phone.slice(4, 7) +
            "-" +
            phone.slice(7, 9) +
            "-" +
            phone.slice(9, 11)
        );

    }

    return phone
        ? "+" + phone
        : "Телефон не указан";

}


/* =====================================================
   SCREEN SYSTEM
===================================================== */

function showScreen(id) {

    const screens =
        document.querySelectorAll(
            ".screen"
        );

    screens.forEach(screen => {

        screen.classList.remove(
            "active"
        );

    });


    const target =
        $(id);

    if (!target) {

        console.error(
            "AVION: экран не найден:",
            id
        );

        return;

    }


    target.classList.add(
        "active"
    );


    fixViewport();


    /*
       Возвращаем scroll auth-экрана
       наверх при переходе.
    */

    if (
        target.classList.contains(
            "auth-screen"
        )
    ) {

        target.scrollTop = 0;

    }

}


/* =====================================================
   ERROR
===================================================== */

function showError(id, text) {

    const element = $(id);

    if (!element) return;

    element.textContent =
        text || "";

}


/* =====================================================
   MOBILE VIEWPORT
===================================================== */

function fixViewport() {

    const app = $("app");

    if (!app) return;


    let height =
        window.innerHeight;


    if (
        window.visualViewport &&
        window.visualViewport.height
    ) {

        height =
            window.visualViewport.height;

    }


    if (
        height &&
        height > 100
    ) {

        app.style.height =
            Math.round(height) + "px";

    }

}


/* =====================================================
   KEYBOARD / VIEWPORT
===================================================== */

window.addEventListener(
    "resize",
    fixViewport,
    {
        passive: true
    }
);


window.addEventListener(
    "orientationchange",
    () => {

        setTimeout(
            fixViewport,
            150
        );

    },
    {
        passive: true
    }
);


if (
    window.visualViewport
) {

    window.visualViewport.addEventListener(
        "resize",
        fixViewport,
        {
            passive: true
        }
    );

}


/* =====================================================
   PREVENT PAGE MOVEMENT
===================================================== */

document.addEventListener(
    "touchmove",
    event => {

        const target =
            event.target;


        /*
           Разрешаем вертикальный свайп
           только там, где он реально нужен.
        */

        const scrollArea =
            target.closest(
                ".chat-list, .auth-screen, .profile-card"
            );


        if (!scrollArea) {

            event.preventDefault();

        }

    },
    {
        passive: false
    }
);


/* =====================================================
   LOADING
===================================================== */

function startApp() {

    fixViewport();


    setTimeout(
        checkAccount,
        2200
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startApp
    );

} else {

    startApp();

}


/* =====================================================
   WELCOME
===================================================== */

$("loginStart").addEventListener(
    "click",
    () => {

        showError(
            "loginError",
            ""
        );

        showScreen(
            "loginScreen"
        );


        setTimeout(
            () => {

                $("loginPhone")
                    .focus();

            },
            150
        );

    }
);


$("registerStart").addEventListener(
    "click",
    () => {

        showError(
            "registerError",
            ""
        );

        showScreen(
            "registerScreen"
        );


        setTimeout(
            () => {

                $("registerName")
                    .focus();

            },
            150
        );

    }
);


/* =====================================================
   BACK BUTTONS
===================================================== */

document
    .querySelectorAll(
        "[data-back]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.back;

                showScreen(
                    target
                );

            }
        );

    });


/* =====================================================
   REGISTER
===================================================== */

$("registerButton").addEventListener(
    "click",
    registerUser
);


function registerUser() {

    const name =
        $("registerName")
            .value
            .trim();


    const phone =
        normalizePhone(
            $("registerPhone").value
        );


    const password =
        $("registerPassword")
            .value;


    showError(
        "registerError",
        ""
    );


    /* Имя */

    if (!name) {

        showError(
            "registerError",
            "Введите имя."
        );

        $("registerName").focus();

        return;

    }


    if (name.length < 2) {

        showError(
            "registerError",
            "Имя должно содержать минимум 2 символа."
        );

        $("registerName").focus();

        return;

    }


    /* Телефон */

    if (
        phone.length < 10
    ) {

        showError(
            "registerError",
            "Введите корректный номер телефона."
        );

        $("registerPhone").focus();

        return;

    }


    /* Пароль */

    if (
        password.length < 4
    ) {

        showError(
            "registerError",
            "Пароль должен содержать минимум 4 символа."
        );

        $("registerPassword").focus();

        return;

    }


    const users =
        getUsers();


    /* Проверяем телефон */

    const exists =
        users.some(
            user =>
                user.phone === phone
        );


    if (exists) {

        showError(
            "registerError",
            "Этот номер уже зарегистрирован."
        );

        $("registerPhone").focus();

        return;

    }


    /* Создаём пользователя */

    const user = {

        id:
            Date.now(),

        name:
            name,

        phone:
            phone,

        password:
            password,

        createdAt:
            new Date().toISOString()

    };


    users.push(
        user
    );


    saveUsers(
        users
    );


    localStorage.setItem(
        CURRENT_KEY,
        String(user.id)
    );


    openMain(
        user
    );

}


/* =====================================================
   LOGIN
===================================================== */

$("loginButton").addEventListener(
    "click",
    loginUser
);


function loginUser() {

    const phone =
        normalizePhone(
            $("loginPhone").value
        );


    const password =
        $("loginPassword")
            .value;


    showError(
        "loginError",
        ""
    );


    if (
        phone.length < 10
    ) {

        showError(
            "loginError",
            "Введите номер телефона."
        );

        $("loginPhone").focus();

        return;

    }


    if (!password) {

        showError(
            "loginError",
            "Введите пароль."
        );

        $("loginPassword").focus();

        return;

    }


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.phone === phone
        );


    if (!user) {

        showError(
            "loginError",
            "Номер не зарегистрирован."
        );

        $("loginPhone").focus();

        return;

    }


    if (
        user.password !== password
    ) {

        showError(
            "loginError",
            "Неверный пароль."
        );

        $("loginPassword").focus();

        return;

    }


    localStorage.setItem(
        CURRENT_KEY,
        String(user.id)
    );


    openMain(
        user
    );

}


/* =====================================================
   OPEN MAIN
===================================================== */

function openMain(user) {

    if (!user) {

        showScreen(
            "welcomeScreen"
        );

        return;

    }


    /* Имя профиля */

    $("profileName")
        .textContent =
        user.name;


    /* Телефон */

    $("profilePhone")
        .textContent =
        formatPhone(
            user.phone
        );


    /* Аватар в шапке */

    const firstLetter =
        user.name
            .charAt(0)
            .toUpperCase();


    $("profileButton")
        .textContent =
        firstLetter;


    /* Переходим в приложение */

    showScreen(
        "mainScreen"
    );


    fixViewport();

}


/* =====================================================
   CHECK CURRENT ACCOUNT
===================================================== */

function checkAccount() {

    const current =
        localStorage.getItem(
            CURRENT_KEY
        );


    /* Нет авторизации */

    if (!current) {

        showScreen(
            "welcomeScreen"
        );

        return;

    }


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                String(item.id) ===
                String(current)
        );


    /* Пользователь удалён */

    if (!user) {

        localStorage.removeItem(
            CURRENT_KEY
        );


        showScreen(
            "welcomeScreen"
        );

        return;

    }


    openMain(
        user
    );

}


/* =====================================================
   PROFILE OPEN
===================================================== */

$("profileButton").addEventListener(
    "click",
    () => {

        $("profile")
            .classList
            .add("open");

    }
);


/* =====================================================
   PROFILE CLOSE
===================================================== */

$("profile").addEventListener(
    "click",
    event => {

        if (
            event.target ===
            $("profile")
        ) {

            closeProfile();

        }

    }
);


function closeProfile() {

    $("profile")
        .classList
        .remove("open");

}


/* =====================================================
   PROFILE SETTINGS
===================================================== */

$("profileSettings").addEventListener(
    "click",
    () => {

        alert(
            "Настройки профиля появятся в следующем обновлении AVION."
        );

    }
);


/* =====================================================
   LOGOUT
===================================================== */

$("logoutButton").addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            CURRENT_KEY
        );


        closeProfile();


        /* Очищаем форму входа */

        $("loginPhone").value =
            "";

        $("loginPassword").value =
            "";


        showError(
            "loginError",
            ""
        );


        showScreen(
            "welcomeScreen"
        );

    }
);


/* =====================================================
   BOTTOM NAVIGATION
===================================================== */

document
    .querySelectorAll(
        ".nav-button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const tab =
                    button.dataset.tab;


                /*
                   Сбрасываем активную кнопку.
                */

                document
                    .querySelectorAll(
                        ".nav-button"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                /* Чаты */

                if (
                    tab === "chats"
                ) {

                    return;

                }


                /* Контакты */

                if (
                    tab === "contacts"
                ) {

                    alert(
                        "Контакты будут добавлены следующим обновлением AVION."
                    );

                    return;

                }


                /* Настройки */

                if (
                    tab === "settings"
                ) {

                    $("profile")
                        .classList
                        .add("open");

                }

            }
        );

    });


/* =====================================================
   SEARCH
===================================================== */

$("chatSearch").addEventListener(
    "input",
    () => {

        const query =
            $("chatSearch")
                .value
                .trim()
                .toLowerCase();


        const chats =
            document.querySelectorAll(
                ".chat-item"
            );


        chats.forEach(chat => {

            const name =
                chat
                    .querySelector(
                        ".chat-name"
                    )
                    ?.textContent
                    .toLowerCase()
                    || "";


            const message =
                chat
                    .querySelector(
                        ".chat-message"
                    )
                    ?.textContent
                    .toLowerCase()
                    || "";


            const found =
                !query ||
                name.includes(query) ||
                message.includes(query);


            chat.style.display =
                found
                    ? "flex"
                    : "none";

        });

    }
);


/* =====================================================
   SEARCH BUTTON
===================================================== */

$("searchButton").addEventListener(
    "click",
    () => {

        const input =
            $("chatSearch");


        input.focus();


        /*
           На телефоне клавиатура
           открывается после focus.
        */

        setTimeout(
            () => {

                input.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            },
            150
        );

    }
);


/* =====================================================
   NEW CHAT
===================================================== */

$("newChatButton").addEventListener(
    "click",
    () => {

        alert(
            "Создание реального чата подключим после добавления сервера."
        );

    }
);


/* =====================================================
   CHAT CLICK
===================================================== */

document
    .querySelectorAll(
        ".chat-item"
    )
    .forEach(chat => {

        chat.addEventListener(
            "click",
            () => {

                const name =
                    chat
                        .querySelector(
                            ".chat-name"
                        )
                        ?.textContent
                        || "Чат";


                alert(
                    "Чат «" +
                    name +
                    "» будет доступен после подключения сообщений."
                );

            }
        );

    });


/* =====================================================
   ENTER — LOGIN
===================================================== */

$("loginPhone").addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            $("loginPassword")
                .focus();

        }

    }
);


$("loginPassword").addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            loginUser();

        }

    }
);


/* =====================================================
   ENTER — REGISTER
===================================================== */

$("registerName").addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            $("registerPhone")
                .focus();

        }

    }
);


$("registerPhone").addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            $("registerPassword")
                .focus();

        }

    }
);


$("registerPassword").addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            registerUser();

        }

    }
);


/* =====================================================
   PHONE INPUT
===================================================== */

function setupPhoneInput(id) {

    const input =
        $(id);


    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            let digits =
                normalizePhone(
                    input.value
                );


            /*
               Российский номер:
               8XXXXXXXXXX
               превращаем визуально
               в +7XXXXXXXXXX
            */

            if (
                digits.length === 11 &&
                digits.startsWith("8")
            ) {

                digits =
                    "7" +
                    digits.slice(1);

            }


            if (
                digits.length > 11
            ) {

                digits =
                    digits.slice(0, 11);

            }


            if (
                digits.length === 0
            ) {

                input.value =
                    "";

                return;

            }


            if (
                digits.startsWith("7")
            ) {

                let result =
                    "+7";


                if (
                    digits.length > 1
                ) {

                    result +=
                        " " +
                        digits.slice(
                            1,
                            4
                        );

                }


                if (
                    digits.length > 4
                ) {

                    result +=
                        " " +
                        digits.slice(
                            4,
                            7
                        );

                }


                if (
                    digits.length > 7
                ) {

                    result +=
                        "-" +
                        digits.slice(
                            7,
                            9
                        );

                }


                if (
                    digits.length > 9
                ) {

                    result +=
                        "-" +
                        digits.slice(
                            9,
                            11
                        );

                }


                input.value =
                    result;

            } else {

                input.value =
                    "+" + digits;

            }

        }
    );

}


setupPhoneInput(
    "loginPhone"
);


setupPhoneInput(
    "registerPhone"
);


/* =====================================================
   CLOSE PROFILE WITH ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeProfile();

        }

    }
);


/* =====================================================
   PWA SERVICE WORKER
===================================================== */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "./sw.js?v=40"
                )
                .then(
                    registration => {

                        console.log(
                            "AVION Service Worker:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.log(
                            "AVION SW:",
                            error
                        );

                    }
                );

        }
    );

}


/* =====================================================
   FINAL VIEWPORT FIX
===================================================== */

fixViewport();


console.log(
    "AVION Messenger " +
    VERSION +
    " запущен."
);