import * as blogData from './blogData.js';
import { renderPosts } from './postRenderer.js'; // Für das Auslösen des erneuten Renderns

let activeThemes = new Set();
let activeHashtags = new Set();
let allUniqueHashtags = new Set();
let _renderPostsCallback = null; // Callback-Funktion zum Rendern von Posts

/*
 * Extrahiert alle einzigartigen Hashtags aus den gegebenen Posts.
 * @param {Array} posts - Ein Array von Post-Objekten.
 * @returns {Set<string>} Ein Set von einzigartigen Hashtags.
 */
function extractUniqueHashtags(posts) {
    const hashtags = new Set();
    posts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => hashtags.add(tag));
        }
    });
    return hashtags;
}

/*
 * Rendert Filter-Buttons für Themen und Hashtags.
 * @param {Object} allThemes - Objekt aller verfügbaren Themen.
 * @param {Set<string>} uniqueHashtags - Set aller einzigartigen Hashtags.
 */
function renderFilterButtons(allThemes, uniqueHashtags) {
    const themeFiltersContainer = document.getElementById('theme-filters');
    if (!themeFiltersContainer) {
        console.error('Container für Themenfilter nicht gefunden.');
        return;
    }
    themeFiltersContainer.innerHTML = ''; // Vorhandene Filter leeren

    // "Alle Posts" Button
    const allButton = document.createElement('button');
    allButton.classList.add('filter-button', 'all-posts-filter');
    allButton.textContent = 'Alle Posts';
    // Der Klick-Handler wird über Event Delegation in main.js behandelt.
    themeFiltersContainer.appendChild(allButton);

    // Standardmäßig ist "Alle Posts" aktiv
    allButton.classList.add('active');

    // Themenfilter
    for (const themeId in allThemes) {
        const theme = allThemes[themeId];
        const button = document.createElement('button');
        button.classList.add('filter-button', 'theme-filter');
        button.dataset.themeId = themeId;
        button.textContent = theme.name;
        themeFiltersContainer.appendChild(button);
    }

    // Hashtag-Filter
    if (uniqueHashtags.size > 0) {
        const hashtagHeader = document.createElement('h4');
        hashtagHeader.textContent = 'Hashtags';
        themeFiltersContainer.appendChild(hashtagHeader);
        // Hashtags alphabetisch sortieren
        Array.from(uniqueHashtags).sort().forEach(hashtag => {
            const button = document.createElement('button');
            button.classList.add('filter-button', 'hashtag-filter');
            button.dataset.hashtag = hashtag;
            button.textContent = `#${hashtag}`;
            themeFiltersContainer.appendChild(button);
        });
    }
}

/*
 * Initialisiert die Filter-UI und speichert die Callback-Funktion für das Rendern.
 * @param {Array} allPosts - Alle verfügbaren Posts.
 * @param {Object} allThemes - Alle verfügbaren Themen.
 * @param {function(Array): void} renderPostsCallback - Callback zum erneuten Rendern von Posts.
 */
export function initFilterUI(allPosts, allThemes, renderPostsCallback) {
    allUniqueHashtags = extractUniqueHashtags(allPosts);
    renderFilterButtons(allThemes, allUniqueHashtags);
    _renderPostsCallback = renderPostsCallback; // Callback speichern

    // Erste Filteranwendung (alle Posts anzeigen)
    applyFiltersAndRender();
}

/*
 * Schaltet den aktiven Zustand eines Filters (Thema oder Hashtag) um.
 * @param {'theme'|'hashtag'|'all'} type - Der Typ des Filters ('theme', 'hashtag' oder 'all').
 * @param {string} value - Der Wert des Filters (themeId, hashtag oder 'all' für "Alle Posts").
 * @param {HTMLElement} buttonElement - Das geklickte Button-Element.
 */
export function toggleFilter(type, value, buttonElement) {
    const allPostsFilterButton = document.querySelector('.all-posts-filter');

    if (type === 'all') {
        clearFilters();
        document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');
    } else {
        // Wenn ein anderer Filter als "Alle Posts" aktiviert wird, deaktiviere "Alle Posts"
        if (allPostsFilterButton && allPostsFilterButton.classList.contains('active')) {
            allPostsFilterButton.classList.remove('active');
        }

        const activeSet = type === 'theme' ? activeThemes : activeHashtags;
        if (activeSet.has(value)) {
            activeSet.delete(value);
            buttonElement.classList.remove('active');
        } else {
            activeSet.add(value);
            buttonElement.classList.add('active');
        }

        // Wenn nach dem Umschalten keine Filter mehr aktiv sind, aktiviere "Alle Posts"
        if (activeThemes.size === 0 && activeHashtags.size === 0) {
            allPostsFilterButton?.classList.add('active');
        }
    }

    applyFiltersAndRender();
}

/*
 * Wendet die aktuell aktiven Filter auf alle Posts an und löst ein erneutes Rendern aus.
 */
function applyFiltersAndRender() {
    const allPosts = blogData.getPosts();
    const filteredPosts = applyFilters(allPosts);
    _renderPostsCallback(filteredPosts); // Gespeicherte Callback-Funktion verwenden
}

/*
 * Löscht alle aktiven Filter.
 */
export function clearFilters() {
    activeThemes.clear();
    activeHashtags.clear();
    document.querySelectorAll('.filter-button.active').forEach(btn => btn.classList.remove('active'));
}

/*
 * Filtert ein Array von Posts basierend auf den aktuell aktiven Filtern (OR-Verknüpfung).
 * @param {Array} posts - Das zu filternde Post-Array.
 * @returns {Array} Das gefilterte Post-Array.
 */
export function applyFilters(posts) {
    if (activeThemes.size === 0 && activeHashtags.size === 0) {
        return posts; // Keine Filter aktiv, alle Posts zurückgeben
    }

    return posts.filter(post => {
        // Ein Post Matcht, wenn:
        // (keine Themenfilter aktiv ODER Post-Theme ist in aktiven Themen)
        // UND
        // (keine Hashtag-Filter aktiv ODER Post hat mindestens einen aktiven Hashtag)
        const matchesTheme = activeThemes.size === 0 || activeThemes.has(post.theme);
        const matchesHashtag = activeHashtags.size === 0 || (post.tags && post.tags.some(tag => activeHashtags.has(tag)));
        return matchesTheme && matchesHashtag;
    });
}

/*
 * Schaltet die Sichtbarkeit des Containers für Themenfilter um.
 */
export function handleFilterToggle() {
    const themeFiltersContainer = document.getElementById('theme-filters');
    if (themeFiltersContainer) {
        themeFiltersContainer.classList.toggle('is-hidden');
    }
}
