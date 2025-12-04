import * as blogData from './blogData.js';
import * as postRenderer from './postRenderer.js';
import * as filterManager from './filterManager.js';
import * as utils from './utils.js';

/* ==========================================================================
   MAIN.JS - Das Gehirn der Webseite
   ========================================================================== */


// Destrukturieren der benötigten Funktionen aus utils
const { formatDate, loadFullPostContent, handleMagicJump, initScrollToTopButton } = utils;

// formatDate global verfügbar machen, da es direkt in den gerenderten HTML-Templates verwendet wird.
window.formatDate = formatDate;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Globale Listener (Tags, etc.)
    initGlobalTagListener();

    // 2. Routing: Welche Seite sind wir?
    if (document.getElementById('posts-stream')) {
        loadStrom();
    }
    
    if (document.querySelector('.topic-grid')) {
        initThemenHub();
    }

    if (document.getElementById('recent-posts-list')) {
        initIndexPage();
    }
});

/* --------------------------------------------------------------------------
   HELPER: Daten holen & Tags normalisieren
   -------------------------------------------------------------------------- */
async function fetchAllData() {
    try {
        const [postsRes, pagesRes] = await Promise.all([
            fetch('/api/posts.json'),
            fetch('/api/pages.json'),
            fetch('/api/themes.json'),
        ]);

        const postsData = await postsRes.json();
        const pagesData = await pagesRes.json();
        const themesData = await themesRes.json();

        return {
            posts: postsData.posts || [],
            pages: pagesData.pages || [],
            themes: themesData.themes || {} // Metadaten zu den Themen
        };
    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
        return { posts: [], pages: [], themes: {} };
    }
}

// Macht aus "politik" und "#politik" einheitlich "politik"
function normalizeTag(tag) {
    return tag.replace('#', '').trim().toLowerCase();
}

/* --------------------------------------------------------------------------
   LOGIK: Startseite (Mixed Recent: 2 Posts + 2 Pages)
   -------------------------------------------------------------------------- */
async function initIndexPage() {
    const container = document.getElementById('recent-posts-list');
    
    // Daten laden
    const data = await fetchAllData();

    // 1. Die neuesten 2 Blog-Posts holen
    const recentPosts = data.posts
        .filter(item => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)
        .map(p => ({ ...p, sourceType: 'post' })); // Markierung für CSS/Logik

    // 2. Die neuesten 2 Statischen Seiten holen
    const recentPages = data.pages
        .filter(item => item.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2)
        .map(p => ({ ...p, sourceType: 'page' })); // Markierung

    // 3. Zusammenfügen (Ergibt max. 4 Items)
    let mixedSelection = [...recentPosts, ...recentPages];

    // 4. Das Ergebnis nochmal final nach Datum sortieren
    // Damit die Darstellung chronologisch stimmt (z.B. Post, Page, Post, Page)
    mixedSelection.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = ''; // Loading Text entfernen

    if (mixedSelection.length === 0) {
        container.innerHTML = '<p>Noch keine Einträge vorhanden.</p>';
        return;
    }

    // 5. Rendern
    mixedSelection.forEach(item => {
        const html = createCardHTML(item, item.sourceType);
        container.insertAdjacentHTML('beforeend', html);
    });
}

/* --------------------------------------------------------------------------
   LOGIK: Strom (Blog Feed)
   -------------------------------------------------------------------------- */
/*
 * Initialisiert die gesamte Blog-Anwendung.
 */
async function loadStrom() {
    try {
        await blogData.loadBlogData();
        const allPosts = blogData.getPosts();
        const allThemes = blogData.getThemes();

        // Erstes Rendern aller Posts
        postRenderer.renderPosts(allPosts, 'posts-stream');

        // Filter-UI initialisieren und eine Callback-Funktion für das erneute Rendern bereitstellen
        filterManager.initFilterUI(allPosts, allThemes, (filteredPosts) => {
            // Callback, der aufgerufen wird, wenn Filter angewendet werden
            postRenderer.renderPosts(filteredPosts, 'posts-stream');
        });

        setupEventListeners();

        // Magic Jump nach dem initialen Rendern behandeln
        handleMagicJump(allPosts, 'posts-stream', (postId, targetElement) =>
            loadFullPostContent(postId, targetElement, blogData.findPostById)
        );

        // Scroll-to-Top-Button initialisieren
        initScrollToTopButton('scrollToTopBtn');

    } catch (error) {
        console.error('Fehler beim Initialisieren des Blogs:', error);
        const postsStream = document.getElementById('posts-stream');
        if (postsStream) {
            postsStream.innerHTML = '<p class="error">Fehler beim Laden der Blog-Daten. Bitte versuchen Sie es später erneut.</p>';
        }
    }
}

/*
 * Richtet alle globalen Event-Listener ein.
 */
function setupEventListeners() {
    // Event Delegation für Post-Interaktionen (Expand/Collapse)
    document.getElementById('posts-stream')?.addEventListener('click', handlePostClicks);

    // Event Delegation für Filter-Buttons
    document.getElementById('theme-filters')?.addEventListener('click', handleFilterButtonClicks);

    // Sichtbarkeit des Filterbereichs umschalten
    document.getElementById('filter-toggle')?.addEventListener('click', filterManager.handleFilterToggle);

    // Home-Link-Funktionalität
    document.getElementById('home-link')?.addEventListener('click', handleHomeLinkClick);
}

/*
 * Behandelt Klicks innerhalb des posts-stream-Containers zum Expandieren/Zusammenklappen von Posts.
 * Nutzt Event Delegation.
 * @param {Event} event - Das Klick-Ereignis.
 */
function handlePostClicks(event) {
    const target = event.target;
    const postCard = target.closest('article.post-card');
    if (!postCard) return; // Kein Klick auf eine Post-Card oder deren Kinder

    const postId = postCard.dataset.postId;
    const fullContentArea = postCard.querySelector('.full-content-area');
    const toggleButton = postCard.querySelector('.toggle-full-content');

    // Elemente definieren, die Expand/Collapse auslösen sollen
    const isExpandTrigger = target.matches('h3') ||
                            target.closest('.post-header') || // Umfasst Titel und Datum
                            target.matches('.excerpt') ||
                            target.closest('.hashtags') ||
                            target.closest('.toggle-full-content') ||
                            target.matches('.post-initial-display'); // Umfasst den Button selbst

    if (isExpandTrigger) {
        event.preventDefault(); // Standard-Link-Verhalten bei Klick auf direkten Link verhindern
        postRenderer.togglePostContent(
            postId,
            postCard,
            fullContentArea,
            toggleButton,
            (pId, targetEl) => loadFullPostContent(pId, targetEl, blogData.findPostById) // loadFullPostContent kommt jetzt aus utils
        );
    }
}

/*
 * Behandelt Klicks auf Filter-Buttons mithilfe von Event Delegation.
 * @param {Event} event - Das Klick-Ereignis.
 */
function handleFilterButtonClicks(event) {
    const target = event.target;
    if (target.matches('.filter-button')) {
        let type;
        let value;

        if (target.classList.contains('all-posts-filter')) {
            type = 'all';
            value = 'all';
        } else if (target.dataset.themeId) {
            type = 'theme';
            value = target.dataset.themeId;
        } else if (target.dataset.hashtag) {
            type = 'hashtag';
            value = target.dataset.hashtag;
        }

        if (type && value) {
            filterManager.toggleFilter(type, value, target);
        }
    }
}

/*
 * Behandelt den Klick auf den Home-Link, löscht Filter und setzt die URL zurück.
 * @param {Event} event - Das Klick-Ereignis.
 */
function handleHomeLinkClick(event) {
    event.preventDefault(); // Standard-Link-Navigation verhindern
    filterManager.clearFilters();
    // Den "Alle Posts"-Button wieder aktivieren
    document.querySelector('.all-posts-filter')?.classList.add('active');

    const allPosts = blogData.getPosts();
    postRenderer.renderPosts(allPosts, 'posts-stream');

    // URL-Query-Parameter löschen
    history.pushState(null, '', window.location.pathname);
}


/* --------------------------------------------------------------------------
   SHARED: HTML Generator für Karten (aktuell nur auf index.html genutzt)
   -------------------------------------------------------------------------- */
function createCardHTML(item, type) {
    // URL fixen
    const rawLink = item.file || item.url;
    const link = rawLink.startsWith('/') ? rawLink : '/' + rawLink;

    // Tags HTML bauen
    const tags = item.tags || [];
    const tagsHTML = tags.map(t => {
        const pureTag = normalizeTag(t);
        return `<span class="hashtag" data-tag="${pureTag}">#${pureTag}</span>`;
    }).join(' ');

    return `
        <article class="post-card type-${type}">
            <h3><a href="${link}">${item.title}</a></h3>
            <div class="meta">
                <span class="date">${item.date || ''}</span>
                <div class="tags">${tagsHTML}</div>
            </div>
            <p>${item.excerpt}</p>
            <a href="${link}" class="read-more">Eintauchen &rarr;</a>
        </article>
    `;
}

/* --------------------------------------------------------------------------
   LOGIK: Themen Hub (Tag Cloud, Suche & Kategorien)
   -------------------------------------------------------------------------- */
async function initThemenHub() {
    const data = await fetchAllData();
    const allContent = [
        ...data.posts.map(p => ({ ...p, type: 'post' })),
        ...data.pages.map(p => ({ ...p, type: 'page' }))
    ];

    // 1. Tag Cloud immer rendern (damit man weiter klicken kann)
    renderTagCloud(allContent);

    // 2. Prüfen: Haben wir einen Filter in der URL? (?tag=xyz)
    const urlParams = new URLSearchParams(window.location.search);
    const activeTag = urlParams.get('tag');

    const container = document.querySelector('.topic-grid');

    if (activeTag) {
        // --- MODUS: FILTER-ANSICHT ---
        
        // Titel ändern oder Info anzeigen
        const h2 = document.querySelector('h2'); 
        if(h2) h2.innerHTML = `Ergebnisse für <span class="highlight">#${activeTag}</span>`;

        // Filtern
        const results = allContent.filter(item => 
            item.tags && item.tags.some(t => t.replace('#', '').toLowerCase() === activeTag.toLowerCase())
        );

        // Grid leeren (wir bauen eine eigene Ergebnis-Liste)
        container.innerHTML = '';
        container.style.display = 'block'; // Grid-Layout ggf. aufheben für Liste

        if (results.length === 0) {
            container.innerHTML = '<p>Nichts gefunden. <a href="themen.html">Alle Themen anzeigen</a></p>';
            return;
        }

        // Ergebnis-Liste bauen
        const ul = document.createElement('ul');
        ul.className = 'link-list result-list'; // Klasse für CSS Styling

        // "Alle anzeigen" Button oben drüber
        container.innerHTML = '<div style="margin-bottom: 20px;"><a href="themen.html" class="btn-back">← Alle Themen anzeigen</a></div>';

        results.forEach(item => {
            const li = document.createElement('li');
            const url = item.type === 'post' ? `strom.html?post=${item.id}` : item.url;
            const icon = item.type === 'page' ? '📄' : '📝'; // Icon zur Unterscheidung

            li.innerHTML = `
                <a href="${url}" style="font-size: 1.2rem;">${icon} ${item.title}</a>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                    ${formatDate(item.date)} — ${item.excerpt || ''}
                </p>
            `;
            li.style.marginBottom = '1.5rem'; // Bisserl Abstand
            ul.appendChild(li);
        });

        container.appendChild(ul);

    } else {
        // --- MODUS: STANDARD (Kategorien) ---
        
        // Sortieren für Aktualität
        allContent.sort((a, b) => new Date(b.date) - new Date(a.date));

        allContent.forEach(item => {
            const themeKey = (item.theme || item.bereich || 'sonstiges').toLowerCase();
            const listContainer = document.getElementById(`list-${themeKey}`);
            
            if (listContainer) {
                const li = document.createElement('li');
                const url = item.url ? item.url : `post.html?id=${item.id}`;
                li.innerHTML = `<a href="${url}">${item.title}</a> <span class="meta-date">${formatDate(item.date)}</span>`;
                listContainer.appendChild(li);
            }
        });
    }
}


/* Helper: Tag Cloud rendern */
function renderTagCloud(contentArray) {
    const cloudContainer = document.getElementById('tag-cloud');
    if (!cloudContainer) return;

    // 1. Alle Tags sammeln und zählen (optional)
    const allTags = new Set();
    
    contentArray.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach(tag => {
                // Hashtag entfernen und kleinschreiben für Konsistenz
                const cleanTag = tag.replace('#', '').toLowerCase();
                allTags.add(cleanTag);
            });
        }
    });

    // 2. Sortieren (alphabetisch)
    const sortedTags = Array.from(allTags).sort();

    // 3. HTML bauen
    cloudContainer.innerHTML = ''; // Loading wegmachen
    
    sortedTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-cloud-item';
        btn.textContent = `#${tag}`;
        // Das nutzt dein existierendes Tag-System Event!
        btn.setAttribute('data-tag', tag); 
        
        // Wenn man draufklickt:
        btn.addEventListener('click', () => {
             // Da wir aktuell noch keine Suchseite haben, leiten wir auf 
             // den Strom weiter oder filtern (kommt später). 
             console.log('Tag Filter:', tag);
        });

        cloudContainer.innerHTML += ' '; // Leerzeichen
        cloudContainer.appendChild(btn);
    });
}

/* --------------------------------------------------------------------------
   GLOBAL: Hashtag Click Listener (Smart Navigation)
   -------------------------------------------------------------------------- */
function initGlobalTagListener() {
    document.body.addEventListener('click', async (e) => {
        // Prüfen, ob Hashtag oder Button in der Cloud
        if (e.target.matches('.hashtag') || e.target.matches('.tag-cloud-item') || e.target.tagName === 'X-TAG') {
            e.preventDefault(); // Standard-Link-Verhalten verhindern

            // Tag sauber extrahieren (ohne #, klein)
            const rawText = e.target.getAttribute('data-tag') || e.target.innerText;
            const tag = rawText.replace('#', '').trim().toLowerCase();

            console.log('Analysiere Ziel für Tag:', tag);

            try {
                // Daten holen um zu prüfen, wie viele Treffer wir haben
                const data = await fetchAllData();

                // Alles in einen Topf werfen
                const allContent = [
                    ...data.posts.map(p => ({ ...p, type: 'post' })),
                    ...data.pages.map(p => ({ ...p, type: 'page' }))
                ];

                // Filtern: Welche Items haben diesen Tag?
                const hits = allContent.filter(item => {
                    if (!item.tags) return false;
                    // Array durchsuchen, case-insensitive und ohne #
                    return item.tags.some(t => t.replace('#', '').toLowerCase() === tag);
                });

                // --- ENTSCHEIDUNGSLOGIK ---

                if (hits.length === 1) {
                    // FALL A: Genau ein Treffer -> Direct Hit
                    const target = hits[0];
                    let targetUrl;

                    if (target.type === 'page' && target.url) {
                        // Es ist eine statische Seite -> Direkte URL
                        targetUrl = target.url;
                    } else {
                        // Es ist ein Blogpost -> Ab in den Strom zum Anker
                        targetUrl = `strom.html?post=${target.id}`;
                    }

                    console.log('Single Hit! Navigiere direkt zu:', targetUrl);
                    window.location.href = targetUrl;
                } 
                else if (hits.length > 1) {
                    // FALL B: Mehrere Treffer -> Ab zum Hub mit Filter
                    console.log(`Multi Hit (${hits.length})! Navigiere zum Hub.`);
                    window.location.href = `themen.html?tag=${tag}`;
                } 
                else {
                    // Fall C: Nichts gefunden
                    console.warn(`Keine Einträge für #${tag} gefunden.`);
                    alert(`Keine Einträge für #${tag} gefunden.`);
                }

            } catch (error) {
                console.error("Fehler beim Abrufen der Tag-Daten:", error);
            }
        }
    });
}

