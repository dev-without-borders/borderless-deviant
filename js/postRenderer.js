// src/postRenderer.js
import * as utils from './utils.js';

/*
 * Erstellt ein HTML-Article-Element für einen gegebenen Post.
 * @param {Object} post - Die Post-Daten.
 * @returns {HTMLElement} Das erstellte Article-Element.
 */
function createPostElement(post) {
    const article = document.createElement('article');
    article.classList.add('post-card');
    article.dataset.postId = post.id;
    article.dataset.theme = post.theme;

    const hashtagsHtml = post.tags
        .map(tag => `<div class="hashtag" data-hashtag="${tag}">#${tag}</div>`)
        .join(' ');

    article.innerHTML = `
                <div class="post-initial-display"  style="border-width: 1px 1px 0px 1px; margin-bottom: 0px;" data-post-id="${post.id}">
                    <header class="post-header">
                        <div class="meta">
                            ${utils.formatDate(post.date)}
                            <div class="post-tags">${hashtagsHtml}</div>
                        </div>
                        <h2>${post.title}</h2>
                        <div class="post-excerpt">${post.excerpt}</div>
                    </header>
                </div>

                <div class="full-content-area" data-loaded="false">
                    <p>Lade vollständigen Artikel...</p>
                </div>

                <div class="post-initial-display" style="border-width: 0px 1px 1px 1px; margin-top: 0px;">
                    <button class="toggle-full-content">Post lesen</button>
                    <a href="${post.url}" class="direct-post-link btn" title="Zum vollständigen Beitrag">→</a>
                </div>
           
            `;
    return article;
}

/*
 * Rendert ein Array von Posts in einen angegebenen Container.
 * @param {Array} posts - Ein Array von Post-Objekten, die gerendert werden sollen.
 * @param {string} containerId - Die ID des HTML-Elements, in das die Posts gerendert werden.
 */
export function renderPosts(posts, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container mit ID "${containerId}" nicht gefunden.`);
        return;
    }
    container.innerHTML = ''; // Vorhandene Posts leeren

    if (posts.length === 0) {
        container.innerHTML = '<p class="no-posts-found">Keine Posts gefunden, die den aktuellen Filtern entsprechen.</p>';
        return;
    }

    // 🔥 SORTIERUNG: Neueste zuerst (nach timestamp)
    const sortedPosts = [...posts].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    posts.forEach(post => {
        const postElement = createPostElement(post);
        container.appendChild(postElement);
    });
}

/*
 * Schaltet den erweiterten Zustand einer Post-Card um und lädt bei Bedarf den Inhalt.
 * @param {string} postId - Die ID des umzuschaltenden Posts.
 * @param {HTMLElement} postCardElement - Das <article>-Element, das die Post-Card darstellt.
 * @param {HTMLElement} fullContentArea - Das Div, in dem der vollständige Inhalt angezeigt wird.
 * @param {HTMLElement} toggleButton - Der Button, der den Inhalt umschaltet.
 * @param {function(string, HTMLElement, function(string): Object|undefined): Promise<void>} loadFullPostContentFunc - Funktion zum Laden des vollständigen Post-Inhalts.
 * @returns {Promise<void>}
 */
export async function togglePostContent(postId, postCardElement, fullContentArea, toggleButton, loadFullPostContentFunc) {
    const isExpanded = postCardElement.classList.toggle('is-expanded');

    if (isExpanded) {
        toggleButton.textContent = 'Post schließen';
        // Kurze Verzögerung, um CSS-Transitionen vor dem Laden des Inhalts zu ermöglichen
        await new Promise(resolve => setTimeout(resolve, 50));
        await loadFullPostContentFunc(postId, fullContentArea);
        // Nach dem Laden des Inhalts max-height anpassen, um den Inhalt aufzunehmen
        fullContentArea.style.maxHeight = fullContentArea.scrollHeight + 'px';
    } else {
        toggleButton.textContent = 'Post lesen';
        fullContentArea.style.maxHeight = '0'; // Zusammenklappen durch Setzen auf 0
    }
}
