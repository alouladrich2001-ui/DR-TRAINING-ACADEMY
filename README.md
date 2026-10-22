# DR-TRAINING ACADEMY : site web

- `frontend/` : site (HTML, CSS, JavaScript)
- `backend/` : API Node.js/Express (formulaires : candidature, contact, voiture, tourisme, réservation, formation), enregistrement dans `backend/data/` + e-mail optionnel

## Lancer en local
```
cd backend
npm install
cp .env.example .env     # (Windows : copy .env.example .env)
npm start
```
Puis ouvrir http://localhost:3000

## Mettre en ligne
1. **Frontend (GitHub Pages)** : pousser ce dossier sur GitHub, puis Settings > Pages > branche `main`, dossier `/frontend` (ou copier le contenu de `frontend/` à la racine du dépôt).
2. **Backend** : déployer `backend/` sur Render, Railway ou un VPS (commande de démarrage : `npm start`). Renseigner les variables du `.env` dans l'interface de l'hébergeur.
3. Dans `frontend/script.js`, mettre l'adresse du backend dans `API_URL`, puis repousser.

## À compléter
Logo et images de l'agence (corniche, photos propres de vos véhicules), témoignages réels (rien n'est inventé).
