document.addEventListener('DOMContentLoaded', () => {
    const facultyData = JSON.parse(localStorage.getItem('facultyData'));
    if (!facultyData) {
        window.location.href = '../login/login.html';
        return;
    }

    // Update profile information
    updateProfileInfo(facultyData);

    // Populate subject and section dropdowns
    const subjectSelect = document.getElementById('subject');
    const sectionSelect = document.getElementById('section');

    facultyData.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });

    facultyData.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });

    // Handle form submission
    document.getElementById('contentForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('subject', document.getElementById('subject').value);
        formData.append('section', document.getElementById('section').value);
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('contentType', document.getElementById('contentType').value);
        formData.append('department', facultyData.department);
        formData.append('facultyEmail', facultyData.email);

        const fileInput = document.getElementById('file');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            const response = await fetch('http://localhost:3000/api/faculty/content/add', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                alert('Content added successfully!');
                loadContent();
                e.target.reset();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Error adding content: ' + error.message);
        }
    });

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('facultyData');
        window.location.href = '../login/login.html';
    });

    // Load existing content
    loadContent();
});

function updateProfileInfo(facultyData) {
    const profileImage = document.getElementById('profileImage');
    const facultyName = document.getElementById('facultyName');
    const facultyDepartment = document.getElementById('facultyDepartment');

    // Set the first letter of the email as profile image
    if (facultyData.email) {
        profileImage.textContent = facultyData.email.charAt(0).toUpperCase();
        profileImage.className = 'profile-letter';
    }

    // Update name and department
    facultyName.textContent = facultyData.email || 'Faculty Email';
    facultyDepartment.textContent = facultyData.department || 'Department';
}

async function loadContent() {
    const facultyData = JSON.parse(localStorage.getItem('facultyData'));
    const contentItems = document.getElementById('contentItems');

    try {
        const response = await fetch(`http://localhost:3000/api/faculty/content/${facultyData.email}`);
        const data = await response.json();

        contentItems.innerHTML = data.content.map(item => `
            <div class="content-item">
                <div class="content-header">
                    <h3>${item.title}</h3>
                    <span class="badge ${item.contentType}">${item.contentType}</span>
                </div>
                <p><strong>Subject:</strong> ${item.subject}</p>
                <p><strong>Section:</strong> ${item.section}</p>
                <p>${item.description}</p>
                ${item.fileUrl ? `
                    <div class="content-attachment">
                        <a href="${item.fileUrl}" target="_blank">
                            <i class="fas fa-paperclip"></i> View Attachment
                        </a>
                    </div>
                ` : ''}
                <div class="content-actions">
                    <button onclick="deleteContent('${item._id}')" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        contentItems.innerHTML = '<p>Error loading content</p>';
    }
}

async function deleteContent(contentId) {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/faculty/content/${contentId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadContent();
        } else {
            throw new Error('Failed to delete content');
        }
    } catch (error) {
        alert('Error deleting content: ' + error.message);
    }
}