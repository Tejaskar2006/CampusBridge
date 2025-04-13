document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
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
        const firstLetter = userData.email.charAt(0).toUpperCase();
        ctx.fillText(firstLetter, 50, 50);
        
        // Set the canvas as profile image
        profileImage.src = canvas.toDataURL();
    }

    // Update user info
    document.getElementById('studentName').textContent = userData.email.split('@')[0];
    document.getElementById('studentEmail').textContent = userData.email;
    document.getElementById('college').textContent = userData.college;
    document.getElementById('branch').textContent = userData.branch;
    document.getElementById('section').textContent = userData.section;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    });

    // Initialize Monaco Editor
    let editor;
    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '// Write your code here\n',
            language: 'javascript',
            theme: 'vs-dark',
            minimap: { enabled: false },
            automaticLayout: true,
            fontSize: 14,
            scrollBeyondLastLine: false
        });

        // Load saved code if exists
        const savedCode = localStorage.getItem('savedCode');
        if (savedCode) {
            editor.setValue(savedCode);
        }

        // Handle language change
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            monaco.editor.setModelLanguage(editor.getModel(), e.target.value);
        });
    });

    // Run Code Handler
    document.getElementById('runCode').addEventListener('click', async () => {
        const output = document.getElementById('output');
        output.innerHTML = 'Running...';

        try {
            const code = editor.getValue();
            const language = document.getElementById('languageSelect').value;

            const response = await fetch('http://localhost:3000/api/compile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language })
            });

            const data = await response.json();
            output.innerHTML = data.success ? 
                `<pre class="success">${data.output}</pre>` : 
                `<pre class="error">${data.error}</pre>`;
        } catch (error) {
            output.innerHTML = `<pre class="error">Error: Failed to execute code</pre>`;
        }
    });

    // Save Code Handler
    document.getElementById('saveCode').addEventListener('click', () => {
        const code = editor.getValue();
        localStorage.setItem('savedCode', code);
        alert('Code saved successfully!');
    });

    // Clear Output Handler
    document.getElementById('clearOutput').addEventListener('click', () => {
        document.getElementById('output').innerHTML = '';
    });

    // Dashboard cards data
    document.getElementById('upcomingClasses').innerHTML = `
        <ul>
            <li>Mathematics - 10:00 AM</li>
            <li>Physics - 11:30 AM</li>
            <li>Computer Science - 2:00 PM</li>
        </ul>
    `;

    document.getElementById('pendingAssignments').innerHTML = `
        <ul>
            <li>Mathematics Assignment #3</li>
            <li>Physics Lab Report</li>
            <li>Programming Project</li>
        </ul>
    `;

    document.getElementById('attendanceOverview').innerHTML = `
        <div>Overall Attendance: 85%</div>
        <div>This Month: 90%</div>
    `;

    document.getElementById('recentGrades').innerHTML = `
        <ul>
            <li>Mathematics Quiz: 92%</li>
            <li>Physics Mid-term: 88%</li>
            <li>Programming Assignment: 95%</li>
        </ul>
    `;

    // Handle window resize for editor
    window.addEventListener('resize', () => {
        if (editor) {
            editor.layout();
        }
    });

    // ChatGPT Integration
    const chatbotContainer = document.getElementById('chatbotContainer');
    const toggleChatbot = document.getElementById('toggleChatbot');
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');

    // Initialize conversation history
    let conversationHistory = [];

    toggleChatbot.addEventListener('click', () => {
        chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'flex' : 'none';
        toggleChatbot.style.display = chatbotContainer.style.display === 'flex' ? 'none' : 'block';
    });

    document.getElementById('minimizeChatbot').addEventListener('click', () => {
        chatbotContainer.style.display = 'none';
        toggleChatbot.style.display = 'block';
    });

    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Add to conversation history
        conversationHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content
        });
    }

    async function sendToChatGPT(message) {
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    studentId: userData.id,
                    context: {
                        college: userData.college,
                        branch: userData.branch,
                        section: userData.section
                    },
                    history: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error:', error);
            return 'Sorry, I encountered an error. Please try again.';
        }
    }

    sendMessage.addEventListener('click', async () => {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        userInput.style.height = 'auto';

        // Show typing indicator
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            dot.style.animationDelay = `${i * 0.2}s`;
            typingDiv.appendChild(dot);
        }
        chatHistory.appendChild(typingDiv);

        const response = await sendToChatGPT(message);
        chatHistory.removeChild(typingDiv);
        addMessage(response);
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage.click();
        }
    });

    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    // Initial greeting
    addMessage("Hello! I'm your AI assistant. How can I help you with your studies today?");

    // Clear chat history when user logs out
    document.getElementById('logoutBtn').addEventListener('click', () => {
        conversationHistory = [];
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    });
});