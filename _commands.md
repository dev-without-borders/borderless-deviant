# Dateistruktur

```powershell
Get-ChildItem -Recurse |
   Where-Object { $_.FullName -notmatch '(node_modules|\.history|api_backup)' } |
   ForEach-Object { $_.FullName -replace [regex]::Escape($PWD), '.' }
```

# start script
npm run deploy

# 2do
- SETUP.md für neo-deploy
- .env safe?
- p indent überarbeiten
- größe überschriften und post-card titel?
- klickbare zonen farblich abheben
- bei json-updater: alle felder vergleichen
- zeit für reihenfolge hinzufügen

-> obsidian
- wenn template eingefügt -> nach BLOG_DRAFT
- wenn template aus dem nichts erstellt -> in BLOG_DRAFT


$ neocities

|\---/|
| o_o |   Neocities
 \_-_/

Subcommands:
  push        Recursively upload a local directory to your site
  upload      Upload individual files to your Neocities site
  delete      Delete files from your Neocities site
  list        List files from your Neocities site
  info        Information and stats for your site
  logout      Remove the site api key from the config
  
  
neocities push
Lädt alle Dateien im aktuellen Ordner hoch.
cd mein-blog && neocities push

neocities push index.html
Lädt nur index.html hoch.
neocities push index.html style.css

neocities push --delete
Löscht Dateien auf Neocities, die lokal gelöscht wurden.
neocities push --delete

neocities info
Zeigt Infos zu deiner Site (Speicher, etc.).
neocities info

            // Initialer HTML-Aufbau: Nur Excerpt anzeigen, aber mit voller Link und Toggle-Button
            article.innerHTML = `
                <div class="post-initial-display" data-post-id="${post.id}">
                    <header class="post-header">
                        <div class="meta">
                            ${formatDate(post.date)}
                            <div class="post-tags">${tagsHtml}</div>
                        </div>
                        
                        <h3>${post.title}</h2>
                        <div class="post-excerpt">${post.excerpt}</div>
                    </header>

                    <div class="full-content-area ${isHighlightTarget ? 'is-expanded' : ''}">
                        ${isHighlightTarget ? '<p>Lade vollständigen Artikel...</p>' : ''}
                    </div>

                    <button class="toggle-full-content" data-post-id="${post.id}">
                        Artikel ${isHighlightTarget ? 'schließen' : 'lesen'}
                    </button>
                    <a href="${post.url}" class="direct-post-link btn" title="Zum vollständigen Beitrag">→</a>
                </div>                
                <hr>
            `;