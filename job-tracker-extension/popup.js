// Login handler
document.getElementById('jt-login-btn').addEventListener('click', handleLogin);
document.getElementById('jt-email').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});
document.getElementById('jt-password').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

function handleLogin() {
    const email = document.getElementById('jt-email').value.trim();
    const password = document.getElementById('jt-password').value;
    const statusDiv = document.getElementById('jt-login-status');
    const loginBtn = document.getElementById('jt-login-btn');

    if (!email || !password) {
        showStatus(statusDiv, 'Please enter email and password', 'error');
        return;
    }

    showStatus(statusDiv, 'Signing in...', 'loading');
    loginBtn.disabled = true;
    loginBtn.innerText = 'Signing in...';

    fetch('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.session && data.session.access_token) {
            chrome.storage.local.set({
                token: data.session.access_token,
                user: data.user,
                loginTime: new Date().toISOString()
            }, () => {
                showStatus(statusDiv, 'Login successful!', 'success');
                setTimeout(() => {
                    showUserSection(data.user);
                }, 500);
            });
        } else {
            showStatus(statusDiv, data.error || 'Login failed. Please try again.', 'error');
            loginBtn.disabled = false;
            loginBtn.innerText = 'Sign In';
        }
    })
    .catch(err => {
        showStatus(statusDiv, 'Server connection error: ' + err.message, 'error');
        loginBtn.disabled = false;
        loginBtn.innerText = 'Sign In';
    });
}

function showStatus(element, message, type) {
    element.textContent = message;
    element.className = `jt-status ${type}`;
    element.style.display = 'block';
}

function showUserSection(user) {
    document.getElementById('jt-login-form').style.display = 'none';
    document.getElementById('jt-user-info').style.display = 'block';

    // Set user info
    const firstName = user?.first_name || user?.name || 'User';
    const lastName = user?.last_name || '';
    const email = user?.email || '';
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();

    document.getElementById('jt-user-name').textContent = `${firstName} ${lastName}`;
    document.getElementById('jt-user-email').textContent = email;
    document.getElementById('jt-user-avatar').textContent = initials || '👤';
}

function showLoginSection() {
    document.getElementById('jt-login-form').style.display = 'block';
    document.getElementById('jt-user-info').style.display = 'none';
    document.getElementById('jt-email').value = '';
    document.getElementById('jt-password').value = '';
    document.getElementById('jt-login-status').style.display = 'none';
}

// Logout handler
document.getElementById('jt-logout-btn').addEventListener('click', () => {
    chrome.storage.local.remove(['token', 'user', 'loginTime'], () => {
        showLoginSection();
    });
});

// Dashboard button handler
document.getElementById('jt-open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:4200/dashboard' });
});

// Check if already logged in when opening popup
chrome.storage.local.get(['user', 'token'], (res) => {
    if (res.token && res.user) {
        showUserSection(res.user);
    } else {
        showLoginSection();
    }
});