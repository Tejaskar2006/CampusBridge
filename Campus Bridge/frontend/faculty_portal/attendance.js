document.addEventListener('DOMContentLoaded', () => {
    const attendanceForm = document.getElementById('attendanceForm');
    const studentListContainer = document.getElementById('studentList');
    const dateInput = document.getElementById('attendanceDate');
    const recordsContainer = document.getElementById('attendanceRecords');
    const facultyData = JSON.parse(localStorage.getItem('facultyData'));

    // Load students for the department and section
    async function loadStudents() {
        try {
            const response = await fetch(`http://localhost:3000/api/attendance/students/${facultyData.department}/${facultyData.section}`);
            const students = await response.json();
            
            studentListContainer.innerHTML = `
                <div class="student-list-header">
                    <span>Roll No</span>
                    <span>Name</span>
                    <span>Status</span>
                </div>
                ${students.map(student => `
                    <div class="student-row" data-student-id="${student._id}">
                        <span>${student.rollNo}</span>
                        <span>${student.name}</span>
                        <div class="attendance-buttons">
                            <button type="button" class="btn-present" onclick="markAttendance(this, '${student._id}', 'present')">Present</button>
                            <button type="button" class="btn-absent" onclick="markAttendance(this, '${student._id}', 'absent')">Absent</button>
                        </div>
                    </div>
                `).join('')}
            `;
        } catch (error) {
            console.error('Error loading students:', error);
            showAlert('Error loading students', 'error');
        }
    }

    // Submit attendance
    attendanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = dateInput.value;
        const attendanceData = [];

        document.querySelectorAll('.student-row').forEach(row => {
            const studentId = row.dataset.studentId;
            const status = row.querySelector('.selected')?.dataset.status || 'absent';
            attendanceData.push({ studentId, status });
        });

        try {
            const response = await fetch('http://localhost:3000/api/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    date,
                    department: facultyData.department,
                    section: facultyData.section,
                    attendanceData
                })
            });

            if (response.ok) {
                showAlert('Attendance marked successfully', 'success');
                loadAttendanceRecords(date);
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            showAlert('Error marking attendance', 'error');
        }
    });

    // Load attendance records
    async function loadAttendanceRecords(date) {
        try {
            const response = await fetch(`http://localhost:3000/api/attendance/records/${facultyData.department}/${facultyData.section}/${date}`);
            const records = await response.json();

            recordsContainer.innerHTML = `
                <h3>Attendance Records - ${new Date(date).toLocaleDateString()}</h3>
                <div class="records-table">
                    <div class="table-header">
                        <span>Name</span>
                        <span>Status</span>
                        <span>Time</span>
                    </div>
                    ${records.map(record => `
                        <div class="record-row ${record.status}">
                            <span>${record.studentId.name}</span>
                            <span>${record.status}</span>
                            <span>${new Date(record.createdAt).toLocaleTimeString()}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Error loading records:', error);
            showAlert('Error loading attendance records', 'error');
        }
    }

    // Initialize date input and load students
    dateInput.valueAsDate = new Date();
    loadStudents();
});

function markAttendance(button, studentId, status) {
    const row = button.closest('.student-row');
    row.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}