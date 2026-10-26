const API_BASE_URL = 'http://localhost:5000/api';


function showMessage(message, type) {
    const msgDiv = document.getElementById('authMessage');
    msgDiv.innerText = message;
    msgDiv.className = `alert alert-${type}`; 
    
    msgDiv.classList.remove('d-none');
    
   
    setTimeout(() => {
        msgDiv.classList.add('d-none');
    }, 3000);
}


document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault(); 

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
      
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            window.location.href = 'courses.html';
        } else {
            showMessage(data.message, 'danger');
        }
    } catch (error) {
        showMessage('Network error, please try again later.', 'danger');
        console.error(error);
    }
});


document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Account created successfully! You can now login.', 'success');
            document.getElementById('registerForm').reset();
        } else {
            showMessage(data.message, 'danger');
        }
    } catch (error) {
        showMessage('Network error, please try again later.', 'danger');
        console.error(error);
    }
});