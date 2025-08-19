// Authentication functionality
class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('restaurant_current_user') || 'null');
    this.initializeEventListeners();
    this.checkAuthStatus();
  }

  initializeEventListeners() {
    // Panel switching
    document.getElementById('toSignUp')?.addEventListener('click', () => {
      document.getElementById('container').classList.add('right-panel-active');
      this.clearErrors();
    });

    document.getElementById('toSignIn')?.addEventListener('click', () => {
      document.getElementById('container').classList.remove('right-panel-active');
      this.clearErrors();
    });

    // Form submissions
    document.getElementById('signupForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });

    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Real-time validation
    document.getElementById('confirmPassword')?.addEventListener('input', () => {
      this.validatePasswordMatch();
    });

    document.getElementById('signupPassword')?.addEventListener('input', () => {
      this.validatePasswordMatch();
    });
  }

  checkAuthStatus() {
    if (this.currentUser) {
      // User is already logged in, redirect to booking page
      window.location.href = '/booking.html';
    }
  }

  validatePasswordMatch() {
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const errorDiv = document.getElementById('signupError');

    if (confirmPassword && password !== confirmPassword) {
      this.showError('signupError', 'Passwords do not match');
      return false;
    } else if (confirmPassword) {
      this.clearError('signupError');
    }
    return true;
  }

  validateForm(formType) {
    const errors = [];

    if (formType === 'signup') {
      const name = document.getElementById('signupName').value.trim();
      const phone = document.getElementById('signupPhone').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (!name || name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      }

      if (!phone || !/^\+?[\d\s-()]{10,}$/.test(phone)) {
        errors.push('Please enter a valid phone number');
      }

      if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }

      if (password !== confirmPassword) {
        errors.push('Passwords do not match');
      }

      // Check if phone already exists
      if (this.users.find(user => user.phone === phone)) {
        errors.push('Phone number already registered');
      }

    } else if (formType === 'login') {
      const phone = document.getElementById('loginPhone').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!phone) {
        errors.push('Phone number is required');
      }

      if (!password) {
        errors.push('Password is required');
      }
    }

    return errors;
  }

  handleSignup() {
    const errors = this.validateForm('signup');
    
    if (errors.length > 0) {
      this.showError('signupError', errors[0]);
      return;
    }

    const name = document.getElementById('signupName').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      phone,
      password, // In a real app, this would be hashed
      createdAt: new Date().toISOString(),
      bookings: []
    };

    this.users.push(newUser);
    localStorage.setItem('restaurant_users', JSON.stringify(this.users));

    // Auto login after signup
    this.loginUser(newUser);
  }

  handleLogin() {
    const errors = this.validateForm('login');
    
    if (errors.length > 0) {
      this.showError('loginError', errors[0]);
      return;
    }

    const phone = document.getElementById('loginPhone').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Find user
    const user = this.users.find(u => u.phone === phone && u.password === password);

    if (!user) {
      this.showError('loginError', 'Invalid phone number or password');
      return;
    }

    this.loginUser(user);
  }

  loginUser(user) {
    // Store current user (excluding password for security)
    const userSession = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt
    };

    localStorage.setItem('restaurant_current_user', JSON.stringify(userSession));
    this.currentUser = userSession;

    // Show success animation
    this.showSuccessMessage('Welcome back! Redirecting to booking page...');

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = '/booking.html';
    }, 1500);
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.color = '#dc3545';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }

  clearErrors() {
    this.clearError('signupError');
    this.clearError('loginError');
  }

  showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      padding: 1rem 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
      z-index: 10000;
      font-weight: 600;
      animation: slideInRight 0.3s ease;
    `;
    successDiv.textContent = message;

    // Add animation keyframes
    if (!document.querySelector('#success-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'success-animation-styles';
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(successDiv);

    // Remove after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});