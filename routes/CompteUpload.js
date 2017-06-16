var express = require('express');
var path = require('path');
var router = express.Router();
var multer = require('multer');


//-----models---------------
var User = require("../models/databaseModels").profs;
//pour l'upload

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/app/ComptesUpload/files/')//a partir du la racine
    },
    /* limits:{
     files: 1,
     fileSize: 1024 * 1024
     ...
     }, */
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }

});

router.post('/api/exemple/upload', function (req, res) {
    var upload = multer(
        {
            storage: storage,
            //verification de xslx
            fileFilter: function (req, file, callback) {
                var ext = path.extname(file.originalname);
                if (ext !== '.xlsx' && ext !== '.xls') {
                    return callback(new Error('Only Excel files are allowed'))
                }
                callback(null, true)
            }

        }).single('myFile');
    upload(req, res, function (err) {
        if (err) {
            return res.end("Error uploading file or not Excel files are uploaded.");
        }
        if (typeof require !== 'undefined') XLSX = require('xlsx');
        var workbook = XLSX.readFile(req.file.path);

        /* DO SOMETHING WITH workbook HERE */

        var first_sheet_name = workbook.SheetNames[0];
        /* Get worksheet */
        var worksheet = workbook.Sheets[first_sheet_name];
        var data_json = XLSX.utils.sheet_to_json(worksheet, {raw: true});
        console.log("Longeur du tableau : " + data_json[0]['nom']);
        //var row = data_json[0].length;
        var longeur = data_json.length;
        /*for (var i = 0 ; i<longeur ;i++)
         {
         for (var j = 0; j < row ; j++)
         {
         console.log("valeur ["+i+"-"+j+"] du tableau : "+ data_json[i][j]);
         }
         } */
        for (var i = 0; i < longeur; i++) {
            var user = new User({
                login: data_json[i]['login'],
                nom: data_json[i]['nom'],
                prenom: data_json[i]['prenom'],
                tel: data_json[i]['tel'],
                email: data_json[i]['email'],
                grade: data_json[i]['grade'],
                security_mask: data_json[i]['security_mask'],
                password: data_json[i]['password'],
                specialite: data_json[i]['specialite'],
                matieres: [],
                modules: []
            });
            user.save(function (err) {
                if (err) throw err;
                console.log("le compte du prof : " + user.nom + " " + user.prenom + " a ete bien cree.");
            });
            for (var item in data_json[i]) {
                console.log("valeur [" + i + "-" + item + "] du tableau : " + data_json[i][item]);
            }
        }
        //2 methodes pour l'insert 
        //methode 1 direct
        /* require all mongo
         db.collection('profs').insert(data, function(error, record){
         if (error) throw error;
         console.log("data saved");
         });
         */
        //methode 2

        res.redirect('/app');
    });
});

//operation sur le fichier 

//parser le fichier

//inserer dans la base de donnees

module.exports = router;
