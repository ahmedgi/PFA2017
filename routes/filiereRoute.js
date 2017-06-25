var express = require('express');
var async = require('async')
var conEnsure = require('connect-ensure-login');
var filiere = require('../models/databaseModels').filiere;
var Docxtemplater = require('docxtemplater');
var filiereArchive = require('../models/filierearchive.js');
var jszip = require("jszip");
var fs = require("fs");
var errorMessage = function (code, message) {
    return {code: code, message: message}
}

var okMessage = function (code, message, data) {
    return {code: code, message: message, data: data}
}


var router = express.Router();

//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getFiliere", conEnsure.ensureLoggedIn(0, "/login_", false), function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log("response is : ");
    console.log(JSON.stringify(req.body))
    async.series([
            function (callback) {
                var query = filiere.find(req.body.searchQuery, req.body.responseFields);
                //query.populate('createdBy');
                if (req.body.populate)
                    for (var i = 0; i < req.body.populate.length; i++) {
                        query.populate(req.body.populate[i]);
                    }
                //.populate('updatedBy')
                //.populate({path : 'sendTo.id',select :'nom'})
                query.exec(
                    function (err, profs) {
                        if (err) return callback({code: '002', message: "database problem!!"}, null);
                        callback(null, profs);
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

//{intitulee : String,cordId : _id,
// userId : _id }
router.post("/creeFiliere", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {

    console.log(req.connection.remoteAddress + " requested " + req.path);
    console.log("request is : " + JSON.stringify(req.body, null));
    res.setHeader('Content-Type', 'application/json');

    console.log("connection to database ");
    console.log("response is : ");
    async.waterfall([
            function (callback) {
                filiere.find({intitulee: req.body.intitulee}, function (err, doc) {
                    if (err) return callback({code: '002', message: "database problem!", data: err})
                    if (doc.length > 0) return callback({code: '003', message: "Intitulee taken !!"});
                    callback(null);
                });
            },
            function (callback) {
                var newfiliere = new filiere({
                    intitulee: req.body.intitulee,
                    createdBy: req.body.userId,
                    responsable: req.body.cordId,
                    status: 'incomplet'
                });
                newfiliere.save(function (err) {
                    if (err) return callback({code: '002', message: "database problem!"});
                    callback(null, module._id);
                });
            },
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


//{filiereId : _Id ,userId : _Id,intitulee : intitulee,status : String}
router.post("/deleteFiliere", conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    console.log("response is : ");
    filiere.find({_id:req.body.filiereId},function(err,doc){
        if(err)
            console.log("aucun filiere trouver");
        else{
            var filiereArchiv=new filiereArchive({
                intitulee: doc[0].intitulee+doc[0].creationDate.getFullYear(),
                annee1: doc[0].annee1,
                annee2: doc[0].annee2,
                annee3: doc[0].annee3,
                createdBy:doc[0].createdBy ,
                responsable: doc[0].responsable,
                creationDate:doc[0].creationDate,
            });
            console.log(filiereArchiv);
            filiereArchiv.save(function(err){
                if(err){
                    console.log("erreur d'archivage de la filiere");}
                    else{
                        console.log("la filiere est bien archivé");
                              filiere.remove({_id : req.body.filiereId},function(err){
                                  if (err){
                                     res.send(JSON.stringify({code : "001",message:"database Prob",data :'' },null,'\t'));
                                     console.log(JSON.stringify({code : "001",message:"database Prob",data :'' },null,'\t'));
                                  }
                                  else{
                                     res.send(JSON.stringify({code : "200",message:"",data :'' },null,'\t'));
                                     console.log(JSON.stringify({code : "200",message:"",data :'' },null,'\t'));
                                  }
                              });
                        }
            });
        }
    });

});


//{filiereId : id,userId : id,intitulee : Sting,annee1 : {},annee2 : {},annee3 : {}}
router.post('/editeFiliere', conEnsure.ensureLoggedIn(0, "/login_", true), function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    console.log("response is : ");
    async.waterfall([
            function (callback) {
                filiere.find({intitulee: req.body.intitulee}, function (err, doc) {
                    if (err) return callback({code: '002', message: "database problem! remplireFiliere", data: err})
                    if (doc.length > 0 && req.body.filiereId != doc[0]._id) return callback({
                        code: '003',
                        message: "Intitulee taken !!"
                    });
                    callback(null);
                });
            },
            function (callback) {
                filiere.findById(req.body.filiereId, function (err, filiere) {
                    if (err) return callback({code: '002', message: "database problem!"})
                    if (!filiere) return callback({code: '004', message: "Filiere not found !!"});
                    callback(null, filiere);
                });
            },
            function (filiere, callback) {
                var annee1 = {s1: [], s2: []};
                var annee2 = {s1: [], s2: []};
                var annee3 = {s1: [], s2: []};

                for (var i = 0; i < req.body.annee1.s1.length; i++) {
                    if (annee1.s1.indexOf(req.body.annee1.s1[i]._id) == -1) {
                        annee1.s1.push(req.body.annee1.s1[i]._id)
                    }
                }
                for (var i = 0; i < req.body.annee1.s2.length; i++) {
                    if (annee1.s2.indexOf(req.body.annee1.s2[i]._id) == -1) {
                        annee1.s2.push(req.body.annee1.s2[i]._id)
                    }
                }
                for (var i = 0; i < req.body.annee2.s1.length; i++) {
                    if (annee2.s1.indexOf(req.body.annee2.s1[i]._id) == -1) {
                        annee2.s1.push(req.body.annee2.s1[i]._id)
                    }
                }
                for (var i = 0; i < req.body.annee2.s2.length; i++) {
                    if (annee2.s2.indexOf(req.body.annee2.s2[i]._id) == -1) {
                        annee2.s2.push(req.body.annee2.s2[i]._id)
                    }
                }
                for (var i = 0; i < req.body.annee3.s1.length; i++) {
                    if (annee3.s1.indexOf(req.body.annee3.s1[i]._id) == -1) {
                        annee3.s1.push(req.body.annee3.s1[i]._id)
                    }
                }
                for (var i = 0; i < req.body.annee3.s2.length; i++) {
                    if (annee3.s2.indexOf(req.body.annee3.s2[i]._id) == -1) {
                        annee3.s2.push(req.body.annee3.s2[i]._id)
                    }
                }


                filiere.setAtt('intitulee', req.body.intitulee);
                filiere.setAtt('universite', req.body.universite);
                filiere.setAtt('etablissement', req.body.etablissement);
                filiere.setAtt('annee1', annee1);
                filiere.setAtt('annee2', annee2);
                filiere.setAtt('annee3', annee3);
                filiere.setAtt('lastUpdate', new Date());
                filiere.setAtt('status', req.body.status);
                filiere.save(function (err) {
                    if (err) return callback({code: '002', message: "database problem!", data: err});
                    callback(null);
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
// genration de la filiere
router.post('/generateDOC',function(req,res){

    console.log("request received from generate filiere");
    async.waterfall([
            function (callback) {
                var query = filiere.findById(req.body.filiereid);
                query.populate('responsable');
                query.populate('annee1.s1');
                query.populate('annee1.s2');
                query.populate('annee2.s1');
                query.populate('annee2.s2');
                query.populate('annee3.s1');
                query.exec(
                    function (err, filiere) {
                        if (err) return callback({code: '002', message: "database problem!!"});
                        console.log(filiere.annee1.s1);
                        callback(null, filiere);
                    });
            },
            function (filiere, callback) {
                var data = {
                    univnom:filiere.universite,
                    etablissement:filiere.etablissement,
                    filiereintitulle:filiere.intitulee,

                }
                filiere.annee1.s1.forEach(function(module){
                    for(i=1;i<=6;i++){
                        if(module.code.includes('M'+i)){
                            data['A1M'+i+'CODE']=module.code;
                            data['A1M'+i+'INITITULEE']=module.intitulee;
                            data['A1M1INITITULEEresp']=module.coordonnateur.nom+" "+module.coordonnateur.prenom;
                            module.eModules.forEach(function(emodule){
                                data['A3M6INITITULEEel'+i]=emodule.intitulee;
                            });
                        }
                    }
                });
                filiere.annee1.s2.forEach(function(module){
                    for(i=7;i<=12;i++){
                        if(module.code.includes('M'+i)){
                            data['A1M'+i+'CODE']=module.code;
                            data['A1M'+i+'INITITULEE']=module.intitulee;
                        }
                    }
                });
                filiere.annee2.s1.forEach(function(module){
                    for(i=1;i<=6;i++){
                        if(module.code.includes('M'+i)){
                            data['A2M'+i+'CODE']=module.code;
                            data['A2M'+i+'INITITULEE']=module.intitulee;
                        }
                    }
                });
                filiere.annee2.s2.forEach(function(module){
                    for(i=7;i<=12;i++){
                        if(module.code.includes('M'+i)){
                            console.log()
                            data['A2M'+i+'CODE']=module.code;
                            data['A2M'+i+'INITITULEE']=module.intitulee;
                        }
                    }
                });
                filiere.annee3.s1.forEach(function(module){
                    for(i=1;i<=6;i++){
                        if(module.code.includes('M'+i)){
                            data['A3M'+i+'CODE']=module.code;
                            data['A3M'+i+'INITITULEE']=module.intitulee;
                        }
                    }
                });
                fs.readFile("./pdfTemplates/Descriptif_filiere.docx", function (err, content) {
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
                        fs.writeFile("./public/app/Gest-Filiere/files/" + filiere.intitulee + ".docx", buf, function (err) {
                            if (err) return callback(err);
                            callback(null, filiere.intitulee)
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
