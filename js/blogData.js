// src/blogData.js
let allPosts = [];
let allThemes = {};


/*
 * Lädt Blog-Posts und Themen aus der API-Quelle 'api/posts.json'.
 * @returns {Promise<void>}
 * @throws {Error} Wenn das Laden der Daten fehlschlägt.
 */
export async function loadBlogData() {
    try {
        const response = await fetch('api/posts.json');
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status} beim Laden von api/posts.json`);
        }
        const data = await response.json();
        allPosts = data.posts;
        console.log('Blog-Daten erfolgreich geladen.');
    } catch (error) {
        console.error('Fehler beim Laden der Blog-Daten:', error);
        throw error; // Fehler weiterwerfen, um vom Aufrufer behandelt zu werden
    }
}

/*
 * Gibt eine Kopie aller geladenen Posts zurück.
 * @returns {Array} Ein Array von Post-Objekten.
 */
export function getPosts() {
    return [...allPosts]; // Flache Kopie zurückgeben, um externe Modifikationen zu verhindern
}


export async function loadThemeData() {
    try {
        const response = await fetch('api/themes.json');
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status} beim Laden von api/themes.json`);
        }
        const data = await response.json();
        allThemes = data.themes;
        console.log('Themen-Daten erfolgreich geladen.');
    } catch (error) {
        console.error('Fehler beim Laden der Themen-Daten:', error);
        throw error; // Fehler weiterwerfen, um vom Aufrufer behandelt zu werden
    }
}

/*
 * Gibt eine Kopie aller geladenen Themen zurück.
 * @returns {Object} Ein Objekt mit Themen-Daten.
 */
export function getThemes() {
    return { ...allThemes }; // Flache Kopie zurückgeben
}

/*
 * Findet einen Post anhand seiner ID.
 * @param {string} postId - Die ID des zu findenden Posts.
 * @returns {Object|undefined} Das Post-Objekt, wenn gefunden, ansonsten undefined.
 */
export function findPostById(postId) {
    return allPosts.find(p => p.id === postId);
}
