/* ========================================
   MY LAYOUT COMPONENTS
   Zentraler Ort für Header, Nav und Footer
   ======================================== */

// 1. Header
class MyHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <header class="site-header">
                <div class="container">
                    <h1>borderless deviant</h1>
                    <p class="tagline">Struktur im Chaos</p>
                </div>
            </header>
        `;
    }
}

// 2. Navigation
class MyNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="main-nav">
                <!-- Linke Seite -->
                <div class="nav-left">
                    <a href="/index.html" class="nav-link">Home</a>
                    <a href="/strom.html" class="nav-link">Der Strom</a>
                    <a href="/wilde-reise.html" class="nav-link">Wilde Reise</a>
                    <a href="/themen.html" class="nav-link">Themen</a>
                </div>
                
                <!-- Rechte Seite -->
                <div class="nav-right">
                    <a href="/about.html" class="nav-link">Über mich</a>
                    
                    <button id="theme-toggle" class="theme-btn" aria-label="Modus wechseln">
                        <!-- Icon Sonne (wird im Darkmode ausgeblendet via JS) -->
                        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                        
                        <!-- Icon Mond (wird im Lightmode ausgeblendet via JS) -->
                        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    </button>
                </div>
            </nav>
        `;
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath || 
                link.getAttribute('href') === currentPath.replace(/\/$/, '')) {
                    link.classList.add('active');
            }
        });
        this.initThemeToggle();
    }

    initThemeToggle() {
        const btn = this.querySelector('#theme-toggle');
        const sun = this.querySelector('.icon-moon');
        const moon = this.querySelector('.icon-sun');

        // Aktuellen Status abfragen
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
        }

        btn.addEventListener('click', () => {
            const wasDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const newTheme = wasDark ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Icons tasuchen
            if (newTheme === 'dark') {
                sun.style.display = 'none';
                moon.style.display = 'block';
            } else {
                sun.style.display = 'block';
                moon.style.display = 'none';
            }
        });
    }
}

// 3. Footer
class MyFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <p>&copy; ${year} borderless deviant.</p>
                    <p><a href="/impressum.html">Impressum</a> | <a href="/datenschutz.html">Datenschutz</a></p>
                </div>
            </footer>
        `;
    }
}

customElements.define('my-header', MyHeader);
customElements.define('my-nav', MyNav);
customElements.define('my-footer', MyFooter);
