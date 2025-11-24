// ========================================
// POSTS-VERWALTUNG
// Aktualisiert für neue Struktur
// ========================================

let postsData = null;

// Posts-Daten laden
async function loadPostsData() {
    if (postsData) return postsData;
    
    try {
        const response = await fetch('/api/posts.json');
        postsData = await response.json();
        return postsData;
    } catch (error) {
        console.error('Fehler beim Laden der Posts:', error);
        return { posts: [] };
    }
}

// Post-Card HTML erstellen
function createPostCard(post) {
    const tags = post.tags.map(tag => 
        `<span class="tag clickable-tag" data-tag="${tag}">${tag}</span>`
    ).join('');
    
    return `
        <article class="post-card">
            ${post.theme ? `<span class="post-theme theme-${post.theme}">${post.theme}</span>` : ''}
            <h3><a href="${post.file}">${post.title}</a></h3>
            <div class="post-meta">
                <time datetime="${post.date}">${formatDate(post.date)}</time>
            </div>
            <p>${post.excerpt}</p>
            <div class="post-tags">${tags}</div>
        </article>
    `;
}

// Datum formatieren
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
}

// Neueste Posts laden (für Startseite)
async function loadRecentPosts(containerId, limit = 5) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Sortiere nach Datum (neueste zuerst)
    const recentPosts = [...data.posts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    
    container.innerHTML = recentPosts.map(post => createPostCard(post)).join('');
    
    // Tags klickbar machen
    if (typeof initCrossSiteTags === 'function') {
        initCrossSiteTags();
    }
}

// Alle Posts laden (für Strom-Seite)
async function loadAllPosts(containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Sortiere nach Datum (neueste zuerst)
    const sortedPosts = [...data.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sortedPosts.map(post => createPostCard(post)).join('');
    
    // Tags klickbar machen
    if (typeof initCrossSiteTags === 'function') {
        initCrossSiteTags();
    }
}

// Posts nach Theme filtern
async function filterPostsByTheme(theme, containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const filteredPosts = data.posts.filter(post => post.theme === theme);
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '<p>Keine Posts in dieser Kategorie.</p>';
        return;
    }
    
    container.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
    
    // Tags klickbar machen
    if (typeof initCrossSiteTags === 'function') {
        initCrossSiteTags();
    }
}
