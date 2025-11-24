// ========================================
// DARK MODE TOGGLE
// ========================================

class ThemeToggle {
    constructor() {
        this.theme = this.loadTheme();
        this.init();
    }
    
    init() {
        // Theme initial setzen
        this.applyTheme(this.theme);
        
        // Toggle Button erstellen
        this.createToggleButton();
        
        // Event Listener
        this.attachEventListeners();
    }
    
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Theme umschalten');
        button.innerHTML = `
            <span class="icon-sun">☀️</span>
            <span class="icon-moon">🌙</span>
        `;
        
        document.body.appendChild(button);
        this.button = button;
    }
    
    attachEventListeners() {
        this.button.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard Support
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
        this.saveTheme(this.theme);
    }
    
    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
    
    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('LocalStorage nicht verfügbar:', e);
        }
    }
    
    loadTheme() {
        try {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            
            // System-Preference prüfen
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {
            console.warn('Theme konnte nicht geladen werden:', e);
        }
        
        return 'light'; // Default
    }
}

// Auto-Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ThemeToggle());
} else {
    new ThemeToggle();
}

// System-Theme-Change Detection
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Nur reagieren wenn kein manuell gesetztes Theme existiert
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    });
}
