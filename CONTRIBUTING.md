# Workflow Git & Contribution

Nous utilisons un workflow professionnel basé sur des branches pour assurer la stabilité de la production.

## Branches Principales

- **`main`** : 🔴 **PRODUCTION**. Ne jamais push directement ici. Cette branche est déployée automatiquement sur Vercel. Elle doit toujours être stable.
- **`develop`** : 🟡 **DÉVELOPPEMENT**. C'est la branche d'intégration. Toutes les nouvelles fonctionnalités arrivent ici d'abord pour être testées.

## Comment travailler (Cycle de vie)

### 1. Commencer une nouvelle tâche
Créez toujours une branche à partir de `develop` :
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-nouvelle-feature
```

### 2. Travailler
Faites vos modifications, commits, etc.
```bash
git add .
git commit -m "feat: ajout de la super fonction"
```

### 3. Partager
Envoyez votre branche sur GitHub :
```bash
git push origin feature/ma-nouvelle-feature
```

### 4. Fusionner (Pull Request)
Sur GitHub, ouvrez une **Pull Request (PR)** de `feature/ma-nouvelle-feature` vers `develop`.
Une fois validée et mergée dans `develop`, la fonctionnalité est en "pre-prod".

### 5. Mettre en Production
Quand `develop` est stable et prêt à être publié :
Ouvrez une **Pull Request** de `develop` vers `main`.
Une fois mergée, Vercel déploie la nouvelle version en production.

## Résumé des commandes
- `git checkout develop` : Revenir sur le dev.
- `git pull` : Récupérer les dernières modifs.
- `git checkout -b nom-branche` : Créer une branche.
