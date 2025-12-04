// src/helpers.js

/*
 * Formatiert einen Datumsstring in ein lokalisiertes, lesbares Format.
 * @param {string} dateString - Der zu formatierende Datumsstring (z.B. "2025-11-27").
 * @returns {string} Der formatierte Datumsstring (z.B. "27. November 2025").
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/*
 * Lädt den vollständigen Inhalt einer statischen HTML-Post-Seite und fügt ihn in ein Zielelement ein.
 * Der Inhalt wird im DOM zwischengespeichert, um erneutes Laden zu verhindern.
 * @param {string} postId - Die ID des Posts.
 * @param {HTMLElement} targetElement - Das Element, in das der vollständige Inhalt eingefügt wird.
 * @param {function(string): Object|undefined} findPostByIdFunction - Eine Funktion, um ein Post-Objekt anhand seiner ID abzurufen.
 * @returns {Promise<void>}
 */
export async function loadFullPostContent(postId, targetElement, findPostByIdFunction) {
    try {
        const post = findPostByIdFunction(postId); // Post-Objekt über die bereitgestellte Funktion abrufen
        if (!post || !post.url) {
            targetElement.innerHTML = '<p class="error">Vollständiger Artikel nicht gefunden.</p>';
            return;
        }

        // Überprüfen, ob der Inhalt bereits geladen wurde (im DOM zwischengespeichert)
        if (targetElement.dataset.loaded === 'true') {
            // console.log(`Inhalt für ${postId} bereits geladen, wird nicht erneut abgerufen.`);
            return;
        }

        targetElement.innerHTML = '<p>Lade vollständigen Artikel...</p>'; // Ladeanzeige

        const response = await fetch(post.url);
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status} beim Laden von ${post.url}`);
        }
        const html = await response.text();

        // Ein temporäres DOM-Element erstellen, um den HTML-String zu parsen
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Den Inhalt des <article>-Tags extrahieren
        const articleContent = tempDiv.querySelector('.post-generated');

        if (articleContent) {
            targetElement.innerHTML = articleContent.innerHTML;
            targetElement.dataset.loaded = 'true'; // Inhalt als geladen markieren
        } else {
            targetElement.innerHTML = '<p class="error">Artikelinhalt im HTML nicht gefunden (Missing &lt;article&gt; tag).</p>';
        }
    } catch (error) {
        console.error(`Fehler beim Laden des vollständigen Posts ${postId}:`, error);
        targetElement.innerHTML = `<p class="error">Fehler beim Laden des Artikels: ${error.message}</p>`;
    }
}

// src/magicJump.js
import { togglePostContent } from './postRenderer.js';

/*
 * Überprüft, ob ein 'post'-Query-Parameter in der URL vorhanden ist, und expandiert/hervorhebt den entsprechenden Post.
 * @param {Array} allPosts - Alle verfügbaren Posts (zum Abrufen der Post-Daten).
 * @param {string} postContainerId - Die ID des Containers, der die Posts enthält.
 * @param {function(string, HTMLElement, function(string): Object|undefined): Promise<void>} loadFullPostContentFunc - Funktion zum Laden des vollständigen Post-Inhalts.
 */
export async function handleMagicJump(allPosts, postContainerId, loadFullPostContentFunc) {
    const urlParams = new URLSearchParams(window.location.search);
    const postIdToHighlight = urlParams.get('post');

    if (postIdToHighlight) {
        // Sicherstellen, dass Posts gerendert sind, bevor versucht wird, das Element zu finden.
        // Ein kleiner Timeout kann hier helfen, falls das Rendering noch nicht ganz abgeschlossen ist.
        await new Promise(resolve => setTimeout(resolve, 100));

        const targetPostElement = document.querySelector(`.post-card[data-post-id="${postIdToHighlight}"]`);

        if (targetPostElement) {
            const fullContentArea = targetPostElement.querySelector('.full-content-area');
            const toggleButton = targetPostElement.querySelector('.toggle-full-content');

            // Post expandieren und Inhalt laden
            await togglePostContent(postIdToHighlight, targetPostElement, fullContentArea, toggleButton, loadFullPostContentFunc);

            // Sanft zum expandierten Post scrollen
            scrollToElement(targetPostElement, -20); // Offset anpassen

            // Temporäre Hervorhebungsklasse hinzufügen
            targetPostElement.classList.add('highlight-target');
            setTimeout(() => {
                targetPostElement.classList.remove('highlight-target');
            }, 3000); // Hervorhebung nach 3 Sekunden entfernen
        } else {
            console.warn(`Post mit ID "${postIdToHighlight}" für Magic Jump nicht gefunden.`);
        }
    }
}

/*
 * Initialisiert die Funktionalität des Scroll-to-Top-Buttons.
 * @param {string} buttonId - Die ID des Scroll-to-Top-Buttons.
 */
export function initScrollToTopButton(buttonId) {
    const scrollToTopBtn = document.getElementById(buttonId);
    if (!scrollToTopBtn) {
        console.warn(`Scroll-to-Top-Button mit ID "${buttonId}" nicht gefunden.`);
        return;
    }

    // Button basierend auf der Scroll-Position anzeigen/verbergen
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Nach 300px Scrollen anzeigen
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Beim Klick sanft nach oben scrollen
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/*
 * Scrollt sanft zu einem Ziel-HTML-Element.
 * @param {HTMLElement} element - Das Element, zu dem gescrollt werden soll.
 * @param {number} [offset=0] - Ein optionaler Offset vom oberen Rand des Elements.
 */
export function scrollToElement(element, offset = 0) {
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition + offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}
