// Mobile Menu Toggle - DEFER to after page load
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
}

// Initialize mobile menu after page render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeMobileMenu, 100);
    });
} else {
    setTimeout(initializeMobileMenu, 100);
}

// Theme Toggle Functions
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon('sun');
    } else {
        document.body.classList.remove('dark-mode');
        updateThemeIcon('moon');
    }
}

function toggleTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    if (isDarkMode) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('moon');
    } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('sun');
    }
}

function updateThemeIcon(icon) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        if (icon === 'sun') {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            themeToggle.title = 'Switch to light mode';
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggle.title = 'Switch to dark mode';
        }
    }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
});

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

// Close modal when clicking outside - DEFER
function initializeModalClickHandler() {
    window.onclick = function (event) {
        const modal = document.getElementById('demoModal');
        if (event.target === modal) {
            closeDemo();
        }
    };
}

// Defer modal click handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeModalClickHandler, 150);
    });
} else {
    setTimeout(initializeModalClickHandler, 150);
}

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

// Observe cards for animation - DEFER to after page load
function initializeCardAnimations() {
    const cards = document.querySelectorAll('.agent-card, .capability-card, .feature-item, .kpi-card');
    if (cards.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Defer card animations to after initial render
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeCardAnimations, 500);
    });
} else {
    setTimeout(initializeCardAnimations, 500);
}

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

// Add keyboard shortcuts - DEFER
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('demoModal');
            if (modal && modal.style.display === 'block') {
                closeDemo();
            }
        }
    });
}

// Defer keyboard shortcuts to after page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeKeyboardShortcuts, 200);
    });
} else {
    setTimeout(initializeKeyboardShortcuts, 200);
}

// Responsive Navigation
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu) {
        navMenu.style.display = 'flex';
    }
});

// Initialize
console.log('ChainPulse website loaded successfully!');

// ===== CHATBOT WIDGET FUNCTIONS =====

// Toggle Chatbot Widget
function toggleChatbot() {
    const widget = document.getElementById('chatbotWidget');
    if (widget) {
        widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
    }
}

// Open Chatbot Widget
function openChatbot() {
    const widget = document.getElementById('chatbotWidget');
    if (widget) {
        widget.style.display = 'flex';
    }
}

// Close Chatbot Widget
function closeChatbot() {
    const widget = document.getElementById('chatbotWidget');
    if (widget) {
        widget.style.display = 'none';
    }
}

// Get AI Response from Ollama or Knowledge Base
async function getAIResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    // Check knowledge base first
    for (const [key, value] of Object.entries(qaDatabase)) {
        if (lowerQuestion.includes(key.split('?')[0]) || key.includes(lowerQuestion.split('?')[0])) {
            return value.response;
        }
    }
    
    // Try Ollama API
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'mistral',
                prompt: `You are ChainPulse AI, a supply chain expert. Answer this question about supply chains: ${question}`,
                stream: false
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.response || 'I could not generate a response. Please try again.';
        }
    } catch (err) {
        console.log('Ollama not available, using knowledge base');
    }
    
    // Default fallback
    return 'I\'m here to help with supply chain questions! Ask me about suppliers, disruptions, forecasts, or inventory.';
}

// Send Chat Message
async function sendChatMessage(message = null) {
    const chatWidget = document.getElementById('chatbotWidget');
    const chatMessagesContainer = chatWidget ? chatWidget.querySelector('.chatbot-messages') : document.getElementById('chatMessages');
    const chatInputElement = chatWidget ? chatWidget.querySelector('#chatInput') : document.getElementById('chatInput');
    
    const userMessage = message || (chatInputElement ? chatInputElement.value.trim() : '');
    
    if (!userMessage) return;
    
    // Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'message user-message';
    userMsgDiv.innerHTML = `<div class="message-content"><p>${escapeHtml(userMessage)}</p></div>`;
    if (chatMessagesContainer) {
        chatMessagesContainer.appendChild(userMsgDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
    
    // Clear input
    if (chatInputElement) {
        chatInputElement.value = '';
    }
    
    // Get AI response
    const aiResponse = await getAIResponse(userMessage);
    
    // Add bot message
    setTimeout(() => {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'message bot-message';
        botMsgDiv.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="message-content"><p>${aiResponse}</p></div>
        `;
        if (chatMessagesContainer) {
            chatMessagesContainer.appendChild(botMsgDiv);
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
    }, 400);
}

// ===== GUIDED TOUR SYSTEM =====

let currentTourStep = 0;
let isTourRunning = false;

// Enhanced tour steps with detailed information
const tourSteps = [
    {
        title: '🎯 Welcome to ChainPulse!',
        description: 'ChainPulse is your AI-powered supply chain intelligence platform. Let me show you the key features.',
        element: '.hero',
        features: {
            title: 'Platform Overview',
            items: ['Real-time disruption detection', 'AI-powered risk assessment', 'Automated mitigation strategies', '1,284 agents monitoring globally']
        }
    },
    {
        title: '❓ Ask Me - Your AI Assistant',
        description: 'Click the purple "Ask Me" button to activate ChainPulse AI. Ask questions about suppliers, risks, and forecasts anytime!',
        element: '.ask-me-container',
        features: {
            title: 'Ask Me Features',
            items: ['🎤 Voice input via microphone', '💬 Natural language questions', '🔍 Real-time data queries', '⚡ AI-powered responses']
        }
    },
    {
        title: '🌍 Global Map Dashboard',
        description: 'Click "Global Map" in the navigation to see real-time visualization of all active shipments worldwide.',
        element: 'nav',
        features: {
            title: 'Global Map Capabilities',
            items: ['📍 4,812 live shipment tracking', '⚠️ 127 active risk alerts', '🗺️ Interactive world map', '📊 Real-time metrics sidebar']
        }
    },
    {
        title: '📦 Parcel Disruption Tracking',
        description: 'Access "Parcels" to monitor ecommerce shipments with AI threat detection and disruption scoring.',
        element: 'nav',
        features: {
            title: 'Parcel Tracking Features',
            items: ['🚚 12,847 parcels monitored', '🤖 AI risk scoring', '⏱️ 2.3hr detection time', '📋 Filter by status (Delayed, At Risk, Healthy)']
        }
    },
    {
        title: '📊 Dashboard Insights',
        description: 'Below the hero, you\'ll see Key Performance Indicators (KPIs) showing real-time supply chain metrics.',
        element: '.kpi-section',
        features: {
            title: 'KPI Metrics Available',
            items: ['✅ 99.8% system uptime', '📈 Real-time status updates', '💰 $2.3B revenue protected', '⭐ 1,284 enterprises trust us']
        }
    },
    {
        title: '🤖 AI Agent Network',
        description: 'ChainPulse uses 12 specialized AI agents that work together 24/7 to monitor and protect your supply chain.',
        element: '.agents-section',
        features: {
            title: 'AI Agents Include',
            items: ['🔍 Supplier Monitor', '⚡ Disruption Detector', '📊 Risk Assessor', '🛡️ Mitigation Planner', '📢 Stakeholder Notifier', 'And 7 more...']
        }
    },
    {
        title: '🎛️ Mission Control Center',
        description: 'Navigate to Mission Control for a real-time command center view of all active agents, metrics, and system status.',
        element: 'nav',
        features: {
            title: 'Mission Control Includes',
            items: ['👁️ Live agent status display', '📊 Performance metrics', '📝 Real-time event logs', '🔧 System health monitoring']
        }
    },
    {
        title: '⚔️ War Room - Crisis Mode',
        description: 'When disruptions occur, access War Room for emergency response protocols, crisis collaboration, and impact predictions.',
        element: 'nav',
        features: {
            title: 'War Room Capabilities',
            items: ['🚨 Emergency protocols', '👥 Real-time collaboration', '🛡️ Mitigation strategies', '📊 Impact simulations']
        }
    },
    {
        title: '🛡️ Admin Portal',
        description: 'Advanced admin settings for system configuration, model deployment, integrations, and performance monitoring.',
        element: 'nav',
        features: {
            title: 'Admin Features',
            items: ['⚙️ System configuration', '🚀 Model deployment', '🔗 Integration management', '📈 Analytics dashboard']
        }
    },
    {
        title: '🌙 Light/Dark Theme',
        description: 'Use the moon/sun icon in the top-right to switch between light and dark themes. Your preference is saved!',
        element: '#themeToggle',
        features: {
            title: 'Theme Options',
            items: ['☀️ Bright light theme', '🌙 Dark theme for night', '💾 Preference saved', '🔄 Works across all pages']
        }
    },
    {
        title: '👤 User Profile & Settings',
        description: 'Click your username in the top-right to access profile options, restart this tour, or sign out.',
        element: '.auth-section',
        features: {
            title: 'Profile Features',
            items: ['📋 View profile info', '👉 Restart tour anytime', '🚪 Sign out safely', '🔐 Session management']
        }
    },
    {
        title: '🎤 Voice Commands',
        description: 'In the Ask Me chatbot, use the microphone button to speak your queries naturally. The AI will respond with voice too!',
        element: '.ask-me-container',
        features: {
            title: 'Voice Features',
            items: ['🎤 Voice input recognition', '🔊 AI voice responses', '⏱️ Real-time transcription', '🌍 Multiple languages supported']
        }
    },
    {
        title: '✨ You\'re Ready!',
        description: 'You now know the essentials! Explore ChainPulse to master supply chain intelligence. Click "Ask Me" anytime for help!',
        element: '.hero',
        features: {
            title: 'Pro Tips',
            items: ['💡 Use voice input for quick queries', '📊 Check dashboards regularly', '🔔 Enable notifications for alerts', '💬 Chat with AI for expert advice']
        }
    }
];

// Initialize tour for new users
function initializeTourSystem() {
    // Check if user has completed tour before
    const userEmail = sessionStorage.getItem('userEmail');
    const tourCompleted = localStorage.getItem(`tour_completed_${userEmail}`);
    
    // Show welcome modal if not completed and user just logged in
    if (userEmail && !tourCompleted && !isTourRunning) {
        // Small delay to ensure page is ready
        setTimeout(() => {
            showWelcomeModal();
        }, 300);
    }
}

// Show welcome modal with tour/video options
function showWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Start the tour
function startTour() {
    const modal = document.getElementById('welcomeModal');
    if (modal) modal.style.display = 'none';
    isTourRunning = true;
    currentTourStep = 0;
    showTourStep(0);
}

// Show specific tour step
function showTourStep(stepIndex) {
    if (stepIndex >= tourSteps.length) {
        endTour();
        return;
    }

    const step = tourSteps[stepIndex];
    const overlay = document.getElementById('tourOverlay');
    const card = document.getElementById('tourCard');
    const spotlight = document.getElementById('tourSpotlight');
    
    if (!overlay) return;
    
    // Update card content
    document.getElementById('tourTitle').textContent = step.title;
    document.getElementById('tourDescription').textContent = step.description;
    document.getElementById('tourStep').textContent = stepIndex + 1;
    document.getElementById('tourTotal').textContent = tourSteps.length;
    
    // Update features
    const featuresDiv = document.getElementById('tourFeatures');
    if (step.features) {
        featuresDiv.innerHTML = `
            <h4>${step.features.title}</h4>
            <ul>
                ${step.features.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    }
    
    // Show overlay
    overlay.style.display = 'block';
    
    // Position spotlight on element
    const element = document.querySelector(step.element);
    if (element) {
        const rect = element.getBoundingClientRect();
        spotlight.style.top = (rect.top - 8) + 'px';
        spotlight.style.left = (rect.left - 8) + 'px';
        spotlight.style.width = (rect.width + 16) + 'px';
        spotlight.style.height = (rect.height + 16) + 'px';
        spotlight.style.display = 'block';
        
        // Position card below element or to the side
        if (window.innerWidth > 768) {
            card.style.bottom = 'auto';
            card.style.right = '40px';
            card.style.top = Math.min(rect.top + rect.height + 20, window.innerHeight - 400) + 'px';
        } else {
            card.style.bottom = '20px';
            card.style.right = '10px';
            card.style.top = 'auto';
        }
    }
    
    currentTourStep = stepIndex;
}

// Next tour step
function nextTourStep() {
    showTourStep(currentTourStep + 1);
}

// End tour
function endTour() {
    const overlay = document.getElementById('tourOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Mark tour as completed for this user
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.setItem(`tour_completed_${userEmail}`, 'true');
    }
    
    isTourRunning = false;
}

// Restart tour (can be called from settings)
function restartTour() {
    currentTourStep = 0;
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.removeItem(`tour_completed_${userEmail}`);
    }
    startTour();
}

// Close welcome modal
function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Skip tutorial completely
function skipTutorial() {
    closeWelcomeModal();
    const userEmail = sessionStorage.getItem('userEmail');
    if (userEmail) {
        localStorage.setItem(`tour_completed_${userEmail}`, 'true');
    }
}

// Hook into login process - call this after successful login
function onLoginSuccess() {
    // Initialize tour for new users
    initializeTourSystem();
}

// Handle Chat Keypress
function handleChatKeypress(event) {
    if (event.key === 'Enter') {
        const chatWidget = document.getElementById('chatbotWidget');
        const chatInputElement = chatWidget ? chatWidget.querySelector('#chatInput') : document.getElementById('chatInput');
        if (chatInputElement && chatInputElement === event.target) {
            sendChatMessage();
        }
    }
}
