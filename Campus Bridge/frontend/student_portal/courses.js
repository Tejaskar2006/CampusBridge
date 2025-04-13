document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
        window.location.href = '../login/login.html';
        return;
    }

    // Load content based on student's department and section
    loadCourseContent();

    // Setup filters
    document.getElementById('contentTypeFilter').addEventListener('change', loadCourseContent);
    document.getElementById('subjectFilter').addEventListener('change', loadCourseContent);
});

async function loadCourseContent() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const contentGrid = document.getElementById('courseContent');
    const contentType = document.getElementById('contentTypeFilter').value;
    const subject = document.getElementById('subjectFilter').value;

    try {
        const response = await fetch('http://localhost:3000/api/student/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                department: userData.department,
                section: userData.section,
                contentType: contentType === 'all' ? null : contentType,
                subject: subject === 'all' ? null : subject
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch content');
        }

        const data = await response.json();

        // Populate subject filter if empty
        const subjectFilter = document.getElementById('subjectFilter');
        if (subjectFilter.options.length === 1) {
            const subjects = [...new Set(data.content.map(item => item.subject))];
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectFilter.appendChild(option);
            });
        }

        // Display content
        contentGrid.innerHTML = data.content.length > 0 ? data.content.map(item => `
            <div class="content-card ${item.contentType}">
                <div class="content-header">
                    <span class="badge ${item.contentType}">${item.contentType}</span>
                    <span class="date">${new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <h3>${item.title}</h3>
                <p class="subject">${item.subject}</p>
                <p class="description">${item.description}</p>
                ${item.fileUrl ? `
                    <div class="content-attachment">
                        <a href="${item.fileUrl}" target="_blank">
                            <i class="fas fa-download"></i> Download Material
                        </a>
                    </div>
                ` : ''}
                <div class="faculty-info">
                    <i class="fas fa-user-tie"></i> Posted by: ${item.facultyName}
                </div>
            </div>
        `).join('') : '<p class="no-content">No content available for your department and section</p>';

    } catch (error) {
        console.error('Error:', error);
        contentGrid.innerHTML = '<p class="error-message">Error loading course content</p>';
    }
}