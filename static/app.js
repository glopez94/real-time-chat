let ws;

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
                window.location.href = '/chat';
                connectWebSocket(username);
            }
        });
}

function connectWebSocket(username) {
    ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onmessage = function (event) {
        const msg = JSON.parse(event.data);
        const messages = document.getElementById('messages');
        messages.innerHTML += `<div><strong>${msg.username}:</strong> ${msg.message}</div>`;
        messages.scrollTop = messages.scrollHeight;
    };

    ws.onopen = function () {
        ws.send(JSON.stringify({ username, message: 'has joined the chat' }));
    };
}

function sendMessage() {
    const message = document.getElementById('message').value;
    const username = document.getElementById('username').value;
    ws.send(JSON.stringify({ username, message }));
    document.getElementById('message').value = '';
}

function loadUsers() {
    fetch('/api/users')
        .then(response => response.json())
        .then(users => {
            const usersDiv = document.getElementById('users');
            usersDiv.innerHTML = '<h3>Online Users</h3>';
            users.forEach(user => {
                usersDiv.innerHTML += `<div>${user.username} (${user.online ? 'Online' : 'Offline'})</div>`;
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