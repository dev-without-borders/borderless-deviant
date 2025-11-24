// ========================================
// POSTS LADEN & VERWALTEN
// ========================================

let postsData = null;

// Posts.json laden
async function loadPostsData() {
    if (postsData) return postsData;
    
    try {
        const response = await fetch('api/posts.json');
        postsData = await response.json();
        return postsData;
    } catch (error) {
        console.error('Fehler beim Laden der Posts:', error);
        return { posts: [], themes: {} };
    }
}

// Neueste Posts anzeigen (für index.html)
async function loadRecentPosts(count, containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Sortiere nach Datum (neueste zuerst)
    const recentPosts = data.posts
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, count);
    
    if (recentPosts.length === 0) {
        container.innerHTML = '<p>Noch keine Posts vorhanden.</p>';
        return;
    }
    
    container.innerHTML = recentPosts.map(post => createPostCard(post)).join('');
}

// Alle Posts anzeigen (für strom.html)
async function loadAllPosts(containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const sortedPosts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sortedPosts.length === 0) {
        container.innerHTML = '<p>Noch keine Posts vorhanden.</p>';
        return;
    }
    
    container.innerHTML = sortedPosts.map(post => createPostCard(post)).join('');
}

// Post-Card HTML generieren
function createPostCard(post) {
    const dateFormatted = new Date(post.date).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const tagsHtml = post.tags
        .map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`)
        .join('');
    
    return `
        <article class="post-card">
            <h3><a href="${post.file}">${post.title}</a></h3>
            <div class="post-meta">
                <time datetime="${post.date}">${dateFormatted}</time>
            </div>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-tags">${tagsHtml}</div>
        </article>
    `;
}

// Datum formatieren
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
