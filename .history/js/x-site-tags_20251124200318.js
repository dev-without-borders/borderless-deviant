// ========================================
// CROSS-SITE HASHTAG-SYSTEM
// Aktualisiert für neue Struktur
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
                        ${page.tags.map(t => `<span class="tag">${t}</span>`).join('')}
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
                        ${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                </article>
            `;
        });
        
        html += `</section>`;
    }
    
    container.innerHTML = html;
}

// Alle Tags klickbar machen auf einer Seite
function initCrossSiteTags() {
    document.querySelectorAll('.tag[data-tag], .tag').forEach(tagEl => {
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

// Auto-Init wenn Seite geladen
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrossSiteTags);
} else {
    initCrossSiteTags();
}
