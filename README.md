### Prérequis
- [Git](https://git-scm.com/downloads) ([Guide](https://git-scm.com/book/fr/v2/D%C3%A9marrage-rapide-Installation-de-Git))
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/download-center#community) ([Guide](https://docs.mongodb.com/manual/administration/install-community/))

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
