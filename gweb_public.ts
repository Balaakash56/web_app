const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

let authToken = '';

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.text();
    alert(data);
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        authToken = data.token;
        alert('Login successful');
        fetchFiles();
    } else {
        const error = await response.text();
        alert(error);
    }
});

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/upload', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        body: formData
    });

    if (response.ok) {
        const data = await response.json();
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = data.url;
        a.textContent = data.filename;
        a.target = "_blank";
        li.appendChild(a);
        fileList.appendChild(li);
    } else {
        const error = await response.text();
        alert(error);
    }
});

async function fetchFiles() {
    const response = await fetch('/files', {
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });

    if (response.ok) {
        const files = await response.json();
        fileList.innerHTML = '';
        files.forEach(file => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = file.url;
            a.textContent = file.filename;
            a.target = "_blank";
            li.appendChild(a);
            fileList.appendChild(li);
        });
    } else {
        const error = await response.text();
        alert(error);
    }
}
