let isSignup = false;
let token = localStorage.getItem('token');
let userEmail = localStorage.getItem('userEmail');

// DOM elements
const authBtn = document.getElementById('authBtn');
const userStatus = document.getElementById('userStatus');
const popup = document.getElementById('authPopup');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const switchLink = document.getElementById('switchLink');
const authSwitch = document.getElementById('authSwitch');
const authMessage = document.getElementById('authMessage');
const closeBtn = document.querySelector('.close');

// Initialize
updateUserStatus();

// Update user status display
function updateUserStatus() {
    const favBtn = document.getElementById('favoritesBtn');
    
    if (token && userEmail) {
        userStatus.innerHTML = `
            <span class="user-email">Welcome, ${userEmail}</span>
            <button id="authBtn">Logout</button>
        `;
        favBtn.classList.remove('hidden');
        document.getElementById('authBtn').addEventListener('click', handleAuthClick);
    } else {
        userStatus.innerHTML = `<button id="authBtn">Login</button>`;
        favBtn.classList.add('hidden');
        document.getElementById('authBtn').addEventListener('click', handleAuthClick);
    }
}

// Handle auth button click
function handleAuthClick() {
    if (token) {
        logout();
    } else {
        showMessage('', 'clear'); // Clear any previous messages
        popup.classList.remove('hidden');
    }
}

// Show message in popup
function showMessage(message, type = 'error') {
    if (type === 'clear') {
        authMessage.classList.add('hidden');
        authMessage.className = 'message hidden';
        return;
    }
    
    authMessage.textContent = message;
    authMessage.className = `message ${type}`;
    authMessage.classList.remove('hidden');
}

// Close popup
closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.add('hidden');
});

// Switch between login/signup using event delegation
authSwitch.addEventListener('click', (e) => {
    if (e.target.id === 'switchLink') {
        e.preventDefault();
        isSignup = !isSignup;
        authTitle.textContent = isSignup ? 'Sign Up' : 'Login';
        authSubmit.textContent = isSignup ? 'Sign Up' : 'Login';
        authSwitch.innerHTML = isSignup 
            ? 'Have an account? <a href="#" id="switchLink">Login</a>'
            : 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
    }
});

// Handle auth form
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    authSubmit.textContent = 'Loading...';
    authSubmit.disabled = true;
    showMessage('', 'clear');
    
    try {
        const endpoint = isSignup ? '/auth/signup' : '/auth/login';
        const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        let data = {};
        try { data = await res.json(); } catch {}
        
        if (res.ok) {
            if (isSignup) {
                showMessage('Account created successfully! You can now log in.', 'success');
                setTimeout(() => {
                    isSignup = false;
                    authTitle.textContent = 'Login';
                    authSubmit.textContent = 'Login';
                    authSwitch.innerHTML = 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
                    showMessage('', 'clear');
                }, 2000);
            } else if (data.token) {
                token = data.token;
                userEmail = email;
                localStorage.setItem('token', token);
                localStorage.setItem('userEmail', userEmail);
                
                showMessage('Successfully logged in!', 'success');
                setTimeout(() => {
                    window.location.reload(); // Refresh the page
                }, 1000);
            }
        } else {
            const message = res.status === 401 ? 'Incorrect email or password' 
                          : res.status === 400 ? (data.error || 'Invalid input. Please check your details.')
                          : (data.error || 'Something went wrong. Please try again.');
            showMessage(message, 'error');
        }
    } catch (error) {
        showMessage('Something went wrong. Please try again.', 'error');
    }
    
    authSubmit.textContent = isSignup ? 'Sign Up' : 'Login';
    authSubmit.disabled = false;
});

// Logout
function logout() {
    token = null;
    userEmail = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    updateUserStatus();
}
