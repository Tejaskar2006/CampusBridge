document.addEventListener('DOMContentLoaded', () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    async function loadAttendanceData() {
        try {
            const response = await fetch(`http://localhost:3000/api/attendance/stats/${userData.department}/${userData.section}/${userData._id}`);
            const stats = await response.json();
            
            // Calculate total and percentage
            const totalPresent = stats.find(s => s._id === 'present')?.count || 0;
            const totalAbsent = stats.find(s => s._id === 'absent')?.count || 0;
            const totalClasses = totalPresent + totalAbsent;
            const attendancePercentage = totalClasses ? ((totalPresent / totalClasses) * 100).toFixed(1) : 0;

            // Update summary cards
            document.getElementById('overallPercentage').textContent = `${attendancePercentage}%`;
            document.getElementById('totalClasses').textContent = totalClasses;

            // Create bar chart
            const ctx = document.getElementById('attendanceChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Present', 'Absent'],
                    datasets: [{
                        label: 'Attendance Count',
                        data: [totalPresent, totalAbsent],
                        backgroundColor: [
                            '#4caf50',
                            '#f44336'
                        ],
                        borderColor: [
                            '#43a047',
                            '#e53935'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Attendance Overview',
                            font: {
                                size: 16
                            }
                        }
                    }
                }
            });

            // Load attendance history
            const historyResponse = await fetch(`http://localhost:3000/api/attendance/records/${userData.department}/${userData.section}/${userData._id}`);
            const history = await historyResponse.json();

            const historyList = document.getElementById('attendanceHistory');
            historyList.innerHTML = history.map(record => `
                <div class="history-item">
                    <span class="history-date">${new Date(record.date).toLocaleDateString()}</span>
                    <span class="history-status status-${record.status}">${record.status}</span>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error loading attendance data:', error);
        }
    }

    loadAttendanceData();
});