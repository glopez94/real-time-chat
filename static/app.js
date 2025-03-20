let ws;
let chatWith = '';
let chatID = '';

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Registration successful! You can now login.');
                window.location.href = '/login';
            }
        });
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                document.cookie = `username=${username}; path=/`;
                window.location.href = '/users_page';
            }
        });
}

function logout() {
    fetch('/logout')
        .then(() => {
            window.location.href = '/login';
        });
}

function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const usersDiv = document.getElementById('users');
            usersDiv.innerHTML = '<h3>Usuarios en línea</h3>';
            users.forEach(user => {
                usersDiv.innerHTML += `<div onclick="startChat('${user.username}')">${user.username} (${user.online ? 'Online' : 'Offline'})</div>`;
            });
        });
}

function searchUsers() {
    const search = document.getElementById('search').value.toLowerCase();
    const usersDiv = document.getElementById('users');
    const users = usersDiv.getElementsByTagName('div');
    for (let i = 0; i < users.length; i++) {
        const username = users[i].textContent.toLowerCase();
        if (username.includes(search)) {
            users[i].style.display = '';
        } else {
            users[i].style.display = 'none';
        }
    }
}

function startChat(username) {
    chatWith = username;
    window.location.href = `/chat?user=${username}`;
}

function connectWebSocket(username) {
    ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);

        if (msg.type === "users_update") {
            updateUsersList(msg.users);
        } else {
            const messages = document.getElementById("messages");
            const messageClass = msg.username === username ? "sent" : "received";
            messages.innerHTML += `<div class="message ${messageClass}"><strong>${msg.username}:</strong> ${msg.message}</div>`;
            messages.scrollTop = messages.scrollHeight;
        }
    };

    ws.onopen = function () {
        ws.send(JSON.stringify({ username, recipient: self.chatWith, message: `${username} has joined the chat with ${chatWith}.` }));
    };

    ws.onclose = function () {
        ws.send(JSON.stringify({ username, recipient: chatWith, message: `${username} has left the chat with ${chatWith}.` }));
    };
}

function sendMessage() {
    const message = document.getElementById('message').value;
    const username = getCookie('username');
    ws.send(JSON.stringify({ username, recipient: chatWith, message, chat_id: chatID }));
    document.getElementById('message').value = '';
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function updateUsersList(users) {
    const usersDiv = document.getElementById("users");
    usersDiv.innerHTML = "<h3>Usuarios en línea</h3>";

    users.forEach((user) => {
        // usersDiv.innerHTML += `<div onclick="startChat('${user}')">${user} (Online)</div>`;
        usersDiv.innerHTML += `<div onclick="startChat('${user.username}')">${user.username} (${user.online ? 'Online' : 'Offline'})</div>`;
    });
}

window.onload = function () {
    const path = window.location.pathname;
    if (path === '/users_page') {
        loadUsers();
        const username = getCookie('username');
        connectWebSocket(username);
    } else if (path === '/chat') {
        const urlParams = new URLSearchParams(window.location.search);
        chatWith = urlParams.get('user');
        document.getElementById('chat-with').textContent = chatWith;
        const username = getCookie('username');
        connectWebSocket(username);

        fetch(`/api/chat?user=${chatWith}`)
            .then(response => response.json())
            .then(chat => {
                chatID = chat.chat.ID;
                const messages = document.getElementById('messages');
                chat.chat.Messages.forEach(msg => {
                    const messageClass = msg.username === username ? 'sent' : 'received';
                    messages.innerHTML += `<div class="message ${messageClass}"><strong>${msg.username}:</strong> ${msg.message}</div>`;
                });
                messages.scrollTop = messages.scrollHeight;
            });
    }
};