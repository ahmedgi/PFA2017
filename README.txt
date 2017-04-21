Pour pouvoir tester il faut suivre les dependences suivantes:


 1)installer Node :https://nodejs.org/dist/v4.4.0/node-v4.4.0-x86.msi

 2)installer mongodb:https://www.mongodb.org/dr/fastdl.mongodb.org/win32/mongodb-win32-x86_64-3.2.4-signed.msi/download 

 3)copier les fichiers et dossier dans un repertoir de travail. et créer le dossier "data".

 4)ouvrir un terminal en mode administrateur ,deplacez-vous dans ce repertoir (> cd chemin)

 5)tappez npm install (le fichier package.json doit exister dans le dossier)

 6)lancer dans ce terminal la base de données mongo: mongod --dbpath <chemin_du dossier data>

 7)ouvrez un autre terminal ,deplacez vous vers le repertoir du projet et lancez: >node app
    ==>l'application est maintenant demarrée.
 8)Créer les champs manuellement dans la base de données. lancer dans un terminal >mongo
	>shows dbs;
	 local 
	 test
	>use test
	>show collections
	 profs 
	 session
	 ...
	Creation des comptes
	 Pour l'administrateur :
	 >db.profs.insert({"nom" : "Admin", "prenom" : "admin", "login" : "admin" , "password" : "admin", "security_mask" : "8"});
	 Pour un chef de filière qui est aussi professeur :
	 >db.profs.insert({"nom" : "nomChefF", "prenom" : "prenomChefF", "login" : "chefF" , "password" : "chefF", "security_mask" : "3"});
	 ...
	Ce qui diffère d'un profil à un autre est le security_mask :
		si vous êtes administrateur security_mask = 8
		si vous êtes Chef de département security_mask= 4
		si vous êtes Chef de Filière security_mask = 2
		si vous êtes prof security_mask = 1
	  D'autre cas possibles:
		Si vous êtes un chef de filière et aussi un professeur security_mask 2(chefF) + 1(prof) = 3
		Si vous êtes un chef de département et aussi un professeur security_mask 4(chefD) + 1(prof) = 5
	Vous fermez le terminal du serveur mongodb quand vient de lancer
 9)ouvrir deux fenetre de deux navigateurs differents pour differencier les sessions
  (session admin(pour chef de filière) ET session normale pour les professeurs )
 10)allez dans creer un compte et creer un compte admin! puis creez d'autres comptes et telecharger les notes à partir d'un csv
  
		
		
		
		
		to do : -deliberation apres rat
		         deliberation avant rat 
			 generation listes rat
                         notifications..

for linux debien : 
install mongodb : 
   1	echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
   2    apt-get update
   3    apt-get install -y mongodb-org
install curl 
   1 apt-get install curl
install nodejs 
   1 curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
   2 apt-get install -y nodejs
