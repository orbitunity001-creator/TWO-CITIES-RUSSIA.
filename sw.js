/* =========================================================
   AVION MESSENGER
   Полный локальный JavaScript
   ========================================================= */

"use strict";

const STORAGE_KEY = "avion_messenger_v1";

const defaultState = {
    profile: {
        name: "Пользователь",
        username: "@avion_user",
        bio: "Я использую AVION"
    },

    chats: [
        {
            id: 1,
            name: "AVION",
            username: "@avion",
            avatar: "A",
            online: true,
            messages: [
                {
                    id: 1,
                    text: "Добро пожаловать в AVION 👋",
                    mine: false,
                    time: getTime()
                },
                {
                    id: 2,
                    text: "Это локальная версия мессенджера.",
                    mine: false,
                    time: getTime()
                }
            ]
        }
    ],

    currentChat: 1,
    theme: "dark"
};


/* =========================================================
   HELPERS
   ========================================================= */

function getTime() {
    const now = new Date();

    return now.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


function createId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}


function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultState);
        }

        return {
            ...structuredClone(defaultState),
            ...JSON.parse(saved)
        };

    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return structuredClone(defaultState);
    }
}


function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );
}


/* =========================================================
   STATE
   ========================================================= */

let state = loadState();


/* =========================================================
   DOM
   ========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    renderProfile();
    renderChats();
    renderCurrentChat();
    setupEvents();
    setupPWA();

});


/* =========================================================
   PROFILE
   ========================================================= */

function renderProfile() {

    const nameElements = $$(".profile-name");

    nameElements.forEach(element => {
        element.textContent = state.profile.name;
    });

    const usernameElements = $$(".profile-username");

    usernameElements.forEach(element => {
        element.textContent = state.profile.username;
    });

    const bioElements = $$(".profile-bio");

    bioElements.forEach(element => {
        element.textContent = state.profile.bio;
    });
}


function openProfile() {

    const modal = $("#profileModal");

    if (!modal) return;

    const name = $("#profileName");
    const username = $("#profileUsername");
    const bio = $("#profileBio");

    if (name) {
        name.value = state.profile.name;
    }

    if (username) {
        username.value = state.profile.username;
    }

    if (bio) {
        bio.value = state.profile.bio;
    }

    modal.classList.add("active");
}


function closeProfile() {

    const modal = $("#profileModal");

    if (modal) {
        modal.classList.remove("active");
    }
}


function saveProfile() {

    const name = $("#profileName");
    const username = $("#profileUsername");
    const bio = $("#profileBio");

    if (name && name.value.trim()) {
        state.profile.name = name.value.trim();
    }

    if (username && username.value.trim()) {

        let usernameValue = username.value.trim();

        if (!usernameValue.startsWith("@")) {
            usernameValue = "@" + usernameValue;
        }

        state.profile.username = usernameValue;
    }

    if (bio) {
        state.profile.bio = bio.value.trim();
    }

    saveState();
    renderProfile();
    closeProfile();

    showToast("Профиль сохранён");
}


/* =========================================================
   CHAT LIST
   ========================================================= */

function renderChats(filter = "") {

    const container = $("#chatList");

    if (!container) return;

    const search = filter.toLowerCase().trim();

    container.innerHTML = "";

    const chats = state.chats.filter(chat => {

        return (
            chat.name.toLowerCase().includes(search) ||
            chat.username.toLowerCase().includes(search)
        );

    });

    if (chats.length === 0) {

        container.innerHTML = `
            <div class="empty-chats">
                <div class="empty-icon">⌕</div>
                <div>Ничего не найдено</div>
            </div>
        `;

        return;
    }


    chats.forEach(chat => {

        const lastMessage =
            chat.messages[chat.messages.length - 1];

        const item = document.createElement("button");

        item.className = "chat-item";

        if (chat.id === state.currentChat) {
            item.classList.add("active");
        }

        item.dataset.chatId = chat.id;

        item.innerHTML = `
            <div class="chat-avatar">
                ${escapeHTML(chat.avatar)}
            </div>

            <div class="chat-info">

                <div class="chat-top">

                    <strong>
                        ${escapeHTML(chat.name)}
                    </strong>

                    <span>
                        ${lastMessage ? lastMessage.time : ""}
                    </span>

                </div>

                <div class="chat-bottom">

                    <span>
                        ${
                            lastMessage
                                ? escapeHTML(lastMessage.text)
                                : "Нет сообщений"
                        }
                    </span>

                </div>

            </div>
        `;

        item.addEventListener("click", () => {

            openChat(chat.id);

        });

        container.appendChild(item);

    });
}


/* =========================================================
   OPEN CHAT
   ========================================================= */

function openChat(id) {

    state.currentChat = Number(id);

    saveState();

    renderChats();
    renderCurrentChat();

    document.body.classList.add("chat-open");

}


/* =========================================================
   CURRENT CHAT
   ========================================================= */

function renderCurrentChat() {

    const chat = state.chats.find(
        item => item.id === state.currentChat
    );

    if (!chat) return;


    const title = $("#chatTitle");

    if (title) {
        title.textContent = chat.name;
    }


    const username = $("#chatUsername");

    if (username) {
        username.textContent =
            chat.online
                ? "в сети"
                : chat.username;
    }


    const avatar = $("#chatAvatar");

    if (avatar) {
        avatar.textContent = chat.avatar;
    }


    const messages = $("#messages");

    if (!messages) return;

    messages.innerHTML = "";


    chat.messages.forEach(message => {

        const bubble = document.createElement("div");

        bubble.className = "message";

        if (message.mine) {
            bubble.classList.add("mine");
        }

        bubble.innerHTML = `

            <div class="message-text">
                ${escapeHTML(message.text)}
            </div>

            <div class="message-time">
                ${message.time}
            </div>

        `;

        messages.appendChild(bubble);

    });


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

    const input = $("#messageInput");

    if (!input) return;

    const text = input.value.trim();

    if (!text) return;


    const chat = state.chats.find(
        item => item.id === state.currentChat
    );

    if (!chat) return;


    chat.messages.push({

        id: createId(),

        text: text,

        mine: true,

        time: getTime()

    });


    input.value = "";

    saveState();

    renderCurrentChat();
    renderChats();


    /*
       Маленький локальный автоответ
       Только для демонстрации.
    */

    if (chat.id === 1) {

        setTimeout(() => {

            chat.messages.push({

                id: createId(),

                text: getAutoReply(text),

                mine: false,

                time: getTime()

            });

            saveState();

            renderCurrentChat();
            renderChats();

        }, 900);

    }

}


/* =========================================================
   AUTO REPLY
   ========================================================= */

function getAutoReply(text) {

    const lower = text.toLowerCase();

    if (
        lower.includes("привет") ||
        lower.includes("здарова") ||
        lower.includes("хай")
    ) {
        return "Привет! 👋";
    }

    if (
        lower.includes("как дела")
    ) {
        return "Всё отлично 😎";
    }

    if (
        lower.includes("спасибо")
    ) {
        return "Пожалуйста ❤️";
    }

    return "Сообщение получено ✓";

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const input = $("#searchInput");

    if (!input) return;

    input.addEventListener("input", () => {

        renderChats(input.value);

    });

}


/* =========================================================
   EMOJI
   ========================================================= */

const emojis = [
    "😀",
    "😂",
    "😍",
    "🥰",
    "😎",
    "🤔",
    "😢",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "✨",
    "🎉",
    "🚀",
    "🐦"
];


function openEmojiPicker() {

    let picker = $("#emojiPicker");

    if (!picker) {

        picker = document.createElement("div");

        picker.id = "emojiPicker";

        picker.className = "emoji-picker";

        document.body.appendChild(picker);

    }


    picker.innerHTML = "";


    emojis.forEach(emoji => {

        const button =
            document.createElement("button");

        button.textContent = emoji;

        button.addEventListener("click", () => {

            const input =
                $("#messageInput");

            if (input) {

                input.value += emoji;

                input.focus();

            }

            picker.classList.remove("active");

        });

        picker.appendChild(button);

    });


    picker.classList.toggle("active");

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function closeChat() {

    document.body.classList.remove("chat-open");

}


/* =========================================================
   NEW CHAT
   ========================================================= */

function createChat() {

    const name =
        prompt("Имя нового контакта:");

    if (!name || !name.trim()) {
        return;
    }


    const cleanName = name.trim();


    const chat = {

        id: createId(),

        name: cleanName,

        username:
            "@" +
            cleanName
                .toLowerCase()
                .replace(/\s+/g, "_"),

        avatar:
            cleanName
                .charAt(0)
                .toUpperCase(),

        online: false,

        messages: []

    };


    state.chats.unshift(chat);

    state.currentChat = chat.id;

    saveState();

    renderChats();
    renderCurrentChat();

    document.body.classList.add("chat-open");

}


/* =========================================================
   DELETE CURRENT CHAT
   ========================================================= */

function deleteCurrentChat() {

    const chat =
        state.chats.find(
            item => item.id === state.currentChat
        );

    if (!chat) return;


    const confirmed =
        confirm(
            `Удалить чат «${chat.name}»?`
        );

    if (!confirmed) return;


    state.chats =
        state.chats.filter(
            item => item.id !== chat.id
        );


    if (state.chats.length > 0) {

        state.currentChat =
            state.chats[0].id;

    } else {

        state.currentChat = null;

    }


    saveState();

    renderChats();

    if (state.currentChat) {
        renderCurrentChat();
    }

    closeChat();

}


/* =========================================================
   SETTINGS
   ========================================================= */

function toggleTheme() {

    if (state.theme === "dark") {

        state.theme = "light";

    } else {

        state.theme = "dark";

    }


    applyTheme();

    saveState();

}


function applyTheme() {

    document.documentElement.dataset.theme =
        state.theme;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(text) {

    let toast = $("#avionToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "avionToast";

        toast.className = "avion-toast";

        document.body.appendChild(toast);

    }


    toast.textContent = text;

    toast.classList.add("active");


    clearTimeout(
        window.avionToastTimer
    );


    window.avionToastTimer =
        setTimeout(() => {

            toast.classList.remove("active");

        }, 2200);

}


/* =========================================================
   EVENTS
   ========================================================= */

function setupEvents() {

    setupSearch();

    applyTheme();


    const sendButton =
        $("#sendButton");

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


    const input =
        $("#messageInput");

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    const emojiButton =
        $("#emojiButton");

    if (emojiButton) {

        emojiButton.addEventListener(
            "click",
            openEmojiPicker
        );

    }


    const newChat =
        $("#newChat");

    if (newChat) {

        newChat.addEventListener(
            "click",
            createChat
        );

    }


    const profileButton =
        $("#profileButton");

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            openProfile
        );

    }


    const closeProfileButton =
        $("#closeProfile");

    if (closeProfileButton) {

        closeProfileButton.addEventListener(
            "click",
            closeProfile
        );

    }


    const saveProfileButton =
        $("#saveProfile");

    if (saveProfileButton) {

        saveProfileButton.addEventListener(
            "click",
            saveProfile
        );

    }


    const backButton =
        $("#backButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            closeChat
        );

    }


    const deleteButton =
        $("#deleteChat");

    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            deleteCurrentChat
        );

    }


    const themeButton =
        $("#themeButton");

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            toggleTheme
        );

    }


    document.addEventListener(
        "click",
        event => {

            const picker =
                $("#emojiPicker");

            const button =
                $("#emojiButton");

            if (
                picker &&
                picker.classList.contains("active") &&
                !picker.contains(event.target) &&
                event.target !== button
            ) {

                picker.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   PWA
   ========================================================= */

function setupPWA() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register("./sw.js")
                    .then(() => {

                        console.log(
                            "AVION Service Worker OK"
                        );

                    })
                    .catch(error => {

                        console.error(
                            "Service Worker error:",
                            error
                        );

                    });

            }
        );

    }

}