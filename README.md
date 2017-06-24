### Prérequis
- [Git](https://git-scm.com/book/fr/v2/D%C3%A9marrage-rapide-Installation-de-Git)
- [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)
- [Node.js](https://nodejs.org/en/download/)

### Étapes

Cloner l'application :
```
$ git clone https://github.com/ahmedgi/PFA2017.git
```
Se mettre dans le dossier de l'application :
```
$ cd PFA2017
```
Installer les dépendances de l'application :
```
$ npm install
$ npm install bower -g
$ cd public
$ bower install
```
Démarrer MongoDB quelque part :
```
$ mkdir db
$ mongod --dbpath db
```
Démarrer l'application :
```
$ node app.js
```
Puis naviguer vers http://localhost:8010.
