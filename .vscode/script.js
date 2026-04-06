/* filepath: c:\Users\AbA\Desktop\Java script\ak\script.js */

// ===== LOCAL STORAGE MANAGEMENT =====
// Store users and tasks in localStorage for this project

// Initialize storage if empty
function initializeStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

initializeStorage();

// ===== LOGIN PAGE FUNCTIONS =====

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current logged-in user
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password!');
    }
}

// ===== SIGNUP PAGE FUNCTIONS =====

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    // Validate password length
    if (password.length < 4) {
        alert('Password must be at least 4 characters!');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users'));
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        alert('Username already exists!');
        return;
    }
    
    // Add new user
    const newUser = {
        id: Date.now(),
        username: username,
        password: password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Account created successfully! Now login.');
    window.location.href = 'index.html';
}

// ===== LOGOUT FUNCTION =====

// Clear current user and redirect to login
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
        window.location.href = 'index.html';
    }
}

// ===== DASHBOARD PAGE FUNCTIONS =====

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in (only on dashboard.html)
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Set user profile name
        document.getElementById('userProfile').textContent = '👤 ' + currentUser.username;
        
        // Load tasks from API
        loadTasksFromAPI();
    }
});

// ===== API CALL: GET - Load tasks from JSONPlaceholder API =====
// This function demonstrates GET request using Fetch API
async function loadTasksFromAPI() {
    try {
        // Fetch todos from public API
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
        const apiTasks = await response.json();
        
        // Convert API data to our local task format
       const englishTasks = [
    "Complete assignment",
    "Attend online class",
    "Practice coding",
    "Read programming notes",
    "Prepare for exam"
];

const tasks = apiTasks.map((task, index) => ({
    id: task.id,
    title: englishTasks[index] || task.title,
    completed: task.completed,
    source: 'api'
}));
        
        // Merge with local tasks
        const localTasks = JSON.parse(localStorage.getItem('tasks'));
        const allTasks = [...tasks, ...localTasks];
        
        // Store merged tasks
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        
        // Display all tasks
        displayTasks();
        updateStatistics();
    } catch (error) {
        console.error('Error loading tasks from API:', error);
        // If API fails, just display local tasks
        displayTasks();
        updateStatistics();
    }
}

// ===== API CALL: POST - Add new task =====
// This function demonstrates POST request using Fetch API
async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskTitle = taskInput.value.trim();
    
    if (!taskTitle) {
        alert('Please enter a task!');
        return;
    }
    
    try {
        // POST request to create a task on the API
        const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST', // POST method for creating new resource
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: taskTitle,
                completed: false,
                userId: 1
            })
        });
        
        const apiTask = await response.json();
        
        // Create local task object
        const newTask = {
            id: apiTask.id || Date.now(),
            title: taskTitle,
            completed: false,
            source: 'local'
        };
        
        // Add to localStorage
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Clear input and refresh display
        taskInput.value = '';
        displayTasks();
        updateStatistics();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task!');
    }
}

// ===== API CALL: PUT - Update task completion status =====
// This function demonstrates PUT request using Fetch API
async function toggleTaskCompletion(taskId) {
    try {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        // Toggle completion
        task.completed = !task.completed;
        
        // PUT request to update task on the API
        await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
            method: 'PUT', // PUT method for updating existing resource
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: taskId,
                title: task.title,
                completed: task.completed,
                userId: 1
            })
        });
        
        // Update in localStorage
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Refresh display
        displayTasks();
        updateStatistics();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// ===== API CALL: DELETE - Delete task =====
// This function demonstrates DELETE request using Fetch API
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        // DELETE request to remove task from the API
        await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
            method: 'DELETE' // DELETE method for removing resource
        });
        
        // Remove from localStorage
        let tasks = JSON.parse(localStorage.getItem('tasks'));
        tasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Refresh display
        displayTasks();
        updateStatistics();
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task!');
    }
}

// ===== EDIT TASK FUNCTION =====
// Edit task title
async function editTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const newTitle = prompt('Edit task:', task.title);
    
    if (newTitle === null || newTitle.trim() === '') {
        return;
    }
    
    task.title = newTitle.trim();
    
    try {
        // PUT request to update task title
        await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: taskId,
                title: task.title,
                completed: task.completed,
                userId: 1
            })
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    } catch (error) {
        console.error('Error editing task:', error);
    }
}

// ===== DISPLAY TASKS =====
// Render all tasks to the UI
function displayTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one to get started!</p></div>';
        return;
    }
    
    // Generate HTML for each task
    taskList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTaskCompletion(${task.id})"
            >
            <span class="task-text">${escapeHtml(task.title)}</span>
            <div class="task-actions">
                <button class="btn-edit" onclick="editTask(${task.id})">Edit</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ===== UPDATE STATISTICS =====
// Calculate and update dashboard statistics
function updateStatistics() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Update statistics cards
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
}

// ===== UTILITY FUNCTION: Escape HTML =====
// Prevent XSS attacks by escaping HTML characters
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ===== ALLOW ADDING TASK WITH ENTER KEY =====
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    if (taskInput) {
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
});