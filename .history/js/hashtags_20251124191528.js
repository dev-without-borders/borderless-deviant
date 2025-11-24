// ========================================
// HASHTAG FILTERING & CLUSTERING
// ========================================

// Tag-Filter Dropdown füllen
async function populateTagFilter(selectId) {
    const data = await loadPostsData();
    const select = document.getElementById(selectId);
    
    if (!select) return;
    
    // Alle Tags sammeln
    const allTags = new Set();
    data.posts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });
    
    // Sortieren und Options erstellen
    const sortedTags = Array.from(allTags).sort();
    
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
    });
}

// Posts nach Tag filtern
async function filterPostsByTag(tag, containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    let filteredPosts = data.posts;
    
    // Filtern wenn Tag ausgewählt
    if (tag) {
        filteredPosts = data.posts.filter(post => post.tags.includes(tag));
    }
    
    // Sortieren nach Datum
    filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredPosts.length === 0) {
        container.innerHTML = `<p>Keine Posts mit Tag "${tag}" gefunden.</p>`;
        return;
    }
    
    container.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
}

// Theme-Cluster anzeigen (für themen.html)
async function loadThemeClusters(containerId) {
    const data = await loadPostsData();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Posts nach Theme gruppieren
    const postsByTheme = {};
    
    data.posts.forEach(post => {
        if (!postsByTheme[post.theme]) {
            postsByTheme[post.theme] = [];
        }
        postsByTheme[post.theme].push(post);
    });
    
    // HTML für jeden Theme-Cluster generieren
    let html = '';
    
    for (const [themeKey, posts] of Object.entries(postsByTheme)) {
        const themeInfo = data.themes[themeKey] || { name: themeKey, description: '' };
        
        // Tags innerhalb des Themes zählen
        const tagCounts = {};
        posts.forEach(post => {
            post.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        // Tags nach Häufigkeit sortieren
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1]);
        
        const tagsHtml = sortedTags
            .map(([tag, count]) => `
                <div class="cluster-tag" data-tag="${tag}">
                    ${tag} <span class="count">(${count})</span>
                </div>
            `)
            .join('');
        
        html += `
            <section class="theme-cluster">
                <h3>${themeInfo.name}</h3>
                <p>${themeInfo.description}</p>
                <div class="cluster-tags">${tagsHtml}</div>
            </section>
        `;
    }
    
    container.innerHTML = html;
    
    // Click-Events für Tags
    container.querySelectorAll('.cluster-tag').forEach(tagEl => {
        tagEl.addEventListener('click', () => {
            const tag = tagEl.dataset.tag;
            window.location.href = `strom.html?tag=${encodeURIComponent(tag)}`;
        });
    });
}

// URL-Parameter auslesen (für Deep-Links zu Tags)
function getUrlParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Auto-Filter wenn Tag in URL (für strom.html)
window.addEventListener('DOMContentLoaded', () => {
    const tag = getUrlParameter('tag');
    if (tag && document.getElementById('tag-filter')) {
        document.getElementById('tag-filter').value = tag;
        filterPostsByTag(tag, 'posts-list');
    }
});
