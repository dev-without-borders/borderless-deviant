// ========================================
// CROSS-SITE HASHTAG-SYSTEM
// ========================================

let staticPagesData = null;

// Static Pages laden
async function loadStaticPagesData() {
    if (staticPagesData) return staticPagesData;
    
    try {
        const response = await fetch('/api/static-pages.json');
        staticPagesData = await response.json();
        return staticPagesData;
    } catch (error) {
        console.error('Fehler beim Laden der Static Pages:', error);
        return { staticPages: [] };
    }
}

// Verwandte Blog-Posts für Bereich laden
async function loadRelatedPosts(tags, containerId) {
    const postsData = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Filtere Posts, die mindestens einen der Tags haben
    const relatedPosts = postsData.posts.filter(post => 
        post.tags.some(tag => tags.includes(tag))
    );
    
    if (relatedPosts.length === 0) {
        container.innerHTML = '<p>Noch keine verwandten Blog-Posts.</p>';
        return;
    }
    
    // Sortiere nach Datum
    relatedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = relatedPosts.map(post => createPostCard(post)).join('');
    
    // WICHTIG: Nach dem Einfügen Tags klickbar machen!
    initCrossSiteTags();
}

// Alle Inhalte zu einem Tag finden (Blog + Static)
async function findAllContentByTag(tag) {
    const [postsData, staticData] = await Promise.all([
        loadPostsData(),
        loadStaticPagesData()
    ]);
    
    const results = {
        blogPosts: [],
        staticPages: []
    };
    
    // Blog-Posts filtern
    results.blogPosts = postsData.posts.filter(post => 
        post.tags.includes(tag)
    );
    
    // Statische Seiten filtern
    results.staticPages = staticData.staticPages.filter(page => 
        page.tags.includes(tag)
    );
    
    return results;
}

// Themen-Seite: Zeige alle Inhalte zu einem Tag
async function showTagResults(tag, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const results = await findAllContentByTag(tag);
    
    const totalResults = results.blogPosts.length + results.staticPages.length;
    
    if (totalResults === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>Keine Inhalte mit Tag <strong>${tag}</strong> gefunden.</p>
            </div>
        `;
        return;
    }
    
    let html = `<h3>Ergebnisse für ${tag} <span class="count">(${totalResults})</span></h3>`;
    
    // Statische Seiten zuerst
    if (results.staticPages.length > 0) {
        html += `<section class="results-section">
            <h4>Themenseiten</h4>`;
        
        results.staticPages.forEach(page => {
            html += `
                <article class="result-card static-page">
                    <span class="result-type">📄 Themenseite</span>
                    <h5><a href="${page.url}">${page.title}</a></h5>
                    <p>${page.excerpt}</p>
                    <div class="result-tags">
                        ${page.tags.map(t => `<span class="tag clickable-tag" data-tag="${t}">${t}</span>`).join('')}
                    </div>
                </article>
            `;
        });
        
        html += `</section>`;
    }
    
    // Dann Blog-Posts
    if (results.blogPosts.length > 0) {
        html += `<section class="results-section">
            <h4>Blog-Posts</h4>`;
        
        results.blogPosts.forEach(post => {
            html += `
                <article class="result-card blog-post">
                    <span class="result-type">📝 Blog-Post</span>
                    <h5><a href="${post.file}">${post.title}</a></h5>
                    <div class="post-meta">
                        <time>${formatDate(post.date)}</time>
                    </div>
                    <p>${post.excerpt}</p>
                    <div class="result-tags">
                        ${post.tags.map(t => `<span class="tag clickable-tag" data-tag="${t}">${t}</span>`).join('')}
                    </div>
                </article>
            `;
        });
        
        html += `</section>`;
    }
    
    container.innerHTML = html;
    
    // WICHTIG: Nach dem Einfügen Tags klickbar machen!
    initCrossSiteTags();
}

// Alle Tags klickbar machen (auch dynamisch eingefügte!)
function initCrossSiteTags() {
    // Alle Tags mit .tag oder .clickable-tag Klasse
    document.querySelectorAll('.tag, .clickable-tag').forEach(tagEl => {
        // Verhindere Doppel-Registrierung
        if (tagEl.dataset.clickable === 'true') return;
        tagEl.dataset.clickable = 'true';
        
        tagEl.style.cursor = 'pointer';
        
        tagEl.addEventListener('click', (e) => {
            e.preventDefault();
            const tag = tagEl.dataset.tag || tagEl.textContent.trim();
            window.location.href = `/themen.html?tag=${encodeURIComponent(tag)}`;
        });
    });
}

// Helper: URL-Parameter auslesen
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Theme-Cluster auf Themen-Seite anzeigen (wenn kein Filter aktiv)
async function loadThemeClusters(containerId) {
    const [postsData, staticData] = await Promise.all([
        loadPostsData(),
        loadStaticPagesData()
    ]);
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Alle Tags sammeln
    const allTags = new Set();
    postsData.posts.forEach(post => post.tags.forEach(tag => allTags.add(tag)));
    staticData.staticPages.forEach(page => page.tags.forEach(tag => allTags.add(tag)));
    
    // Nach Anzahl sortieren
    const tagCounts = {};
    allTags.forEach(tag => {
        const blogCount = postsData.posts.filter(p => p.tags.includes(tag)).length;
        const staticCount = staticData.staticPages.filter(p => p.tags.includes(tag)).length;
        tagCounts[tag] = blogCount + staticCount;
    });
    
    const sortedTags = Array.from(allTags).sort((a, b) => tagCounts[b] - tagCounts[a]);
    
    let html = '<h3>Alle Themen</h3><div class="tag-cloud">';
    
    sortedTags.forEach(tag => {
        const count = tagCounts[tag];
        html += `
            <span class="tag tag-cloud-item clickable-tag" data-tag="${tag}" data-count="${count}">
                ${tag} <small>(${count})</small>
            </span>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
    
    // Tags klickbar machen
    initCrossSiteTags();
}

// Auto-Init wenn Seite geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrossSiteTags);
} else {
    initCrossSiteTags();
}

// Auch bei AJAX-Nachladen (z.B. wenn Posts dynamisch geladen werden)
document.addEventListener('contentLoaded', initCrossSiteTags);
