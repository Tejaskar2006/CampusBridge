document.addEventListener('DOMContentLoaded', () => {
    // Check if faculty is logged in
    const facultyData = JSON.parse(localStorage.getItem('facultyData'));
    if (!facultyData) {
        window.location.href = '../login/login.html';
        return;
    }

    // Generate and set profile image
    const profileImage = document.getElementById('profileImage');
    if (profileImage) {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        // Create circular background
        ctx.fillStyle = '#1a73e8';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2);
        ctx.fill();
        
        // Add text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const firstLetter = facultyData.name ? facultyData.name.charAt(0).toUpperCase() : 'U';
        ctx.fillText(firstLetter, 50, 50);
        
        // Set the canvas as profile image
        profileImage.src = canvas.toDataURL();
    }

    // Update profile information
    document.getElementById('facultyName').textContent = facultyData.name;
    document.getElementById('facultyDepartment').textContent = facultyData.department;

    // Load dashboard statistics
    loadDashboardStats();
    
    // Load sections
    loadSections(facultyData.sections, facultyData.subjects);
    
    // Load recent activities
    loadRecentActivities();

    // Setup logout handler
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
});

// ... rest of the code remains unchanged ...

async function loadDashboardStats() {
    try {
        // In real application, these would be fetched from the server
        document.getElementById('totalStudents').textContent = '150';
        document.getElementById('totalCourses').textContent = '4';
        document.getElementById('todayClasses').textContent = '3';
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function loadSections(sections, subjects) {
    const sectionsContainer = document.getElementById('sectionsContainer');
    sections.forEach(section => {
        const sectionCard = document.createElement('div');
        sectionCard.className = 'section-card';
        sectionCard.innerHTML = `
            <h3>Section ${section}</h3>
            <div class="section-subjects">
                ${subjects.map(subject => `
                    <div class="subject-item">
                        <h4>${subject}</h4>
                        <div class="subject-actions">
                            <button onclick="navigateToContent('${section}', '${subject}')">
                                <i class="fas fa-book"></i> Content
                            </button>
                            <button onclick="navigateToAttendance('${section}', '${subject}')">
                                <i class="fas fa-clipboard-list"></i> Attendance
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        sectionsContainer.appendChild(sectionCard);
    });
}

function loadRecentActivities() {
    const activitiesList = document.getElementById('activitiesList');
    const recentActivities = [
        {
            action: 'Added new assignment',
            subject: 'Database Management',
            time: '2 hours ago'
        },
        {
            action: 'Updated attendance',
            subject: 'Web Development',
            time: '3 hours ago'
        },
        {
            action: 'Posted new course material',
            subject: 'Data Structures',
            time: '5 hours ago'
        }
    ];

    activitiesList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <p><strong>${activity.action}</strong> - ${activity.subject}</p>
            <small>${activity.time}</small>
        </div>
    `).join('');
}

function navigateToContent(section, subject) {
    localStorage.setItem('currentSection', section);
    localStorage.setItem('currentSubject', subject);
    window.location.href = 'coursecontent.html';
}

function navigateToAttendance(section, subject) {
    localStorage.setItem('currentSection', section);
    localStorage.setItem('currentSubject', subject);
    window.location.href = 'attendance.html';
}

function handleLogout() {
    localStorage.removeItem('facultyData');
    window.location.href = '../login/login.html';
}

// Add event listener for search functionality
document.querySelector('.search-bar input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const sections = document.querySelectorAll('.section-card');
    
    sections.forEach(section => {
        const sectionText = section.textContent.toLowerCase();
        section.style.display = sectionText.includes(searchTerm) ? 'block' : 'none';
    });
});