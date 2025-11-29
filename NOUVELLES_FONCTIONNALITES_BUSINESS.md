# 🚀 ReviewSpin : Outil Marketing & Fidélisation

Nous avons transformé l'application en une véritable suite marketing pour restaurants.

## 1. 🛡️ Smart Review Flow (Filtrage d'Avis)
Le système ne se contente plus de demander un avis. Il agit comme un filtre intelligent :
- **⭐⭐⭐⭐⭐ (4-5 étoiles)** : Le client est redirigé vers Google Maps pour booster votre SEO.
- **⭐⭐⭐ (1-3 étoiles)** : Le client ouvre un formulaire de feedback privé. Vous recevez la critique, mais votre note Google reste intacte.

## 2. 💎 CRM & Data Collection
L'objectif n'est pas juste de faire jouer, mais de **construire votre base client**.
- **Capture Email** : L'email est collecté avant le jeu.
- **Onglet Clients** : Dans votre admin, voyez qui sont vos meilleurs clients (fréquence de visite, gains).
- **Export CSV** : Téléchargez votre base de données en un clic pour vos campagnes marketing.

## 3. 🎟️ Gestion des Gains (Anti-Fraude)
- **Code Unique** : Chaque gain génère un code unique (ex: `X8J9-WIN`).
- **Option "Plus Tard"** : Le client peut s'envoyer le coupon par email s'il n'est pas sur place.
- **Vérification** : Le staff peut vérifier un code depuis l'admin panel.

---

## 🧪 Comment Tester le Flow Business

1. **Le Client (Vous)** :
   - Allez sur `http://localhost:3000/r/demo`
   - Mettez **3 étoiles** -> Voyez le formulaire privé.
   - Mettez **5 étoiles** -> Voyez la redirection Google.
   - Entrez votre email -> Tournez la roue.
   - Sur la page de gain, cliquez sur "Envoyer par Email".

2. **Le Patron (Admin)** :
   - Allez sur `http://localhost:3000/admin?token=demo-token`
   - Allez dans l'onglet **Customers**.
   - Cliquez sur **Export CSV**.

C'est maintenant un outil qui **rapporte de l'argent** et **protège la réputation**.
