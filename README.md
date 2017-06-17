### Prérequis
- [Git](https://git-scm.com/downloads) ([guide d'installation](https://git-scm.com/book/fr/v2/D%C3%A9marrage-rapide-Installation-de-Git))
- [MongoDB](https://www.mongodb.com/download-center#community) ([Guide d'installation](https://docs.mongodb.com/manual/administration/install-community/))
- [Node.js](https://nodejs.org/en/download/)

### Étapes

Cloner l'application :
```
$ git clone https://github.com/yassinei/PFA2017
```
Se mettre dans le dossier de l'application :
```
$ cd PFA2017
```
Installer les dépendances de l'application :
```
$ npm install
$ npm run bower-install
```
Démarrer MongoDB quelque part :
```
$ mkdir db
$ mongod --dbpath db
```
Démarrer l'application :
```
$ npm start
```
Puis naviguer vers http://localhost:8010.
