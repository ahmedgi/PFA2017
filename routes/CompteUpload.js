var express    =require('express');
var path = require('path');
var router = express.Router();
var multer = require ('multer');


//-----models---------------

//pour l'upload

var storage =   multer.diskStorage({
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

router.post('/api/exemple/upload',function(req,res){
    var upload = multer(
	{ 
		storage : storage,
		//verification de xslx
		fileFilter: function (req, file, callback) {
			var ext = path.extname(file.originalname);
			if(ext !== '.xlsx' && ext !== '.xls') {
				return callback(new Error('Only Excel files are allowed'))
			}
			callback(null, true)
		}
	
	}).single('myFile');
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file or not Excel files are uploaded.");
        }
        res.end("File is uploaded");
    });
});

//operation sur le fichier 

//parser le fichier

//inserer dans la base de donnees

module.exports=router;
