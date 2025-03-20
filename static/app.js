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
                window.location.href = '/';
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
                document.getElementById('login').style.display = 'none';
                document.getElementById('chat').style.display = 'block';
                connectWebSocket(username);
                loadUsers();
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
                usersDiv.innerHTML += `<div>${user.username}</div>`;
            });
        });
}