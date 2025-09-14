let isSignup = false;
let token = localStorage.getItem('token');

// DOM elements
const authBtn = document.getElementById('authBtn');
const popup = document.getElementById('authPopup');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const switchLink = document.getElementById('switchLink');
const authSwitch = document.getElementById('authSwitch');
const closeBtn = document.querySelector('.close');

// Initialize
if (token) {
    authBtn.textContent = 'Logout';
}

// Show popup
authBtn.addEventListener('click', () => {
    if (token) {
        logout();
    } else {
        popup.classList.remove('hidden');
    }
});

// Close popup
closeBtn.addEventListener('click', () => popup.classList.add('hidden'));
popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.classList.add('hidden');
});

// Switch between login/signup
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignup = !isSignup;
    authTitle.textContent = isSignup ? 'Sign Up' : 'Login';
    authSubmit.textContent = isSignup ? 'Sign Up' : 'Login';
    authSwitch.innerHTML = isSignup 
        ? 'Have an account? <a href="#" id="switchLink">Login</a>'
        : 'Don\'t have an account? <a href="#" id="switchLink">Sign up</a>';
    document.getElementById('switchLink').addEventListener('click', arguments.callee);
});

// Handle auth form
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    authSubmit.textContent = 'Loading...';
    authSubmit.disabled = true;
    
    try {
        const endpoint = isSignup ? '/auth/signup' : '/auth/login';
        const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            if (data.token) {
                token = data.token;
                localStorage.setItem('token', token);
                authBtn.textContent = 'Logout';
            }
            popup.classList.add('hidden');
            authForm.reset();
        } else {
            alert('Error: ' + (data.error || 'Authentication failed'));
        }
    } catch (error) {
        alert('Network error');
    }
    
    authSubmit.textContent = isSignup ? 'Sign Up' : 'Login';
    authSubmit.disabled = false;
});

// Logout
function logout() {
    token = null;
    localStorage.removeItem('token');
    authBtn.textContent = 'Login';
}
