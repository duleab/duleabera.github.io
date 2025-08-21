// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    }
});

// Settings Management
class PortfolioSettings {
    constructor() {
        this.defaultSettings = {
            theme: 'light',
            accent: 'blue',
            viewMode: 'desktop',
            reducedMotion: false,
            highContrast: false,
            projectsPerPage: 9,
            showTechBadges: true,
            showProjectStats: true,
            autoPlayVideos: false,
            imageQuality: 'medium',
            lazyLoading: true,
            preloadImages: false,
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
            analytics: true,
            cookies: true,
            tracking: false
        };
        
        this.settings = this.loadSettings();
        this.init();
    }
    
    init() {
        this.applySettings();
        this.bindEvents();
        this.updateUI();
        this.detectSystemPreferences();
    }
    
    loadSettings() {
        try {
            const saved = localStorage.getItem('portfolioSettings');
            return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : this.defaultSettings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return this.defaultSettings;
        }
    }
    
    saveSettings() {
        try {
            localStorage.setItem('portfolioSettings', JSON.stringify(this.settings));
            this.showNotification('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showNotification('Failed to save settings', 'error');
        }
    }
    
    applySettings() {
        const html = document.documentElement;
        
        // Apply theme
        html.setAttribute('data-theme', this.settings.theme === 'auto' ? this.getSystemTheme() : this.settings.theme);
        html.setAttribute('data-accent', this.settings.accent);
        html.setAttribute('data-view-mode', this.settings.viewMode);
        html.setAttribute('data-reduced-motion', this.settings.reducedMotion);
        html.setAttribute('data-high-contrast', this.settings.highContrast);
        
        // Apply content settings
        this.applyContentSettings();
        
        // Apply performance settings
        this.applyPerformanceSettings();
        
        // Apply language settings
        html.setAttribute('lang', this.settings.language);
    }
    
    applyContentSettings() {
        // Show/hide tech badges
        const techBadges = document.querySelectorAll('.tech-badge, .badge');
        techBadges.forEach(badge => {
            badge.style.display = this.settings.showTechBadges ? '' : 'none';
        });
        
        // Show/hide project stats
        const projectStats = document.querySelectorAll('.project-stats');
        projectStats.forEach(stat => {
            stat.style.display = this.settings.showProjectStats ? '' : 'none';
        });
        
        // Auto-play videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            video.autoplay = this.settings.autoPlayVideos;
        });
    }
    
    applyPerformanceSettings() {
        // Image quality
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (this.settings.imageQuality === 'low') {
                img.style.imageRendering = 'pixelated';
            } else {
                img.style.imageRendering = 'auto';
            }
        });
        
        // Lazy loading
        if (!this.settings.lazyLoading) {
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    }
    
    bindEvents() {
        // Theme change
        document.querySelectorAll('input[name="theme"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        });
        
        // Accent color change
        document.querySelectorAll('input[name="accent"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.accent = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        });
        
        // View mode change
        document.querySelectorAll('input[name="viewMode"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.viewMode = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        });
        
        // All other settings
        const settingInputs = [
            'reducedMotion', 'highContrast', 'showTechBadges', 'showProjectStats',
            'autoPlayVideos', 'lazyLoading', 'preloadImages', 'analytics', 'cookies', 'tracking'
        ];
        
        settingInputs.forEach(setting => {
            const input = document.getElementById(setting);
            if (input) {
                input.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.checked;
                    this.applySettings();
                    this.saveSettings();
                });
            }
        });
        
        // Select inputs
        const selectInputs = ['projectsPerPage', 'imageQuality', 'language', 'dateFormat'];
        selectInputs.forEach(setting => {
            const select = document.getElementById(setting);
            if (select) {
                select.addEventListener('change', (e) => {
                    this.settings[setting] = e.target.value;
                    this.applySettings();
                    this.saveSettings();
                });
            }
        });
        
        // Save settings button
        const saveButton = document.getElementById('saveSettings');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveSettings();
                const modalElement = document.getElementById('settingsModal');
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            });
        }
        
        // Reset settings button
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all settings to default?')) {
                    this.resetSettings();
                }
            });
        }
        
        // Export settings button
        const exportButton = document.getElementById('exportSettings');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportSettings();
            });
        }
    }
    
    updateUI() {
        // Update form inputs to match current settings
        Object.keys(this.settings).forEach(key => {
            const input = document.getElementById(key) || document.querySelector(`input[name="${key}"][value="${this.settings[key]}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = this.settings[key];
                } else if (input.type === 'radio') {
                    input.checked = true;
                } else {
                    input.value = this.settings[key];
                }
            }
        });
    }
    
    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.applySettings();
        this.updateUI();
        this.saveSettings();
        this.showNotification('Settings reset to default', 'info');
    }
    
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'portfolio-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Settings exported successfully', 'success');
    }
    
    detectSystemPreferences() {
        // Auto theme detection
        if (this.settings.theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                this.applySettings();
            });
        }
        
        // Reduced motion detection
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reducedMotionQuery.matches && !this.settings.reducedMotion) {
            this.settings.reducedMotion = true;
            this.applySettings();
            this.saveSettings();
        }
    }
    
    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Project card animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Project filtering functionality
let filterButtons, projectItems, noResults, searchInput;

// Filter projects by category
function filterProjects(category) {
    if (!projectItems || !searchInput || !noResults) return;
    
    let visibleCount = 0;
    
    projectItems.forEach(item => {
        const itemCategories = item.dataset.category ? item.dataset.category.split(' ') : [];
        const searchTerm = searchInput.value.toLowerCase();
        const keywords = item.dataset.keywords ? item.dataset.keywords.toLowerCase() : '';
        
        const matchesCategory = category === 'all' || itemCategories.includes(category);
        const matchesSearch = searchTerm === '' || keywords.includes(searchTerm);
        
        if (matchesCategory && matchesSearch) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Initialize DOM-dependent functionality
function initializeDOMElements() {
    // Initialize project filtering elements
    filterButtons = document.querySelectorAll('.filter-btn');
    projectItems = document.querySelectorAll('.project-item');
    noResults = document.getElementById('noResults');
    searchInput = document.getElementById('projectSearch');
    
    // Observe all project cards for animations
    document.querySelectorAll('.project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter projects
            const category = this.dataset.filter;
            filterProjects(category);
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.dataset.filter : 'all';
            filterProjects(category);
        });
    }
    
    // Contact link hover effects
    document.querySelectorAll('.contact-link').forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Skill card animations
    document.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        });
    });
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize settings
    window.portfolioSettings = new PortfolioSettings();
    
    // Initialize DOM-dependent functionality
    initializeDOMElements();
});

// Performance tracking (optional)
if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    });
}