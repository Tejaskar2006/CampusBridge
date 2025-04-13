document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        let endpoint = '';
        if (role === 'faculty') {
            endpoint = 'http://localhost:3000/api/faculty/login';
        } else {
            endpoint = 'http://localhost:3000/api/login';
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (role === 'faculty') {
                localStorage.setItem('facultyData', JSON.stringify(data.faculty));
                window.location.href = '../faculty_portal/dashboard.html';
            } else {
                localStorage.setItem('userData', JSON.stringify(data.user));
                window.location.href = '../student_portal/dashboard.html';
            }
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        showError('Server error. Please try again later.');
        console.error('Login error:', error);
    }
});

function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const form = document.getElementById('loginForm');
    form.insertAdjacentElement('afterend', errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}