// Dynamic API base URL resolver
const getBackendUrl = () => {
  // If running from local file system or standard local dev servers, target local backend port 5000
  if (
    window.location.protocol === 'file:' ||
    window.location.port === '3000' ||
    window.location.port === '8000'
  ) {
    return 'http://127.0.0.1:5000';
  }
  // In production (EKS Ingress) or Minikube Ingress (running on port 80), query relative host
  return '';
};

const API_BASE = getBackendUrl();
console.log('API Base URL resolved to:', API_BASE || '(relative host)');

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const statusApi = document.getElementById('status-api');
const statusDb = document.getElementById('status-db');
const userForm = document.getElementById('user-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const usersList = document.getElementById('users-list');
const refreshBtn = document.getElementById('refresh-btn');
const toastContainer = document.getElementById('toast-container');

// State
let isSubmitting = false;

/* ==========================================================================
   Theme Management
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
  // Initialize Lucide icons
  lucide.createIcons();
}

themeToggle.addEventListener('click', () => {
  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  }
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Icon based on type
  const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  lucide.createIcons({ attrs: { class: 'toast-icon' } });

  // Remove toast after 4 seconds
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

/* ==========================================================================
   Health Monitor (GET /api/health)
   ========================================================================== */
async function checkHealth() {
  const updateBadge = (el, status, details = '') => {
    const badge = el.querySelector('.status-badge');
    badge.className = 'status-badge'; // Reset
    
    if (status === 'UP') {
      badge.classList.add('healthy');
      badge.textContent = 'Healthy';
    } else {
      badge.classList.add('unhealthy');
      badge.textContent = details || 'Unhealthy';
    }
  };

  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok && res.status !== 503) {
      throw new Error('API server returned error');
    }
    
    const data = await res.json();
    
    // API status
    if (data.services && data.services.api) {
      updateBadge(statusApi, data.services.api.status);
    } else {
      updateBadge(statusApi, 'UP');
    }
    
    // DB status
    if (data.services && data.services.database) {
      updateBadge(statusDb, data.services.database.status, data.services.database.details);
    } else {
      updateBadge(statusDb, 'DOWN', 'unknown');
    }
  } catch (err) {
    console.error('Health check failed:', err);
    updateBadge(statusApi, 'DOWN', 'Offline');
    updateBadge(statusDb, 'DOWN', 'Offline');
  }
}

/* ==========================================================================
   Fetch and Render Users (GET /api/users)
   ========================================================================== */
async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    
    const data = await res.json();
    renderUsers(data.data || []);
  } catch (err) {
    console.error('Fetch users failed:', err);
    usersList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="alert-triangle" style="color: var(--error)"></i>
        <p>Could not connect to the API server to load users.</p>
      </div>
    `;
    lucide.createIcons();
  }
}

function renderUsers(users) {
  if (users.length === 0) {
    usersList.innerHTML = `
      <div class="empty-state">
        <i data-lucide="users"></i>
        <p>No registered users found. Be the first to join!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  usersList.innerHTML = users.map((user, idx) => {
    // Initial name letter
    const initial = user.name ? user.name.charAt(0) : '?';
    // Format Date
    const date = new Date(user.createdAt);
    const formattedDate = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Stagger animation delays for sleek rendering
    const delay = Math.min(idx * 0.05, 0.4);

    return `
      <div class="user-card" style="animation-delay: ${delay}s">
        <div class="user-avatar">${initial}</div>
        <div class="user-details">
          <div class="user-name">${escapeHTML(user.name)}</div>
          <div class="user-email">${escapeHTML(user.email)}</div>
        </div>
        <div class="user-meta">
          <div class="user-date">${formattedDate}</div>
        </div>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   Submit Handler (POST /api/users)
   ========================================================================== */
userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  const name = usernameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) return;

  setSubmitting(true);

  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to register user');
    }

    showToast('User registered successfully!', 'success');
    userForm.reset();
    
    // Refresh user list and health state
    await fetchUsers();
    await checkHealth();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(loading) {
  isSubmitting = loading;
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  if (loading) {
    submitBtn.disabled = true;
    btnText.style.opacity = '0.3';
    spinner.classList.remove('hidden');
  } else {
    submitBtn.disabled = false;
    btnText.style.opacity = '1';
    spinner.classList.add('hidden');
  }
}

/* ==========================================================================
   Control Handlers
   ========================================================================== */
refreshBtn.addEventListener('click', async () => {
  // Add quick spin animation to refresh icon
  const icon = refreshBtn.querySelector('i');
  icon.style.transform = 'rotate(360deg)';
  icon.style.transition = 'transform 0.5s ease';
  
  await fetchUsers();
  await checkHealth();
  
  setTimeout(() => {
    icon.style.transform = 'none';
    icon.style.transition = 'none';
  }, 500);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  
  // Initial health check and fetch
  checkHealth();
  fetchUsers();
  
  // Poll health checks every 10 seconds
  setInterval(checkHealth, 10000);
});
