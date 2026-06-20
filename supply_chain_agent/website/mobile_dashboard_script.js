/**
 * Mobile Dashboard - JavaScript Functionality
 * Handles navigation, data loading, and interactions
 */

// ============================================
// DOM ELEMENTS
// ============================================

const mobileSidebar = document.getElementById('mobileSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const notificationPanel = document.getElementById('notificationPanel');
const alertList = document.getElementById('alertList');
const mainContent = document.querySelector('.main-content');

// ============================================
// STATE MANAGEMENT
// ============================================

let state = {
    currentTab: 'dashboard',
    notificationsOpen: false,
    sidebarOpen: false,
    userData: {
        suppliers: [],
        disruptions: [],
        shipments: [],
        alerts: []
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadData();
    initializeChart();
});

/**
 * Initialize the application
 */
function initializeApp() {
    setupEventListeners();
    handleResponsive();
    checkWebAppCapabilities();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-sidebar') && 
            !e.target.closest('.menu-toggle') &&
            state.sidebarOpen) {
            toggleMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResponsive);
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        handleResponsive();
    });
    
    // Pull to refresh
    let pullStart = 0;
    document.addEventListener('touchstart', (e) => {
        pullStart = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        const pullEnd = e.changedTouches[0].clientY;
        if (mainContent.scrollTop === 0 && pullEnd > pullStart + 100) {
            refreshData();
        }
    });
}

/**
 * Handle responsive behavior
 */
function handleResponsive() {
    const width = window.innerWidth;
    
    if (width >= 640 && state.sidebarOpen) {
        // Auto-close sidebar on larger screens
        state.sidebarOpen = false;
        updateSidebar();
    }
}

/**
 * Check if this is a web app
 */
function checkWebAppCapabilities() {
    // Check if app is running in web app mode
    if (window.navigator.standalone) {
        console.log('Running in standalone mode');
    }
    
    // Support for iOS PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running as PWA');
    }
}

// ============================================
// NAVIGATION & TABS
// ============================================

/**
 * Switch between tabs
 * @param {string} tabName - Name of the tab to switch to
 * @param {Event} event - Click event (optional)
 */
function switchTab(tabName, event) {
    if (event) {
        event.preventDefault();
    }
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active state from all nav items
    document.querySelectorAll('.nav-item, .sidebar-menu li a').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected tab
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    }
    
    // Update nav item active states
    document.querySelectorAll(`[onclick="switchTab('${tabName}', event)"]`).forEach(item => {
        item.classList.add('active');
    });
    
    state.currentTab = tabName;
    
    // Close sidebar on mobile
    if (window.innerWidth < 640 && state.sidebarOpen) {
        toggleMenu();
    }
    
    // Scroll to top
    mainContent.scrollTop = 0;
}

/**
 * Toggle sidebar menu
 */
function toggleMenu() {
    state.sidebarOpen = !state.sidebarOpen;
    updateSidebar();
}

/**
 * Update sidebar display
 */
function updateSidebar() {
    if (state.sidebarOpen) {
        mobileSidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        mobileSidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// NOTIFICATIONS & ALERTS
// ============================================

/**
 * Toggle notifications panel
 */
function toggleNotifications() {
    state.notificationsOpen = !state.notificationsOpen;
    if (state.notificationsOpen) {
        notificationPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        notificationPanel.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Toggle settings panel (similar to notifications)
 */
function toggleSettings() {
    // For now, just switch to settings tab
    switchTab('settings', null);
    if (window.innerWidth < 640) {
        toggleMenu();
    }
}

/**
 * Acknowledge an alert
 * @param {Element} element - The alert element
 */
function acknowledgeAlert(element) {
    const alertElement = element.closest('.alert');
    alertElement.style.animation = 'slideOut 0.3s ease';
    
    setTimeout(() => {
        alertElement.remove();
        updateNotificationBadge();
    }, 300);
}

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.getElementById('notifBadge');
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ============================================
// DATA LOADING & MANAGEMENT
// ============================================

/**
 * Load data from API or localStorage
 */
function loadData() {
    // Try to fetch from API, fall back to localStorage
    loadSuppliers();
    loadDisruptions();
    loadShipments();
    updateDashboardMetrics();
}

/**
 * Load suppliers data
 */
function loadSuppliers() {
    // Simulating API call - replace with actual API endpoint
    fetch('../data/suppliers.json')
        .then(response => response.json())
        .then(data => {
            state.userData.suppliers = data.suppliers || [];
            updateSuppliersList();
        })
        .catch(error => {
            console.error('Error loading suppliers:', error);
            // Use mock data
            state.userData.suppliers = getMockSuppliers();
            updateSuppliersList();
        });
}

/**
 * Load disruptions data
 */
function loadDisruptions() {
    fetch('../data/disruptions.json')
        .then(response => response.json())
        .then(data => {
            state.userData.disruptions = data.active_disruptions || [];
            updateDisruptionsList();
        })
        .catch(error => {
            console.error('Error loading disruptions:', error);
            state.userData.disruptions = getMockDisruptions();
            updateDisruptionsList();
        });
}

/**
 * Load shipments data
 */
function loadShipments() {
    fetch('../data/shipments.json')
        .then(response => response.json())
        .then(data => {
            state.userData.shipments = data.shipments || [];
            updateShipmentsList();
        })
        .catch(error => {
            console.error('Error loading shipments:', error);
            state.userData.shipments = getMockShipments();
            updateShipmentsList();
        });
}

/**
 * Refresh all data
 */
function refreshData() {
    console.log('Refreshing data...');
    loadData();
    showNotification('Data refreshed', 'success');
}

// ============================================
// UI UPDATES
// ============================================

/**
 * Update dashboard metrics
 */
function updateDashboardMetrics() {
    const disruptionCount = state.userData.disruptions.length;
    const supplierCount = state.userData.suppliers.length;
    const shipmentCount = state.userData.shipments.length;
    
    // Update metric displays
    const elements = {
        disruptionCount: document.getElementById('disruptionCount'),
        supplierCount: document.getElementById('supplierCount'),
        shipmentCount: document.getElementById('shipmentCount'),
        healthScore: document.getElementById('healthScore')
    };
    
    if (elements.disruptionCount) elements.disruptionCount.textContent = disruptionCount;
    if (elements.supplierCount) elements.supplierCount.textContent = supplierCount;
    if (elements.shipmentCount) elements.shipmentCount.textContent = shipmentCount;
    
    // Calculate health score
    const healthScore = calculateHealthScore();
    if (elements.healthScore) elements.healthScore.textContent = healthScore + '%';
}

/**
 * Update suppliers list in UI
 */
function updateSuppliersList() {
    const suppliersList = document.getElementById('suppliersList');
    if (!suppliersList) return;
    
    if (state.userData.suppliers.length === 0) {
        suppliersList.innerHTML = '<p class="empty-state">No suppliers found</p>';
        return;
    }
    
    // This would be populated with actual data
    // For now, the HTML template is already populated
}

/**
 * Update disruptions list in UI
 */
function updateDisruptionsList() {
    const disruptionsList = document.getElementById('disruptionsList');
    if (!disruptionsList) return;
    
    if (state.userData.disruptions.length === 0) {
        disruptionsList.innerHTML = '<p class="empty-state">No active disruptions</p>';
        return;
    }
}

/**
 * Update shipments list in UI
 */
function updateShipmentsList() {
    const shipmentsList = document.getElementById('shipmentsList');
    if (!shipmentsList) return;
    
    if (state.userData.shipments.length === 0) {
        shipmentsList.innerHTML = '<p class="empty-state">No shipments found</p>';
        return;
    }
}

/**
 * Filter suppliers by status
 * @param {string} status - Filter status (all, healthy, at-risk)
 */
function filterSuppliers(status) {
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter suppliers (mock implementation)
    console.log('Filtering suppliers by:', status);
}

// ============================================
// QUICK ACTIONS
// ============================================

/**
 * Handle quick action buttons
 * @param {string} action - Action to perform
 */
function quickAction(action) {
    switch (action) {
        case 'run-orchestrator':
            runOrchestrator();
            break;
        case 'generate-report':
            generateReport();
            break;
        case 'export-data':
            exportData();
            break;
        case 'alert-team':
            alertTeam();
            break;
    }
}

/**
 * Run orchestrator analysis
 */
function runOrchestrator() {
    showNotification('Running supply chain analysis...', 'info');
    
    // Call backend API
    fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        showNotification('Analysis completed!', 'success');
        setTimeout(() => loadData(), 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error running analysis', 'error');
    });
}

/**
 * Generate report
 */
function generateReport() {
    showNotification('Generating report...', 'info');
    window.location.href = '/api/reports/generate';
}

/**
 * Export data
 */
function exportData() {
    showNotification('Exporting data...', 'info');
    
    const dataStr = JSON.stringify(state.userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supply-chain-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

/**
 * Alert team
 */
function alertTeam() {
    showNotification('Sending alerts to team...', 'info');
    
    fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Critical supply chain alert' })
    })
    .then(() => {
        showNotification('Team alerted!', 'success');
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error sending alerts', 'error');
    });
}

// ============================================
// DETAIL VIEWS
// ============================================

/**
 * View supplier details
 * @param {string} supplierId - Supplier ID
 */
function viewSupplier(supplierId) {
    // In a real app, this would navigate to a detail view
    console.log('Viewing supplier:', supplierId);
    showNotification(`Opening supplier details for ${supplierId}`, 'info');
}

/**
 * View disruption details
 * @param {string} disruptionId - Disruption ID
 */
function viewDisruption(disruptionId) {
    console.log('Viewing disruption:', disruptionId);
    showNotification(`Opening disruption details`, 'info');
}

// ============================================
// UTILITIES
// ============================================

/**
 * Show temporary notification
 * @param {string} message - Notification message
 * @param {string} type - Type: success, error, info, warning
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Calculate overall supply chain health score
 */
function calculateHealthScore() {
    if (state.userData.suppliers.length === 0) return 85;
    
    const avgOnTimeRate = state.userData.suppliers.reduce((acc, s) => acc + s.on_time_rate, 0) / state.userData.suppliers.length;
    const disruptionImpact = Math.max(0, 100 - (state.userData.disruptions.length * 5));
    
    const healthScore = Math.round((avgOnTimeRate * 0.7 + disruptionImpact * 0.3) * 100);
    return Math.max(0, Math.min(100, healthScore));
}

/**
 * Format date
 * @param {string|Date} date - Date to format
 */
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format time
 * @param {string|Date} date - Date to format
 */
function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Logout user
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session/cookies
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }
}

// ============================================
// CHART INITIALIZATION
// ============================================

/**
 * Initialize Chart.js charts
 */
function initializeChart() {
    const chartElement = document.getElementById('riskChart');
    if (!chartElement) return;
    
    const ctx = chartElement.getContext('2d');
    
    // Risk distribution chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Low Risk', 'Medium Risk', 'High Risk'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                }
            }
        }
    });
}

// ============================================
// MOCK DATA (for demo)
// ============================================

function getMockSuppliers() {
    return [
        {
            id: 1,
            name: 'ABC Corp',
            location: 'Shanghai',
            on_time_rate: 0.93,
            risk_score: 15
        },
        {
            id: 2,
            name: 'XYZ Logistics',
            location: 'Singapore',
            on_time_rate: 0.72,
            risk_score: 45
        },
        {
            id: 3,
            name: 'Global Trade Inc',
            location: 'Bangkok',
            on_time_rate: 0.45,
            risk_score: 80
        }
    ];
}

function getMockDisruptions() {
    return [
        {
            id: 1,
            type: 'Weather Event',
            location: 'Shanghai Port',
            severity: 'high',
            estimated_delay_hours: 48,
            affected_suppliers: ['ABC Corp']
        },
        {
            id: 2,
            type: 'Supplier Alert',
            location: 'Singapore',
            severity: 'medium',
            estimated_delay_hours: 24,
            affected_suppliers: ['XYZ Logistics']
        }
    ];
}

function getMockShipments() {
    return [
        {
            id: 'SH-2024-001',
            origin: 'Shanghai',
            destination: 'Los Angeles',
            eta: '2024-07-15',
            status: 'on-time',
            progress: 75
        },
        {
            id: 'SH-2024-002',
            origin: 'Singapore',
            destination: 'New York',
            eta: '2024-07-18',
            status: 'delayed',
            progress: 45
        }
    ];
}

// ============================================
// CSS ANIMATIONS (injected)
// ============================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification {
        position: fixed;
        bottom: 2rem;
        right: 1rem;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1000;
        transform: translateY(150%);
        transition: transform 0.3s ease;
        max-width: 90vw;
    }
    
    .notification.show {
        transform: translateY(0);
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-success i {
        color: #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-error i {
        color: #ef4444;
    }
    
    .notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification-info i {
        color: #3b82f6;
    }
    
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
    }
`;
document.head.appendChild(style);
