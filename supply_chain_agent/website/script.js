// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Demo Modal Functions
function openDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeDemo() {
    const modal = document.getElementById('demoModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('demoModal');
    if (event.target === modal) {
        closeDemo();
    }
};

// Demo Tab Switching
function switchDemoTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.demo-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.demo-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked button
    event.target.classList.add('active');
}

// Smooth Scrolling
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Chat Functions
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

// Sample Responses Database
const qaDatabase = {
    'which suppliers are highest risk?': {
        response: 'Based on current data, EuroLogistics Ltd (SUP002) has the highest risk score of 0.5 with 88% on-time rate. They recently had a 48-hour delay. Global Parts Inc (SUP001) is second with risk score 0.3. TechComps USA remains the most reliable with 0.2 risk score and 95% on-time rate.',
        data: [
            { supplier: 'EuroLogistics Ltd', risk: '0.5', status: 'High Risk' },
            { supplier: 'Global Parts Inc', risk: '0.3', status: 'Medium Risk' },
            { supplier: 'TechComps USA', risk: '0.2', status: 'Low Risk' }
        ]
    },
    'what revenue is at risk?': {
        response: 'Current revenue exposure analysis shows $2.3M at risk across 4 active shipments. The Rotterdam port strike affects $1.2M in value (high priority). Shanghai weather disruption impacts $800K. Remaining $300K in medium risk category. Estimated mitigation cost: $120K (5% of exposure).',
        data: [
            { disruption: 'Rotterdam Port Strike', value: '$1.2M', priority: 'High' },
            { disruption: 'Shanghai Weather', value: '$0.8M', priority: 'Medium' },
            { disruption: 'Inventory Shortage', value: '$0.3M', priority: 'Medium' }
        ]
    },
    'what is the demand forecast?': {
        response: 'Next 7-day demand forecast: Day 1-2 baseline, Day 3 +15% spike (Monday surge), Days 4-5 peak demand, Days 6-7 decline. Total predicted increase 22% vs last week. Critical inventory levels flagged for 3 SKUs. Recommend expediting 2 shipments to meet demand.',
        data: [
            { day: 'Day 1-2', forecast: 'Baseline', confidence: '98%' },
            { day: 'Day 3', forecast: '+15% Spike', confidence: '92%' },
            { day: 'Day 4-5', forecast: 'Peak', confidence: '95%' },
            { day: 'Day 6-7', forecast: 'Decline', confidence: '87%' }
        ]
    },
    'warehouse critical stock?': {
        response: 'Warehouse analysis identified 5 critical stock items: Widget-A (2 days inventory), Component-B (1.5 days), Circuit-C (3 days), Module-D (4 days), Assembly-E (5 days). Recommend immediate reorder for Widget-A and Component-B. Lead time for restocking: 7 days via standard supplier.',
        data: [
            { sku: 'Widget-A', inventory: '2 days', action: 'URGENT' },
            { sku: 'Component-B', inventory: '1.5 days', action: 'URGENT' },
            { sku: 'Circuit-C', inventory: '3 days', action: 'Alert' }
        ]
    }
};

function sendQuestion(question = null) {
    const userQuestion = question || chatInput.value.trim();
    
    if (!userQuestion) return;

    // Add user message to chat
    addUserMessage(userQuestion);
    chatInput.value = '';

    // Get response
    const response = getAIResponse(userQuestion);
    
    // Simulate typing delay
    setTimeout(() => {
        addBotMessage(response);
    }, 500);
}

function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<div class="message-content"><p>${escapeHtml(message)}</p></div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `<div class="message-content"><p>${message}</p></div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// getAIResponse is now defined in index.html as an async function
// This function definition has been removed to avoid conflicts

function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        sendQuestion();
    }
}

// Contact Form
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate form submission
    console.log('Form submitted with data:');
    for (let [key, value] of formData.entries()) {
        console.log(key + ': ' + value);
    }
    
    // Show success message
    alert('Thank you for your message! We\'ll get back to you soon.');
    form.reset();
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.agent-card, .capability-card, .feature-item, .kpi-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Counter Animation for KPI Numbers
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Initialize counters on scroll
const kpiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            const number = entry.target.querySelector('.kpi-number');
            const text = number.textContent;
            const target = parseInt(text.replace(/\D/g, ''));
            
            if (!isNaN(target)) {
                animateCounter(number, target);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.kpi-card').forEach(card => {
    kpiObserver.observe(card);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDemo();
    }
});

// Responsive Navigation
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu) {
        navMenu.style.display = 'flex';
    }
});

// Initialize
console.log('ChainPulse website loaded successfully!');
