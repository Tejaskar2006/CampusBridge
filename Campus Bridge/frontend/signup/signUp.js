function handleRoleChange() {
    const role = document.getElementById('role').value;
    const studentFields = document.getElementById('studentFields');
    const facultyFields = document.getElementById('facultyFields');

    if (role === 'student') {
        studentFields.style.display = 'block';
        facultyFields.style.display = 'none';
    } else if (role === 'faculty') {
        studentFields.style.display = 'none';
        facultyFields.style.display = 'block';
    } else {
        studentFields.style.display = 'none';
        facultyFields.style.display = 'none';
    }
}

document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const department = document.getElementById('department').value;

    let formData;
    let endpoint;

    if (role === 'faculty') {
        formData = {
            email,
            password,
            name,
            department,
            subjects: document.getElementById('subjects').value.split(',').map(s => s.trim()),
            sections: document.getElementById('sections').value.split(',').map(s => s.trim())
        };
        endpoint = 'http://localhost:3000/api/faculty/signup';
    } else {
        formData = {
            email,
            password,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            college: department,
            branch: department,
            section: document.getElementById('section').value,
            role: 'student'
        };
        endpoint = 'http://localhost:3000/api/signup';
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
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
            showError(data.message || 'Signup failed');
        }
    } catch (error) {
        showError('Server error. Please try again later.');
        console.error('Signup error:', error);
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

    const form = document.getElementById('signupForm');
    form.insertAdjacentElement('afterend', errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}