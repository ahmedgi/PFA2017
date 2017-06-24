var express = require('express');
var adminrouter = express.Router();
var async = require('async');
var conEnsure = require('connect-ensure-login');
var nodemailer = require('nodemailer');
var multer = require('multer');
var fs = require('fs');
var xlsx = require("xlsx");
//adminrouter.use(multer({dest: './public/app/images/'}).any());
//-----models---------------
var User = require("../models/databaseModels").profs;
var eModule = require("../models/databaseModels").eModule;
var filiereArchive = require('../models/filierearchive.js');
var Rat = require("../models/rattrappage");
var Matiere = require("../models/Matiere");
var Notes = require("../models/Notes");
var ModuleAnnee = require("../models/Module");
var AnneeScolaire = require("../models/AnneeScolaire");
var dbModel = require("../models/databaseModels");
var universite = require("../models/databaseModels").universite;

//==================================creer un compte=======================================


adminrouter.post('/create' /* ,conEnsure.ensureLoggedIn(2,"/login") */, function (req, res) {
    if(req.files){
        console.log(req.files.file.name);
        req.files.file.mv("./public/app/images/"+req.body.username+".png",function(err){
            if(err)
                console.log("erreur saving");
            console.log("file saved succefully");
        });
    }
    var mask = 0;
    if (req.body.maskprof)
        mask = mask + 1;
    if (req.body.maskchefFil)
        mask = mask + 2;
    if (req.body.maskchefDepart)
        mask = mask + 4;
    if (req.body.maskadmin)
        mask = mask + 8;

    var nom = req.body.nom,
        login = req.body.username,
        email = req.body.email,
        tel = req.body.tel,
        grade = req.body.selectedgrade,
        type = req.body.selectedtype,
        passwd = req.body.password,//req.body.passwd,
        prenom = req.body.prenom;

    var user = new User({
        login: login,
        nom: nom,
        prenom: prenom,
        tel: tel,
        email: email,
        grade: grade,
        type:type,
        security_mask: mask,
        password: passwd,
        matieres: [],
        modules: []
    });
    if(req.body.responsablestage){
        user.responsablestage=1;
    }

    User.findOne({login: login}, function (err, doc) {
        if (typeof doc != 'undefined' && doc != null) {
            if (doc.login.trim().toUpperCase() == login.trim().toUpperCase())
                res.json({err: "ce nom d'user existe déja !"});
        }
        else {
            user.save(function (err) {
                if (err) res.json({err: "vos infos ne sont pas saisies , veuillez vérifier"});
                else {
                    res.json({ok: "compte créé  correctement !"});
                }
            });
        }
    });

});

// upload compte
adminrouter.post('/upload',function(req,res){
    console.log('file uploaded');
    console.log(req.files.myfile.name);

    var workbook = xlsx.read(req.files.myfile.data);
    var first_sheet_name = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[first_sheet_name];
    var profs_raw = xlsx.utils.sheet_to_json(worksheet);
    console.log(profs_raw);

    if(profs_raw.length==0){
        res.json({err: "veuillez vérifier la structure de fichier excel"});
        console.log("veuillez vérifier la structure de fichier excel");
    }else{
        if(!profs_raw[0]["Username"] && !profs_raw[0]["Nom"] && !profs_raw[0]["Prénom"] && !profs_raw[0]["Email"]){
             console.log("veuillez vérifier la structure de fichier excel");
             res.json({err: "veuillez vérifier la structure de fichier excel"});
        }else{
            profs_raw.forEach(function (prof_raw) {
                var mask=0;
                if(prof_raw["Role"].includes("prof")){
                    mask++;
                };
                if(prof_raw["Role"].includes("fili")){
                    mask=mask+2;
                };
                if(prof_raw["Role"].includes("depart")){
                    mask=mask+4;
                };
                if(prof_raw["Role"].includes("admin")){
                    mask=mask+8;
                };
                var user = new User({
                login: prof_raw["Username"],
                nom: prof_raw["Nom"],
                prenom: prof_raw["Prénom"],
                email: prof_raw["Email"],
                security_mask:mask,
                type:prof_raw["Type"],
                password:"passwd"
                });
                User.findOne({login: user.login}, function (err, doc) {
                    if (typeof doc != 'undefined' && doc != null) {
                        if (doc.login.trim().toUpperCase() == user.login.trim().toUpperCase())
                           console.log("ce nom d'user existe déja !");
                    }
                    else {
                        user.save(function (err) {
                            if (err) console.log("vos infos ne sont pas saisies , veuillez vérifier");
                            else {
                                console.log("compte créé  correctement !");
                            }
                        });
                    }
                });

            });
            res.json({ok: "les comptes sont créés  correctements !"});
            }
        }



});

// create parametre

adminrouter.post('/createuniv', function (req, res) {
    console.log('req from univ received');
    var nom = req.body.nom;
    var abrev = req.body.abrev;
    var etab = req.body.etablissements;
    var dep = req.body.departements;
    var univ = new universite({
        nom: nom,
        abrev: abrev,
        departements: dep,
        etablissements: etab
    });

    universite.findOne({nom: nom}, function (err, doc) {
        if (typeof doc != 'undefined' && doc != null) {
            if (doc.nom.trim().toUpperCase() == nom.trim().toUpperCase())
                res.json({err: "Ce nom d'université existe déja !"});
        }
        else {
            univ.save(function (err) {
                if (err) res.json({err: "Vos infos ne sont pas saisies, veuillez vérifier."});
                else {
                    res.json({ok: "Paramètre créé correctement !"});
                    /* mailOptions.to=email;
                     transporter.sendMail(mailOptions,function(err,info){
                     if(!err) res.json({ok:"compte créé ! -info:"+info.response});
                     else res.json({err:"une erreur s'est produite"+JSON.stringify(err)});
                     });*/
                }
            });
        }
    });


});

//---------get prof list-----------------------------------

adminrouter.get('/profs', /* conEnsure.ensureLoggedIn(2,"/login_"), */function (req, res) {
    var tsend = {};
    User.find({},
        {
            _id: 1,
            nom: 1,
            prenom: 1,
            tel: 1,
            email: 1,
            grade: 1,
            login: 1,
            security_mask: 1
        }).exec(function (err, profs) {
        if (!err) {
            tsend.data = profs;
            console.log("les profs :\n " + JSON.stringify(tsend));
            res.status(200).json(tsend);
        }
        else res.status(500).json({err: ""});
    });
});
// recuperer la liste des paramètres

adminrouter.get('/parametres', function (req, res) {
    var Psend = {};
    universite.find({}).exec(function (err, param) {
        if (!err) {
            Psend.data = param;
            res.status(200).json(Psend);
        } else res.statys(500).json({err: "erreur de recuperation des parametre"});
    });
});
//get le listes des filieres archivées
adminrouter.get('/archivelist', function (req, res) {
    var Psend = {};
    console.log("request from archive received");
    filiereArchive.find({}).exec(function (err, param) {
        if (!err) {
            Psend.data = param;
            res.status(200).json(Psend);
        } else res.statys(500).json({err: "erreur de recuperation des archive"});
    });
});
adminrouter.post('/reactiverfiliere',function(req,res){
    console.log("posted by reactivat");
    console.log(req.body);
    var filiere=new dbModel.filiere({
                intitulee: req.body.intitulee,
                annee1: req.body.annee1,
                annee2: req.body.annee2,
                annee3: req.body.annee3,
                createdBy:req.body.createdBy ,
                responsable: req.body.responsable,
                creationDate:req.body.creationDate,
            });
    filiere.save(function(err){
        if(err){
            res.json({err:"erreur de l'activation de la filiere"});
            console.log("erreru lors d'ctivation");}
        else{
            res.json({ok:"la filiere est bien activer"});
            console.log("la filiere est bien activer");
        }
    });
});
//-----------get-Subject-List------------------------------
adminrouter.get('/matieres', /*conEnsure.ensureLoggedIn(2,"/login_"),*/function (req, res) {
    var tsend = {};
    var ijson = {};
    tsend.matieres = [];

    /* async.waterfall([function(callback){
     Matiere.find()
     },],function(err,result){

     });*/
    AnneeScolaire.findOne({active: true}, function (err, annee) {
        if (err) res.json({"err": "erroor"});
        if (annee) {
            console.log(annee);
            Matiere.find({_anneeScolaire: annee._id}/*,
             {
             _id:1,
             nom:1,
             _ens:1,
             _mod:1
             }*/)
                .populate(
                    {
                        path: "_ens",
                        model: "prof",
                        select: "login"
                    })
                .populate(
                    {
                        path: "_mod",
                        model: "ModuleAnnee",
                        // select:"nom"
                    }
                ).populate(
                {
                    path: "_anneeScolaire",
                    model: "AnneeScolaire"
                }
            ).populate(
                {
                    path: "_ref",
                    model: "eModules"
                }
            )
                .exec(function (err, mats) {

                    if (!err) {
                        async.each(mats, function (mat, done) {

                                ijson.id = mat._id;
                                ijson.nom = (mat._ref && mat._ref.intitulee) ? mat._ref.intitulee : "indefine";
                                ijson.idProf = (mat._ens) ? mat._ens._id : 0;
                                ijson.nomProf = (mat._ens) ? mat._ens.login : "non affecté";
                                ijson.module = (mat._mod.nom) ? mat._mod.nom : "non affecté";
                                //ijson.module  ="aaaa";
                                ijson.idModule = (mat._mod) ? mat._mod._id : 0;
                                ijson.annee = (mat._mod.niveau) ? mat._mod.niveau : 0;
                                tsend.matieres.push(ijson);
                                ijson = {};
                                done();
                            },
                            function (err) {
                                if (err) res.status(500).json({err: ' server internal error'});
                            }
                        );
                        res.status(200).json(tsend);
                    } else res.status(500).json({err: "can not get matieres !"});
                });
        }

    })
});

//projet :nodemailerPro


adminrouter.post("/admin_data", /* conEnsure.ensureLoggedIn(8,"/login"), */function (req, res) {
    console.log("789789#" + JSON.stringify(req.body))
    try {
        var mask = req.body.security_mask;
        var mr = new RegExp(/^[0-9]{1,2}$/);
        if (!mask || !mr.test(mask)) {
            res.json({err: "impossible de modifier"});
        }
        else {
            mask = parseInt(mask);
            User.update({_id: req.body._id}, {$set: {"security_mask": mask}}, function (err, r) {
                if (!err) res.json({ok: "mask successfully modified !"});
                else res.status(500).json({err: "internal server error"});
            });

        }
    } catch (NumberFormatException) {
        res.json({err: "vous ne pouvez pas modifier !"});
    }
});

//delete the parametres
adminrouter.post("/delete_param", function (req, res) {
    universite.remove({_id: req.body._id}, function (err, param) {
        if (!err) {
            res.json({ok: "le parametre est bien suprimer"});
        } else res.json({err: "erreur lors de la supression"});
    });
});

// delete User
adminrouter.post("/delete_user", function (req, res) {
    console.log("pppp" + JSON.stringify(req.body))
    User.findOne({_id: req.body.user_id}, function (err, user) {
        if (!err && user) {
            async.parallel([
                //-----détacher les matières----------
                function (matDone) {
                    if (user.matieres && user.matieres.length) {
                        Matiere.update({_ens: req.body.user_id}, {$set: {_ens: null}}, {multi: true}, function (err, mats) {
                            if (!err) matDone(null);
                            else matDone({err: "unknown error while deleting !"});
                        });
                    } else  matDone(null);
                },
                //-----détacher les modules-----------
                function (modDone) {
                    if (user.modules && user.modules.length) {
                        Module.update({_resp: req.body.user_id}, {$set: {_resp: null}}, {multi: true}, function (err, mats) {
                            if (!err) matDone(null);
                            else matDone({err: "unknown error while deleting !"});
                        });
                    } else modDone(null);
                },
                function (callback) {
                    User.remove({_id: req.body.user_id}, function (err) {
                        if (err) return callback({code: "010", message: "Prob database !", data: ''})
                        callback(null);
                    })
                },
            ], function (err, result) {
                if (!err) res.json({ok: "user successfully removed !"});
                else res.json(err);
            });
        }
        else res.json({err: "can't remove user!!"});
    });
});

adminrouter.post("/update_user", function (req, res) {
    var nregx = new RegExp(/^[a-zA-Z_]{3,}$/),
        pnregx = new RegExp(/^[a-zA-Z_]{3,}$/),
        eregx = new RegExp(/^[^]+@gmail.com$/),
        mregx = new RegExp(/^([0-9]{1}|1[0-5])$/),
        gregx = new RegExp(/^[a-zA-Z_]{3,}$/);
    if (req.body.nom && (req.body.nom.trim() == "" || !nregx.test(req.body.nom)))
        res.json({err: "vous devez entrez un nom valide"});
    else if (req.body.prenom && (req.body.prenom.trim() == "" || !pnregx.test(req.body.prenom)))
        res.json({err: "vous devez entrez un prenom valide"});
    else if (req.body.login && (req.body.login.trim() == "" || !gregx.test(req.body.login)))
        res.json({err: "vous devez entrez un username valide"});
    else if (req.body.email && !eregx.test(req.body.email)) {
        res.json({err: "email invalide !!"});
    } else {
        User.findOne({_id: req.body._id}, function (err, user) {
            if (err) res.json({err: "error database!!"})
            else if (!user) res.json({err: "error user not found!!"})
            else {
                user.setAtt('nom', req.body.nom);
                user.setAtt('prenom', req.body.prenom);
                user.setAtt('email', req.body.email);
                user.setAtt('tel', req.body.tel);
                user.setAtt('login', req.body.login);
                user.save(function (err) {
                    if (err) res.json({err: "saving prof Prob"})
                    else  res.json({ok: "prof updated"})
                })
            }
        })
    }

});

//---------------------Annee Scolaire----------------------------
adminrouter.get('/anneeScolaire', function (req, res) {

    AnneeScolaire.find({}).populate({
        path: "filliere",
        model: "filiere",
        select: "intitulee"
    }).exec(function (err, anneeData) {
        if (!err) {
            console.log("---------" + anneeData + "----------------");
            res.status(200).json(anneeData);
        }
    });

});

function exportData(filliereIDs, callback) {


}

function ImportData(modules, callback) {

}


adminrouter.post('/creeAnneeScolaire', function (req, res) {
    if (req.body.description && req.body.annee && req.body.fillieres) {

        var annee = new AnneeScolaire(req.body);

        async.waterfall([function (callback) {
                //----recuperer tous data des filliere pour trouver les modules
                dbModel.filiere.find({_id: {$in: req.body.fillieres}})
                    .populate([{

                        path: "annee1.s1",
                        model: "modules"
                    }, {
                        path: "annee1.s2",
                        model: "modules"
                    }, {

                        path: "annee2.s1",
                        model: "modules"

                    }, {
                        path: "annee2.s2",
                        model: "modules"
                    }, {

                        path: "annee3.s1",
                        model: "modules"

                    }, {
                        path: "annee3.s2",
                        model: "modules"
                    }])
                    .exec(function (err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, result);
                        }

                    });
            }, function (data, callback) {
                //remplire la collection modules
                console.log("-----0" + JSON.stringify(data, null, "\t"));
                async.each(
                    data,
                    function (filiere, callback) {
                        async.parallel([
                                //--------- annee 1 s1
                                function (callback) {
                                    async.each(
                                        filiere.annee1.s1,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 1,
                                                semestre: 1,
                                                filliere: filiere._id,
                                                liste: []
                                            });
                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    setTimeout(function () {
                                                        console.log("#################################")
                                                        console.log(JSON.stringify(eModule, null, '\t'));
                                                    }, 300)
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 1,
                                                        semestre: 1,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                },
                                //-----------annee 1 S2---------------
                                function (callback) {
                                    async.each(
                                        filiere.annee1.s2,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 1,
                                                semestre: 2,
                                                filliere: filiere._id,
                                                liste: []
                                            });

                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 1,
                                                        semestre: 2,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                },
                                //--------- annee 2 s1
                                function (callback) {
                                    async.each(
                                        filiere.annee2.s1,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 2,
                                                semestre: 1,
                                                filliere: filiere._id,
                                                liste: []
                                            });

                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 2,
                                                        semestre: 1,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                },
                                //-----------annee 2 S2---------------
                                function (callback) {
                                    async.each(
                                        filiere.annee2.s2,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 2,
                                                semestre: 2,
                                                filliere: filiere._id,
                                                liste: []
                                            });

                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 2,
                                                        semestre: 2,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                },
                                //--------- annee 3 s1
                                function (callback) {
                                    async.each(
                                        filiere.annee3.s1,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 3,
                                                semestre: 1,
                                                filliere: filiere._id,
                                                liste: []
                                            });

                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 3,
                                                        semestre: 1,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                },
                                //-----------annee 3 S2---------------
                                function (callback) {
                                    async.each(
                                        filiere.annee3.s2,
                                        function (module, callback) {
                                            var md = new ModuleAnnee({
                                                _resp: module.coordonnateur,
                                                _anneeScolaire: annee._id,
                                                _ref: module._id,
                                                nom: module.intitulee,
                                                niveau: 3,
                                                semestre: 2,
                                                filliere: filiere._id,
                                                liste: []
                                            });

                                            async.each(
                                                module.eModules,
                                                function (eModule, callback) {
                                                    var matiere = new Matiere({
                                                        _mod: md._id,
                                                        niveau: 3,
                                                        semestre: 2,
                                                        _ref: eModule,
                                                        _anneeScolaire: annee._id,
                                                        _filiere: filiere
                                                    });

                                                    matiere.save(function (err) {
                                                        if (err) callback(err);
                                                        else {
                                                            md.liste.push(matiere._id);
                                                            callback(null);
                                                        }
                                                    });
                                                },
                                                function (err) {
                                                    if (err) return callback(err)
                                                    else {
                                                        md.save(function (err) {
                                                            callback(null)
                                                        })
                                                    }
                                                }
                                            );
                                        },
                                        function (err) {
                                            if (err) return callback(err, null)
                                            else callback(null)
                                        }
                                    );
                                }
                            ],
                            function (err, data) {
                                if (err) return callback(err)
                                else
                                    callback(null)
                            });
                    },
                    function (err) {
                        if (err) return callback(err)
                        callback(null)
                    }
                );
            }],
            function (err, d) {
                annee.save(function (err) {
                    if (err) {
                        res.json({"err": "save err"});
                    } else {
                        res.json({"ok": "ok save success !"});
                    }
                });
            });
    }

});

adminrouter.get('/getFillieres', function (req, res) {

    dbModel.filiere.find({createdBy: req.user._id}, "intitulee", function (err, result) {
        if (err) {
            res.json({"err": "err get fillieres"});
        } else {
            console.log("-------" + result);
            res.json(result);
        }
    });
});

adminrouter.post('/changeActiveTo', function (req, res) {
    console.log(req.body.id);
    async.series([function (callback) {
        AnneeScolaire.findOneAndUpdate({active: true}, {active: false}, {upsert: true}, function (err) {
            if (err) res.json({"err": "error change active"});
            callback(null);
        });
    }, function (callback) {
        AnneeScolaire.findOne({_id: req.body.id}, function (err, annee) {
            console.log(annee);
            annee.active = true;
            annee.save(function (err) {
                if (err) {
                    res.json({"err": "err change active"});
                }
                callback(null);
            });
        });
    }], function (err, result) {
        if (err) res.json({"err": "error change active"});
        res.json({"ok": "ok"});
    });

});


module.exports = adminrouter;
