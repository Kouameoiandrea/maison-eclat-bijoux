// Authentication logic
let currentUser = null;

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error, #e74c3c)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    field.parentNode.appendChild(errorDiv);
    field.focus();
}

function clearFieldErrors(form) {
    const errors = form.querySelectorAll('.field-error');
    errors.forEach(error => error.remove());
}

function clearFieldErrorOnInput() {
    const inputs = document.querySelectorAll('#auth-modal input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            const error = input.parentNode.querySelector('.field-error');
            if (error) {
                error.remove();
                input.style.borderColor = '';
                input.style.backgroundColor = '';
            }
        });
    });
}

function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Remove active class from all tabs and content
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Update modal title
            const title = document.getElementById('auth-title');
            if (tabName === 'login') {
                title.textContent = t('authSignIn');
            } else {
                title.textContent = t('authRegister');
            }
        });
    });
}

function setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;
    clearFieldErrors(form);

    const formData = new FormData(form);
    const email = formData.get('email').trim();
    const password = formData.get('password');

    // Validation côté client
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('login-email', 'Adresse email invalide.');
        return;
    }

    if (!password) {
        showFieldError('login-password', 'Mot de passe requis.');
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    const previousText = button.textContent;

    try {
        button.disabled = true;
        button.textContent = 'Connexion...';

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || t('authLoginError'));
        }
        
        // Store user data and token
        currentUser = result.user;
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        form.reset();
        closeAuthModal();
        updateAuthUI();
        showNotification(t('authSuccess'));
    } catch (error) {
        showNotification(error.message || t('authLoginError'));
    } finally {
        button.disabled = false;
        button.textContent = previousText;
    }
}

async function handleRegister(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const previousText = button.textContent;

    const formData = new FormData(form);
    const fullname = formData.get('fullname').trim();
    const email = formData.get('email').trim();
    const phone = formData.get('phone').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validation côté client
    if (!fullname || fullname.length < 2) {
        showFieldError('register-fullname', 'Le nom doit contenir au moins 2 caractères.');
        return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('register-email', 'Adresse email invalide.');
        return;
    }

    if (!phone || !/^[\+]?[0-9\s\-\(\)]{8,}$/.test(phone)) {
        showFieldError('register-phone', 'Numéro de téléphone invalide.');
        return;
    }

    if (!password || password.length < 6) {
        showFieldError('register-password', 'Le mot de passe doit contenir au moins 6 caractères.');
        return;
    }

    if (password !== confirmPassword) {
        showFieldError('register-confirm-password', 'Les mots de passe ne correspondent pas.');
        return;
    }

    try {
        button.disabled = true;
        button.textContent = 'Inscription...';

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullname, email, phone, password })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || t('authRegisterError'));
        }
        
        // Store user data and token
        currentUser = result.user;
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        
        form.reset();
        closeAuthModal();
        updateAuthUI();
        showNotification(t('authSuccess'));
    } catch (error) {
        showNotification(error.message || t('authRegisterError'));
    } finally {
        button.disabled = false;
        button.textContent = previousText;
    }
}

function updateAuthUI() {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;
    
    const token = localStorage.getItem('authToken');
    const user = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (token && user) {
        // User is logged in
        authLink.innerHTML = `
            <span>${user.fullname?.split(' ')[0] || 'Utilisateur'}</span>
            <strong>${t('authLogout')}</strong>
        `;
        authLink.setAttribute('aria-label', t('authLogout'));
    } else {
        // User is not logged in
        authLink.innerHTML = `
            <span>${t('hello')}</span>
            <strong>${t('signIn')}</strong>
        `;
        authLink.setAttribute('aria-label', t('authSignIn'));
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showNotification(t('authLogout'));
}

function setupAuthLinks() {
    const authLink = document.getElementById('auth-link');
    const closeAuthBtn = document.querySelector('.close-auth');
    const authModal = document.getElementById('auth-modal');
    
    if (authLink) {
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');
            const user = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');

            if (token && user) {
                logoutUser();
                return;
            }

            openAuthModal();
        });
    }
    
    if (closeAuthBtn) {
        closeAuthBtn.addEventListener('click', closeAuthModal);
    }
    
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') {
                closeAuthModal();
            }
        });
    }
}

function initAuth() {
    // Load current user from storage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    setupAuthLinks();
    setupAuthTabs();
    setupAuthForms();
    clearFieldErrorOnInput();
    updateAuthUI();
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
