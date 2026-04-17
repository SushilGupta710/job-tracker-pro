// Login handler
const loginBtnEl = document.getElementById('jt-login-btn');
const googleBtnEl = document.getElementById('jt-google-btn');
const emailEl = document.getElementById('jt-email');
const passwordEl = document.getElementById('jt-password');
const openDashboardBtnEl = document.getElementById('jt-open-dashboard');
const logoutBtnEl = document.getElementById('jt-logout-btn');

if (loginBtnEl) {
    loginBtnEl.addEventListener('click', handleLogin);
}
if (googleBtnEl) {
    googleBtnEl.addEventListener('click', handleGoogleLogin);
}
if (emailEl) {
    emailEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}
if (passwordEl) {
    passwordEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}
if (openDashboardBtnEl) {
    openDashboardBtnEl.addEventListener('click', () => {
        if (chrome?.tabs?.create) {
            chrome.tabs.create({ url: 'http://localhost:4200/dashboard' });
        }
    });
}
if (logoutBtnEl) {
    logoutBtnEl.addEventListener('click', () => {
        chrome.storage.local.remove(['token', 'user', 'loginTime'], () => {
            propagateLogoutToApp();
            showLoginSection();
        });
    });
}

if (chrome?.storage?.onChanged?.addListener) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;
        const tokenChanged = Boolean(changes.token);
        if (tokenChanged) {
            chrome.storage.local.get(['user', 'token'], (res) => {
                if (res.token && res.user) {
                    showUserSection(res.user);
                } else {
                    showLoginSection();
                }
            });
        }
    });
}

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

    fetch('https://smart-job-tracker-api-w44d.onrender.com/api/auth/signin', {
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
                propagateLoginToApp(data.session.access_token, data.user, data.session.expires_in);
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

function handleGoogleLogin() {
    const statusDiv = document.getElementById('jt-login-status');
    const loginBtn = document.getElementById('jt-login-btn');
    const googleBtn = document.getElementById('jt-google-btn');

    if (!statusDiv || !loginBtn || !googleBtn) {
        return;
    }

    showStatus(statusDiv, 'Starting Google login...', 'loading');
    loginBtn.disabled = true;
    googleBtn.disabled = true;

    if (!chrome?.tabs?.create) {
        showStatus(statusDiv, 'Google login is unavailable in this browser context.', 'error');
        loginBtn.disabled = false;
        googleBtn.disabled = false;
        return;
    }

    fetch('https://smart-job-tracker-api-w44d.onrender.com/api/auth/google')
    .then(res => res.json())
    .then(data => {
        if (data.url) {
            showStatus(statusDiv, 'Opening Google sign-in in a new tab...', 'loading');
            chrome.tabs.create({ url: data.url });
            setTimeout(() => {
                showStatus(statusDiv, 'After login, return here or open the web app to sync your session.', 'warning');
                loginBtn.disabled = false;
                googleBtn.disabled = false;
            }, 500);
        } else {
            showStatus(statusDiv, 'Could not start Google sign-in. Please try again.', 'error');
            loginBtn.disabled = false;
            googleBtn.disabled = false;
        }
    })
    .catch(err => {
        showStatus(statusDiv, 'Google sign-in error: ' + err.message, 'error');
        loginBtn.disabled = false;
        googleBtn.disabled = false;
    });
}

function attemptSyncFromWebApp() {
    if (!chrome?.tabs?.query) {
        return;
    }

    chrome.tabs.query({ url: ['http://localhost:4200/*'] }, (tabs) => {
        if (!tabs || !tabs.length) {
            return;
        }

        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { action: 'syncAuthFromApp' }, (response) => {
                if (response?.synced) {
                    chrome.storage.local.get(['user'], (res) => {
                        if (res.user) {
                            showUserSection(res.user);
                        }
                    });
                }
            });
        });
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
        propagateLogoutToApp();
        showLoginSection();
    });
});

function propagateLoginToApp(token, user, expiresIn) {
    if (!chrome?.tabs?.query) {
        return;
    }
    chrome.tabs.query({ url: ['http://localhost:4200/*'] }, (tabs) => {
        if (!tabs || !tabs.length) {
            return;
        }
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, {
                action: 'loginFromExtension',
                token,
                user,
                expires_in: expiresIn,
            });
        });
    });
}

function propagateLogoutToApp() {
    if (!chrome?.tabs?.query) {
        return;
    }
    chrome.tabs.query({ url: ['http://localhost:4200/*'] }, (tabs) => {
        if (!tabs || !tabs.length) {
            return;
        }
        tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { action: 'logoutFromExtension' });
        });
    });
}

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
        attemptSyncFromWebApp();
    }
});