# Gourmetklubben i Lyon

Turnettside for Gourmetklubbens tur til Lyon og Beaujolais.

## Slik oppdaterer du innholdet

Alt innhold (program, restauranter, overnatting, transport, praktisk info og sjekkliste) ligger i **`innhold.yml`**.

1. Åpne `innhold.yml` på GitHub og trykk på blyanten («Edit this file»).
2. Endre teksten. Behold innrykket (mellomrom) som det er.
3. Trykk **Commit changes**. Siden oppdateres etter ca. ett minutt.

Ser siden tom ut etter en endring, er det nesten alltid et innrykk eller et kolon som mangler anførselstegn. Siden viser da en gul feilmelding øverst.

## Filene

| Fil | Hva |
|---|---|
| `innhold.yml` | Alt innholdet. Den eneste fila du trenger å endre. |
| `index.html` | Sidens oppsett |
| `style.css` | Utseende |
| `app.js` | Leser innhold.yml og bygger siden |
| `logo.png` | Gourmetklubben-logoen |

## Publisering med GitHub Pages

Settings → Pages → «Deploy from a branch» → `main` / `(root)` → Save. Adressen blir `https://<brukernavn>.github.io/<repo-navn>/`.
