let ws;
let chatWith = '';

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
                window.location.href = '/users_page';
            }
        });
}

function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const usersDiv = document.getElementById('users');
            usersDiv.innerHTML = '<h3>Users</h3>';
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
    window.location.href = '/chat';
}

function connectWebSocket(username) {
    ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        if (msg.username === chatWith || msg.username === username) {
            const messages = document.getElementById('messages');
            messages.innerHTML += `<div><strong>${msg.username}:</strong> ${msg.message}</div>`;
            messages.scrollTop = messages.scrollHeight;
        }
    };

    ws.onopen = function () {
        ws.send(JSON.stringify({ username, message: `has joined the chat with ${chatWith}` }));
    };
}

function sendMessage() {
    const message = document.getElementById('message').value;
    const username = document.getElementById('username').value;
    ws.send(JSON.stringify({ username, message }));
    document.getElementById('message').value = '';
}

window.onload = function () {
    const path = window.location.pathname;
    if (path === '/users_page') {
        loadUsers();
    } else if (path === '/chat') {
        const username = document.getElementById('username').value;
        document.getElementById('chat-with').textContent = chatWith;
        connectWebSocket(username);
    }
};