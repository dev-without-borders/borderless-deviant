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

