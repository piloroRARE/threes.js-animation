# 🎮 Animation 3D Procédurale avec Three.js

Une animation 3D interactive utilisant la **génération procédurale** et une **texture ouattée** (Worley Noise) avec Three.js.

## ✨ Fonctionnalités

- **Terrain généré procéduralement** : Utilisation de Perlin Noise pour créer un paysage 3D organique
- **Texture ouattée** : Application de Worley Noise pour un effet nuage/marbre sur les nuages
- **Animation fluide** : Vagues sur le terrain et rotation des nuages
- **Contrôles interactifs** :
  - Rotation et zoom avec la souris (OrbitControls)
  - Régénération aléatoire du terrain et des nuages
  - Pause/Play de l'animation
  - Réglage de l'échelle du terrain
  - Réglage de la vitesse d'animation

## 📁 Structure du projet

```
threes.js-animation/
├── index.html      # Structure HTML avec interface utilisateur
├── styles.css      # Styles CSS modernes (glassmorphism)
├── script.js       # Code Three.js avec génération procédurale
└── README.md       # Documentation
```

## 🚀 Utilisation

### Méthode 1 : Ouvrir directement
Simplement ouvrez le fichier `index.html` dans votre navigateur.

### Méthode 2 : Serveur local
```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (npx)
npx serve

# Avec PHP
php -S localhost:8000
```

Puis accédez à `http://localhost:8000` dans votre navigateur.

### Méthode 3 : Déploiement
Vous pouvez déployer ce projet sur n'importe quel service d'hébergement statique :
- GitHub Pages
- Netlify
- Vercel
- Surge
- etc.

## 🎨 Technologies utilisées

- **Three.js** : Bibliothèque 3D WebGL
- **Perlin Noise** : Génération procédurale du terrain
- **Worley Noise** : Texture ouattée pour les nuages
- **HTML5/CSS3** : Interface utilisateur moderne
- **Vanilla JavaScript** : Logique d'animation

## 🔧 Algorithmes implémentés

### Perlin Noise
Algorithme de bruit procédural créé par Ken Perlin, utilisé pour :
- Générer la hauteur du terrain
- Créer des variations naturelles
- Animer les vagues sur le terrain

### Worley Noise (Cellular Noise)
Algorithme de bruit basé sur les distances aux points aléatoires, utilisé pour :
- Créer la texture ouattée (effet cellule/nuage)
- Donner un aspect organique aux nuages

## ⚙️ Contrôles

| Élément | Action |
|---------|--------|
| **Souris (clic + glisser)** | Rotation de la caméra |
| **Molette de la souris** | Zoom avant/arrière |
| **Bouton "↻ Régénérer"** | Régénère le terrain et les nuages avec un nouveau seed |
| **Bouton "⏸️ Pause/Play"** | Met en pause ou reprend l'animation |
| **Slider "Échelle du terrain"** | Ajuste la hauteur maximale du terrain |
| **Slider "Vitesse"** | Contrôle la vitesse de l'animation |

## 📱 Responsive Design

L'application s'adapte automatiquement à toutes les tailles d'écran :
- Desktop : Affichage optimal avec tous les contrôles visibles
- Tablette : Réorganisation des éléments pour un meilleur confort
- Mobile : Interface simplifiée et tactile

## 🎯 Concepts clés abordés

- ✅ **Animation 3D** : Boucle d'animation avec requestAnimationFrame
- ✅ **Génération procédurale** : Création de contenu algorithmique
- ✅ **Texture ouattée** : Worley Noise pour des motifs organiques
- ✅ **Three.js** : Utilisation avancée de la bibliothèque 3D
- ✅ **Interactivité** : Contrôles utilisateur et feedback visuel
- ✅ **Responsive** : Adaptation à différents appareils

## 🔬 Améliorations possibles

- [ ] Ajouter plus de types de bruit (Simplex, Value, etc.)
- [ ] Implémenter un système de biomes (désert, forêt, montagne)
- [ ] Ajouter des arbres/rochers générés procéduralement
- [ ] Intégrer un système de particules pour la pluie/neige
- [ ] Ajouter un mode jour/nuit avec cycle de lumière
- [ ] Implémenter un système de caméra en première personne

## 📜 Licence

Ce projet est open source sous la licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.

## 🙏 Remerciements

- [Three.js](https://threejs.org/) - Bibliothèque 3D incroyable
- [Ken Perlin](https://mrl.nyu.edu/~perlin/) - Pour l'algorithme Perlin Noise
- [Steven Worley](https://en.wikipedia.org/wiki/Worley_noise) - Pour le Worley Noise

---

**Créé avec ❤️ et Three.js**
