### Prérequis
- [Git](https://git-scm.com/book/fr/v2/D%C3%A9marrage-rapide-Installation-de-Git)
- [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)
- [Node.js](https://nodejs.org/en/download/)

### Étapes

Cloner l'application :
```
$ git clone http://test-gi.ump.ma:81/sfuser/SchoolManager.git
```
Se mettre dans le dossier de l'application :
```
$ cd SchoolManager
```
Installer les dépendances de l'application :
```
$ npm install

```
Configuration de l'adress ip et de port utilisés:
```
$ nano public/config.json
puis saisir l'adress ip de votre serveur et le port que vous voulez utiliser.
```

Démarrer MongoDB quelque part :
```
Décompresser le Fichier data.tar.gz
$ tar -zxvf data.tar.gz
$ sudo service mongod stop
$ mongod --dbpath data
```
Démarrer l'application :
```
lancer un autre terminal et taper la commande:
$ node app.js
```
Puis naviguer vers http://addressip:port.<br/>
le fichier : <b>Listes_Des_Comptes.xlsx</b> contient la liste des comptes pour S'authentifié à l'application.
