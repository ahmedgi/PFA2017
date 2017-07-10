var express = require('express');
var async = require('async')
var conEnsure = require('connect-ensure-login');
var databaseModels = require('../models/databaseModels');
var fs = require("fs");
var Docxtemplater = require('docxtemplater');
var jszip = require("jszip");
var socket = require('../socketHandler');
var router = express.Router();

var errorMessage = function (code, message) {
    return {code: code, message: message}
}
//get parametres
router.get('/parametres', function (req, res) {
    var Psend = {};
    universite.find({}).exec(function (err, param) {
        if (!err) {
            Psend.data = param;
            res.status(200).json(Psend);
        } else res.statys(500).json({err: "erreur de recuperation des parametre"});
    });
});

//{universite : String,etablissement : String,departement : String,intitulee : String,cordId : _id,eModules : []
// userId : _id }
router.post("/creeModule", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {

    console.log("create module");
    console.log("request is : " + JSON.stringify(req.body, null));
    res.setHeader('Content-Type', 'application/json');

    console.log("connection to database ");
    console.log("response is : ");
    async.waterfall([
            function (callback) {
                databaseModels.modules.find({intitulee: req.body.intitulee}, function (err, doc) {
                    if (err) return callback({code: '002', message: "database problem!", data: err})
                    if (doc.length > 0) return callback({code: '003', message: "Intitulee taken !!"});
                    callback(null);
                });
            },
            function (callback) {
                var cordid = req.body.cordId;
                if (!cordid) {
                    cordid = req.body.userId;
                }
                ;
                var module = new databaseModels.modules({
                    intitulee: req.body.intitulee,
                    code:req.body.codee,
                    universite: req.body.universite,
                    etablissement: req.body.etablissement,
                    departement: req.body.departement,
                    coordonnateur: cordid,
                    eModules: req.body.eModules,
                    createdBy: req.body.userId,
                    creationDate: new Date(),
                    lastUpdate: new Date(),
                    updatedBy: req.body.userId,
                    status: 'incomplet'
                });
                module.save(function (err) {
                    if (err) return callback({code: '002', message: "database problem!"});
                    callback(null, module._id);
                });
            },
            //-----------------------double link-------------------
            function (moduleId, callback) {
                databaseModels.modules.find({_id: moduleId})
                    .populate({path: 'eModules', model: 'eModules'})
                    .exec(function (err, mod) {
                        if (!err) {
                            async.each(mod.eModules, function (elm, done) {
                                    elm._mod = moduleId;
                                    elm.save(function (err) {
                                        if (!err) done();
                                        else done({t: 1});
                                    });
                                }
                                , function (err) {
                                    if (!err) callback(null, moduleId);
                                    else return callback({code: '128', message: "strange error !"});
                                });

                        }
                    });
            },
            //-------------------------------------------------------
            function (moduleId, callback) {
                var newNotif = new databaseModels.moduleNotif({
                    intitulee: req.body.intitulee,
                    module: moduleId,
                    prof: req.body.userId,
                    status: "unseen",
                    typee: 'cord',
                    date: new Date()
                });
                newNotif.save(function (err) {
                    if (err) return callback({code: '008', message: "prob saving notif"});
                    callback(null, newNotif._id)
                })
            },
            function (notifId, callback) {
                databaseModels.profs.findById(req.body.cordId, function (err, prof) {
                    if (!prof) {
                        callback(null)
                    }
                    else if (err) {
                        callback(null)
                    }
                    else {
                        socket.emit(req.body.cordId, 'newModuleNotif', notifId);
                        prof.addNotif(notifId, 'moduleNotif');
                        prof.save(function (err) {
                            callback(null)
                        })
                    }
                });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
               
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data}, null, '\t'));
                
            }


        }
    )

});


//{cordId : _id,eModules : []
// userId : _id 
// moduleId : _id}
router.post("/shareModule", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    console.log(req.connection.remoteAddress + " requested " + req.path);
    console.log("request is : " + JSON.stringify(req.body, null));
    res.setHeader('Content-Type', 'application/json');

    console.log("connection to database ");
    console.log("response is : ");
    async.waterfall([
            function (callback) {
                var oldCordId;
                databaseModels.modules.findById(req.body.moduleId, function (err, doc) {
                    if (err) return callback({code: '002', message: "database problem!"})
                    else if (doc.length == 0) return callback({code: '003', message: "module not existe!!"});
                    else {
                        oldCordId = doc.coordonnateur;
                        doc.setAtt('coordonnateur', req.body.cordId);
                        doc.save(function (err) {
                            if (err) return callback(err)
                            else callback(null, doc.intitulee, oldCordId);
                        })
                    }
                });
            }, function (intitulee, oldCordId, callback) {
                var newNotif = new databaseModels.moduleNotif({
                    intitulee: intitulee,
                    module: req.body.moduleId,
                    prof: req.body.userId,
                    status: "unseen",
                    typee: 'cord',
                    date: new Date()
                });
                newNotif.save(function (err) {
                    if (err) return callback({code: '008', message: "prob saving notif"});
                    socket.emit(oldCordId, 'newModuleNotif', null);
                    callback(null, newNotif._id)
                })
            },
            function (notifId, callback) {
                databaseModels.profs.findById(req.body.cordId, function (err, prof) {
                    if (!prof) {
                        callback(null)
                    }
                    else if (err) {
                        callback(null)
                    }
                    else {
                        socket.emit(req.body.cordId, 'newModuleNotif', notifId);
                        prof.addNotif(notifId, 'moduleNotif');
                        prof.save(function (err) {
                            callback(null)
                        })
                    }
                });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data}, null, '\t'))
            }


        }
    )
});


//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getModule", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    console.log("++++++++++++++++++++++++");
    res.setHeader('Content-Type', 'application/json');
    //connection a la base de donnée


    console.log("response is : ");
    async.series([
            function (callback) {
                var query = databaseModels.modules.find(req.body.searchQuery, req.body.responseFields);
                //query.populate('createdBy');
                if (req.body.populate)
                    for (var i = 0; i < req.body.populate.length; i++) {
                        query.populate(req.body.populate[i]);
                        //console.log(JSON.stringify(req.body.populate[i]))
                    }
                //.populate('updatedBy')
                //.populate({path : 'sendTo.id',select :'nom'})
                query.exec(
                    function (err, modules) {
                        if (err) return callback({code: '002', message: "database problem!!"}, null);
                        callback(null, modules);
                    });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'));
                //console.log(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'))
            }


        });

});


//{moduleId : _Id ,userId : _Id,intitulee : intitulee}
router.post("/deleteModule", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("response is : ");
    async.waterfall([
            function (callback) {
                databaseModels.modules.findById(req.body.moduleId, function (err, module) {
                    if (err) return callback({code: '002', message: "database problem!"});
                    if (!module) return callback({code: '004', message: "module doesn't exist!!"})
                    callback(null, module.coordonnateur);
                });
            },
            function (coordonnateur, callback) {
                var newNotif = new databaseModels.moduleNotif({
                    intitulee: req.body.intitulee,
                    module: req.body.moduleId,
                    prof: req.body.userId,
                    status: "unseen",
                    typee: 'delete',
                    date: new Date()
                })
                newNotif.save(function (err) {
                    if (err) return callback(errorMessage('008', 'prob saving notif'))
                    else {
                        callback(null, newNotif._id, coordonnateur)
                    }
                })
            },
            function (notifId, coordonnateur, callback) {
                databaseModels.profs.findById(coordonnateur, function (err, prof) {
                    if (!err && prof) {
                        if (prof._id != req.body.userId) {
                            socket.emit(coordonnateur, 'newModuleNotif', notifId);
                            prof.addNotif(notifId, 'moduleNotif');
                            prof.save(function (err) {
                                callback(null);
                            })

                        } else {
                            callback(null);
                        }
                    } else {
                        callback(null)
                    }
                });
            }
            ,
            function (callback) {
                databaseModels.modules.remove({_id: req.body.moduleId}, function (err) {
                    if (err) return callback({code: '002', message: "database problem!!"}, null);
                    callback(null, null);
                });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "module deleted", data: data}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data}, null, '\t'))
            }


        });


});


//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getNotif", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("response is : ");
    async.series([
            function (callback) {
                var query = databaseModels.moduleNotif.find(req.body.searchQuery, req.body.responseFields);
                //query.populate('createdBy');
                if (req.body.populate)
                    for (var i = 0; i < req.body.populate.length; i++) {
                        query.populate(req.body.populate[i]);
                        console.log(JSON.stringify(req.body.populate[i]))
                    }
                //.populate('updatedBy')
                //.populate({path : 'sendTo.id',select :'nom'})
                query.exec(
                    function (err, Notif) {
                        if (err) return callback({code: '002', message: "database problem!!"}, null);
                        callback(null, Notif);
                    });
            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'))
            }


        });

});


//{notifId : _id , status : 'seen'|'unseen'}
router.post("/updateNotif", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("response is : ");
    async.series([
            function (callback) {
                databaseModels.moduleNotif.update({_id: req.body.notifId}, {status: req.body.status}, function (err, numAffected) {
                    if (err) return callback(errorMessage('002', 'prob database notif'));
                    if (numAffected < 1) return callback(errorMessage('009', 'notif not found'));
                    callback(null, null);
                });

            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data[0]}, null, '\t'))
            }


        });

});


//{moduleId : id,userId : id,intitulee : String,universite : String,etablissement : String ,departement : String,didactique : String,status : String}
router.post('/remplireModule', conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');


    console.log("response is : ");
    async.waterfall([
            function (callback) {
                databaseModels.modules.find({intitulee: req.body.intitulee}, function (err, doc) {
                    if (err) return callback({code: '002', message: "database problem! remplireModule", data: err})
                    if (doc.length > 0 && req.body.moduleId != doc[0]._id) return callback({
                        code: '003',
                        message: "Intitulee taken !!"
                    });
                    callback(null);
                });
            },
            function (callback) {
                databaseModels.modules.findById(req.body.moduleId, function (err, module) {
                    if (err) return callback({code: '002', message: "database problem!"})
                    if (!module) return callback({code: '004', message: "eModule not found !!"});
                    callback(null, module);
                });
            },
            function (module, callback) {
                var eModules = [];
                for (var i = 0; i < req.body.eModules.length; i++) {
                    if (eModules.indexOf(req.body.eModules[i]._id) == -1) {
                        eModules.push(req.body.eModules[i]._id)
                    }
                }

                module.setAtt('intitulee', req.body.intitulee);
                module.setAtt('code', req.body.code);
                module.setAtt('universite', req.body.universite);
                module.setAtt('etablissement', req.body.etablissement);
                module.setAtt('departement', req.body.departement);
                module.setAtt('didactique', req.body.didactique);
                module.setAtt('prerequis', req.body.prerequis);
                module.setAtt('objectif', req.body.objectif);
                module.setAtt('modalitee_evaluation', req.body.modalitee_evaluation);
                module.setAtt('note', req.body.note);
                module.setAtt('lastUpdate', new Date());
                module.setAtt('updatedBy', req.body.userId);
                module.setAtt('status', req.body.status);
                module.setAtt('eModules', eModules);
                module.setAtt('note_minimal', req.body.note_minimal);
                module.save(function (err) {
                    if (err) return callback({code: '002', message: "database problem!", data: err});
                    callback(null, module.createdBy, module.coordonnateur);
                });

            },
            function (moduleCreatedBy, cordId, callback) {
                //update notif of owner
                //notif others
                var newNotif = new databaseModels.moduleNotif({
                    intitulee: req.body.intitulee,
                    module: req.body.moduleId,
                    prof: req.body.userId,
                    status: "unseen",
                    typee: 'update',
                    date: new Date()
                })
                async.waterfall([
                    function (callback) {
                        newNotif.save(function (err) {
                            if (err) return callback(errorMessage('008', 'prob saving notif'))
                            else {
                                callback(null, newNotif._id)
                            }
                        })
                    },
                    function (notifId, callback) {
                        if (moduleCreatedBy != req.body.userId) {
                            databaseModels.profs.findById(moduleCreatedBy, function (err, prof) {
                                if (!prof) {
                                    callback(null, notifId)
                                }
                                else if (err) {
                                    callback(null, notifId)
                                }
                                else {
                                    socket.emit(moduleCreatedBy, 'newModuleNotif', notifId);
                                    prof.addNotif(notifId, 'moduleNotif');
                                    prof.save(function (err) {
                                        callback(null, notifId)
                                    })
                                }
                            })
                        } else {
                            callback(null, notifId)
                        }
                    },
                    function (notifId, callback) {
                        if (cordId != req.body.userId) {
                            databaseModels.profs.findById(cordId, function (err, prof) {
                                if (!err && prof) {
                                    socket.emit(cordId, 'newModuleNotif', notifId);
                                    prof.addNotif(notifId, 'moduleNotif');
                                    prof.save(function (err) {
                                        callback(null);
                                    })
                                } else {
                                    callback(null)
                                }
                            });
                        } else {
                            callback(null)
                        }
                    }
                ], function (err, data) {
                    if (err) return callback(err)
                    callback(null, null);
                })

            }
        ],
        function (err, data) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({code: "200", message: "", data: data}, null, '\t'));
                console.log(JSON.stringify({code: "200", message: "", data: data}, null, '\t'))
            }


        }
    )


});

//{userId : _id , moduleId}
router.post('/generatePDF', conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    console.log('generating pdf ');

    async.waterfall([
            function (callback) {
                var query = databaseModels.modules.findById(req.body.moduleId);
                query.populate('coordonnateur');
                query.populate('eModules');
                query.exec(
                    function (err, module) {
                        if (err) return callback({code: '002', message: "database problem!!"});
                        callback(null, module);
                    });
            },
            function (module, callback) {
                var data = {
                    universite: '',
                    etablissement: '',
                    departement: '',
                    intitulee: '',
                    coordonnateur_nom: '',
                    coordonnateur_prenom: '',
                    coordonnateur_grade: '',
                    coordonnateur_specialite: '',
                    coordonnateur_tel: '',
                    coordonnateur_fax: '',
                    coordonnateur_mail: '',
                    prerequis: '',
                    objectif: '',
                    eModules: [
                        /*{
                         intitulee: '',
                         cour: '',
                         td: '',
                         tp: '',

                         }*/
                    ],
                    enseignementCours_total: 0,
                    enseignementTd_total: 0,
                    enseignementTp_total: 0,
                    enseignement_total: 0,
                    activites: [
                        /*{
                         libellee: '',
                         objectif: '',
                         travauxTerrain: '',
                         projet: '',
                         stage: '',
                         visiteEtude: '',
                         }*/
                    ],
                    activitesTravauxTerrain_total: 0,
                    activitesProjet_total: 0,
                    activitesStage_total: 0,
                    activitesVisiteEdute_total: 0,
                    activites_total: 0,
                    contenu: [
                        /* {
                         intitulee: '',
                         description: '',
                         }*/
                    ],
                    didactique: '',
                    modalitee_evaluation: '',
                    note: '',
                    note_minimal: '',
                }

                data.universite = module.universite;
                data.departement = module.departement;
                data.etablissement = module.etablissement;
                data.intitulee = module.intitulee;
                data.prerequis = module.prerequis;
                data.objectif = module.objectif

                if (module.coordonnateur) {
                    data.coordonnateur_nom = module.coordonnateur.nom;
                    data.coordonnateur_prenom = module.coordonnateur.prenom;
                    data.coordonnateur_grade = module.coordonnateur.grade,
                        data.coordonnateur_specialite = module.coordonnateur.specialite;
                    data.coordonnateur_tel = module.coordonnateur.tel;
                    data.coordonnateur_fax = module.coordonnateur.fax;
                    data.coordonnateur_mail = module.coordonnateur.email;
                }

                data.didactique = module.didactique;
                data.modalitee_evaluation = module.modalitee_evaluation;
                data.note = module.note;
                data.note_minimal = module.note_minimal;


                for (var i = 0; i < module.eModules.length; i++) {

                    data.enseignementCours_total += module.eModules[i].volume_horaire.cour;
                    data.enseignementTd_total += module.eModules[i].volume_horaire.td;
                    data.enseignementTp_total += module.eModules[i].volume_horaire.tp;

                    data.eModules.push({
                        intitulee: module.eModules[i].intitulee,
                        cour: module.eModules[i].volume_horaire.cour,
                        td: module.eModules[i].volume_horaire.td,
                        tp: module.eModules[i].volume_horaire.tp
                    });

                    for (var j = 0; j < module.eModules[i].activitees_pratique.length; j++) {
                        data.activitesTravauxTerrain_total += module.eModules[i].activitees_pratique[j].travaux_terrain;
                        data.activitesProjet_total += module.eModules[i].activitees_pratique[j].projet;
                        data.activitesStage_total += module.eModules[i].activitees_pratique[j].stage;
                        data.activitesVisiteEdute_total += module.eModules[i].activitees_pratique[j].visite_etude;
                        data.activites.push({
                            libellee: module.eModules[i].activitees_pratique[j].libellee,
                            objectif: module.eModules[i].activitees_pratique[j].objectif,
                            travauxTerrain: module.eModules[i].activitees_pratique[j].travaux_terrain,
                            projet: module.eModules[i].activitees_pratique[j].projet,
                            stage: module.eModules[i].activitees_pratique[j].stage,
                            visiteEtude: module.eModules[i].activitees_pratique[j].visite_etude,
                        })
                    }

                    data.contenu.push({
                        intitulee: module.eModules[i].intitulee,
                        description: module.eModules[i].description_programme,
                    })
                }

                data.enseignement_total = data.enseignementCours_total + data.enseignementTd_total + data.enseignementTp_total;
                data.activites_total = data.activitesTravauxTerrain_total + data.activitesProjet_total + data.activitesStage_total + data.activitesVisiteEdute_total;

                fs.readFile("./pdfTemplates/origin.docx", function (err, content) {
                    if (err) {
                        console.log('errour template')
                        callback(err);
                    }
                    else {
                        var zip = new jszip(content);
                        var doc=new Docxtemplater().loadZip(zip);
                        //set the templateVariables
                        doc.setData(data);
                        //apply them (replace all occurences of {first_name} by Hipp, ...)
                        doc.render();
                        var buf = doc.getZip().generate({type: "nodebuffer"});
                        fs.writeFile("./public/app/Gest-Filiere/files/" + module.intitulee + ".docx", buf, function (err) {
                            if (err) return callback(err);
                            callback(null, module.intitulee)
                        });
                    }
                });
            }
        ],
        function (err, intitulee) {
            if (err) {
                res.send(JSON.stringify(err, null, '\t'));
                console.log(JSON.stringify(err, null, '\t'))
            }
            else {
                res.send(JSON.stringify({
                    code: "200",
                    message: '',
                    data: {url: '/app/Gest-Filiere/files/' + intitulee + '.docx'}
                }, null, '\t'));
                console.log(JSON.stringify({
                    code: "200",
                    message: '',
                    data: {url: '/app/Gest-Filiere/files/' + intitulee + '.docx'}
                }, null, '\t'))
            }
        });
});
module.exports = router;
