// Demo credentials (in production, this would be validated server-side)
const validCredentials = {
    'agent@disruptguard.ai': 'password123',
    'admin@chainpulse.ai': 'admin123',
    'demo@chainpulse.ai': 'demo123'
};

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Clear previous messages
    clearMessages();
    
    // Validate credentials (demo purposes)
    if (validCredentials[email] && validCredentials[email] === password) {
        // Show success message
        showSuccessMessage('Login successful! Redirecting to dashboard...');
        
        // Store login info if remember is checked
        if (remember) {
            localStorage.setItem('chainpulse_email', email);
            localStorage.setItem('chainpulse_remember', 'true');
        }
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showErrorMessage('Invalid email or password. Try demo@chainpulse.ai / demo123');
    }
}

// Handle OAuth login
function handleOAuth(provider) {
    showSuccessMessage(`Redirecting to ${provider.toUpperCase()} authentication...`);
    
    setTimeout(() => {
        if (provider === 'google') {
            alert('Google OAuth would redirect to: https://accounts.google.com/...');
        } else if (provider === 'github') {
            alert('GitHub OAuth would redirect to: https://github.com/login/...');
        }
        // In production, this would redirect to OAuth provider
    }, 500);
}

// Handle request access
function handleRequestAccess() {
    document.getElementById('requestAccessModal').style.display = 'block';
}

function closeRequestAccessModal() {
    document.getElementById('requestAccessModal').style.display = 'none';
}

function handleAccessRequest(event) {
    event.preventDefault();
    
    const name = document.getElementById('reqName').value;
    const email = document.getElementById('reqEmail').value;
    const company = document.getElementById('reqCompany').value;
    
    // In production, this would send to a backend
    console.log('Access request submitted:', { name, email, company });
    
    alert(`Thank you, ${name}! Your access request has been submitted. We'll review it and get back to you at ${email} within 24 hours.`);
    
    closeRequestAccessModal();
    document.querySelector('form').reset();
}

// Handle forgot password
document.querySelectorAll('a[href="#forgot-password"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('forgotPasswordModal').style.display = 'block';
    });
});

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
}

function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    
    // In production, this would send reset link to email
    console.log('Password reset requested for:', email);
    
    alert(`A password reset link has been sent to ${email}. Please check your inbox.`);
    
    closeForgotPasswordModal();
    document.querySelector('#forgotPasswordModal form').reset();
}

// Handle run orchestrator
function handleRunOrchestrator() {
    alert('Launching ChainPulse Orchestrator...\n\nThis would connect to your Python backend and execute the orchestrator system.');
}

// Show/hide error message
function showErrorMessage(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    errorDiv.style.display = 'flex';
}

function showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i><span>${message}</span>`;
    successDiv.style.display = 'flex';
}

function clearMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const requestModal = document.getElementById('requestAccessModal');
    const forgotModal = document.getElementById('forgotPasswordModal');
    
    if (event.target === requestModal) {
        requestModal.style.display = 'none';
    }
    if (event.target === forgotModal) {
        forgotModal.style.display = 'none';
    }
};

// Auto-fill demo credentials on page load (for demo purposes)
document.addEventListener('DOMContentLoaded', () => {
    // Check if email was remembered
    const rememberedEmail = localStorage.getItem('chainpulse_email');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC closes modals
        if (e.key === 'Escape') {
            document.getElementById('requestAccessModal').style.display = 'none';
            document.getElementById('forgotPasswordModal').style.display = 'none';
        }
        
        // ENTER submits form if email/password focused
        if (e.key === 'Enter' && (document.activeElement.id === 'email' || document.activeElement.id === 'password')) {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') !== '#request-access' && 
            this.getAttribute('href') !== '#forgot-password') {
            e.preventDefault();
            // Scroll behavior handled
        }
    });
});

console.log('ChainPulse AI Login System Loaded');
console.log('Demo Credentials: agent@disruptguard.ai / password123');
console.log('Demo Credentials: demo@chainpulse.ai / demo123');
