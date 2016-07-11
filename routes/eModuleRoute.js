
var express = require('express');
var async = require('async')
var conEnsure= require('connect-ensure-login');
var databaseModels = require('../models/databaseModels')
var socket = require('../socketHandler');
    
var router = express.Router();

var errorMessage = function(code,message){
    return {code : code,message : message}
}

//{intitulee : String,userId : _id,sendTo : [{id : _id,permision : "r|w"}]}
router.post("/creeEmodule",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       console.log(req.connection.remoteAddress+" requested "+req.path);
       console.log("request is : "+JSON.stringify(req.body,null));
       res.setHeader('Content-Type', 'application/json');

           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.eModules.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!"})
                       if(doc.length>0) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                   var eModule = new databaseModels.eModules({
                                        intitulee : req.body.intitulee,
                                        createdBy : req.body.userId,
                                        sendTo : req.body.sendTo,
                                        creationDate : new Date(),
                                        lastUpdate : new Date(),
                                        updatedBy : req.body.userId,
                                        status : 'incomplet'
                                        });
                      eModule.save(function(err){
                           if(err) return callback({code : '002',message :"database problem!"});
                           callback(null,eModule._id);
                      });
               },function(eModuleId,callback){
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'share',
                                                                date : new Date() 
                                                             });
                   newNotif.save(function(err){
                       if(err) return callback({code : '008',message :"prob saving notif"});
                       callback(null,newNotif._id)
                    }); 
               },
               function(notifId,callback){
                   async.each(
                           req.body.sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"prof n'existe pas!"));
                               if(!err){
                                  if(prof._id != req.body.userId){
                                     socket.emit(prof._id,'newEmoduleNotif',notifId);
                                     prof.addNotif(notifId,'eModuleNotif');
                                     prof.save(function(err){
                                         //if(err) return callback(errorMessage('006','erreur add notif to prof'))
                                         callback(null);
                                     })
                                           
                                   }else{
                                       callback(null);
                                   }
                               }else{
                                   callback(errorMessage('002','database Problem'))
                               }
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null)
                           }) 
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               
               
           }
           )
});

//{userId : id,eModuleId : _Id,sendTo : [{id : _id,permision : "r|w"}]}
router.post("/shareEmodule",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       res.setHeader('Content-Type', 'application/json');
      
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   var oldSendTo ;
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"});
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                           oldSendTo = eModule.sendTo;
                           
                           var sendTo = [];
                           var ids = [];
                           for(var i = 0; i < req.body.sendTo.length ; i++){
                               var id = req.body.sendTo[i]._id._id?req.body.sendTo[i]._id._id:req.body.sendTo[i]._id;
                               var permision = req.body.sendTo[i].permision;
                               if(ids.indexOf(id) == -1){
                                   sendTo.push({_id : id,permision : permision});
                                   ids.push(id);
                               }
                           }
                          
                           eModule.setAtt('sendTo',sendTo);
                           //eModule.appendSendTo(req.body.sendTo);
                           eModule.save(function(err){
                               if(err) return callback({code : '002',message :"database problem!"});
                               callback(null,oldSendTo);
                           });
                   });
               },
               function(oldSendTo,callback){
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'share',
                                                                date : new Date() 
                                                             });
                   newNotif.save(function(err){
                       if(err) return callback({code : '008',message :"prob saving notif"});
                       callback(null,newNotif._id,oldSendTo)
                    }); 
               },
               function(notifId,oldSendTo,callback){
                   async.each(
                           req.body.sendTo,
                           function(element,callback){
                               oldSendTo.splice(oldSendTo.indexOf(element),1);
                               databaseModels.profs.findById(element._id,function(err,prof){
                               if(!prof) return callback(errorMessage('005',"prof n'existe pas!"));
                               if(!err){
                                  if(prof._id != req.body.userId){
                                     socket.emit(prof._id,'newEmoduleNotif',notifId);
                                     prof.addNotif(notifId,'eModuleNotif');
                                     prof.save(function(err){
                                         //if(err) return callback(errorMessage('006','erreur add notif to prof'))
                                         callback(null);
                                     })
                                           
                                   }else{
                                       callback(null);
                                   }
                               }else{
                                   callback(errorMessage('002','database Problem'))
                               }
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null,oldSendTo)
                           }) 
               },
               function(oldSendTo,callback){
                   async.each(
                           oldSendTo,
                           function(element,callback){
                                socket.emit(element._id,'newEmoduleNotif',null);
                                callback(null)
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null)
                           }) 
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               
               
           }
           )
           

});

//{eModuleId : id,userId : id,intitulee : String, volume_horaire : {cour : number,td : numbeer,tp : number},
// activitees_pratique : [{libellee : String,objectif : String,travaux_terrain : number,projet : number,stage : number,visite_etude : number}
// description_programme : String,}
router.post('/remplireEmodule',conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
        res.setHeader('Content-Type', 'application/json');
       
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.eModules.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!"})
                       if(doc.length>0&&req.body.eModuleId!=doc[0]._id) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                  databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                      if(err) return callback({code : '002',message:"database problem!"})
                      if(!eModule) return callback({code : '004',message : "eModule not found !!"});
                      callback(null,eModule);
                  });
               },
               function(eModule,callback){
                   eModule.setAtt('intitulee',req.body.intitulee);
                   eModule.setAtt('volume_horaire',req.body.volume_horaire);
                   eModule.setAtt('activitees_pratique',req.body.activitees_pratique)
                   eModule.setAtt('description_programme',req.body.description_programme);                  
                   eModule.setAtt('lastUpdate',req.body.lastUpdate);                  
                   eModule.setAtt('updatedBy',req.body.updatedBy); 
                   eModule.setAtt('status',req.body.status);
                   
                   eModule.save(function(err){
                       if(err) return callback({code : '002',message:"database problem!"});
                       callback(null,eModule._id,eModule.createdBy,eModule.sendTo,req.body.userId);
                   });
                   
               },
               function(eModuleId,eModuleCreatedBy,eModuleSendTo,userId,callback){
                   //update notif of owner
                   //notif others
                   var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : userId,
                                                                status : "unseen",
                                                                typee : 'update',
                                                                date : new Date() 
                                                             })
                   async.waterfall([
                       function(callback){
                          newNotif.save(function(err){
                              if(err) return callback(errorMessage('008','prob saving notif'))
                              else{
                                  callback(null,newNotif._id)
                              }
                          })
                       },
                       function(notifId,callback){
                        if(eModuleCreatedBy != userId){
                         databaseModels.profs.findById(eModuleCreatedBy,function(err,prof){
                            if(!prof){callback(null,notifId)}
                            else if(err){callback(null,notifId)}
                            else{
                                 socket.emit(prof._id,'newEmoduleNotif',notifId);
                                 prof.addNotif(notifId,'eModuleNotif');
                                 prof.save(function(err){
                                    callback(null,notifId)
                                  })
                            }
                        })
                        }else{
                            callback(null,notifId)
                        }
                       },
                       function(notifId,callback){
                           async.each(
                           eModuleSendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   if(prof._id != userId){
                                           socket.emit(prof._id,'newEmoduleNotif',notifId);
                                           prof.addNotif(notifId,'eModuleNotif');
                                           prof.save(function(err){
                                               callback(null);
                                           })

                                   }else {
                                       callback(null);
                                   }
                               }else{
                                   callback(null)
                               }
                               });
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null);
                           })
                       },
                       function(callback){
                           databaseModels.modules.find({eModules : { $in : [eModuleId]}},'intitulee createdBy coordonnateur sendTo',function(err,modules){
                               if(modules){
                                   callback(null,modules)
                               }else{
                                   console.log("##################################################")
                                   callback(null)
                               }
                           })
                       },
                       function(modules,callback){
                           async.each(
                           modules,
                           function(module,callback){
                                       var newNotif = new databaseModels.moduleNotif({
                                                                intitulee :module.intitulee,
                                                                module : module._id,
                                                                eModule : eModuleId,
                                                                prof : userId,
                                                                status : "unseen",
                                                                typee : 'eModuleUpdate',
                                                                date : new Date() 
                                                             })
                                       var notifId = newNotif._id;
                                       async.series([
                                        function(callback){
                                            newNotif.save(function(err){
                                                if(err) return callback(errorMessage('008','prob saving notif'))
                                                else{
                                                    callback(null)
                                                }
                                            })
                                        },
                                        function(callback){
                                            databaseModels.profs.findById(module.createdBy,function(err,prof){
                                                if(!prof){callback(null)}
                                                else if(err){callback(null)}
                                                else{
                                                  if(prof._id != userId){ 
                                                    socket.emit(prof._id,'newModuleNotif',notifId);
                                                    prof.addNotif(notifId,'moduleNotif');
                                                    prof.save(function(err){
                                                        callback(null)
                                                    })
                                                    }else {
                                                        callback(null);
                                                    }
                                                }
                                            })
                                        },
                                        function(callback){
                                            databaseModels.profs.findById(module.coordonnateur,function(err,prof){
                                                if(!prof){callback(null)}
                                                else if(err){callback(null)}
                                                else{
                                                   if(prof._id != userId){ 
                                                    socket.emit(prof._id,'newModuleNotif',notifId);
                                                    prof.addNotif(notifId,'moduleNotif');
                                                    prof.save(function(err){
                                                        callback(null)
                                                    })
                                                   }else {
                                                        callback(null);
                                                    }
                                                }
                                            })
                                        },
                                        function(callback){
                                            async.each(
                                            module.sendTo,
                                            function(element,callback){
                                                databaseModels.profs.findById(element.id,function(err,prof){
                                                if(!err&&prof){
                                                    if(prof._id != userId){
                                                            socket.emit(prof._id,'newEmoduleNotif',notifId);
                                                            prof.addNotif(notifId,'eModuleNotif');
                                                            prof.save(function(err){
                                                                callback(null);
                                                            })

                                                    }else {
                                                        callback(null);
                                                    }
                                                }else{
                                                    callback(null)
                                                }
                                                });
                                            },
                                            function(err){
                                                if(err) return callback(err,null);
                                                callback(null);
                                            })
                                        }
                                    ],
                                    function(err,data){
                                        callback(null)
                                    })
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null);
                           })
                       }
                   ],function(err,data){
                       if(err) return callback(err)
                       callback(null,null);
                   })

               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               
                
           }
           )

});



//{eModuleId : _Id ,userId : _Id,intitulee : intitulee}
router.post("/deleteEmodule",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       res.setHeader('Content-Type', 'application/json');

           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.eModules.findById(req.body.eModuleId,function(err,eModule){
                       if(err) return callback({code : '002',message :"database problem!"});
                       if(!eModule) return callback({code : '004',message :"eModule doesn't exist!!"})
                       callback(null,eModule.sendTo);
                   });
               },
               function(sendTo,callback){
                           var newNotif = new databaseModels.eModuleNotif({
                                                                intitulee :req.body.intitulee,
                                                                eModule : req.body.eModuleId,
                                                                prof : req.body.userId,
                                                                status : "unseen",
                                                                typee : 'delete',
                                                                date : new Date() 
                                                             })
                          newNotif.save(function(err){
                              if(err) return callback(errorMessage('008','prob saving notif'))
                              else{
                                  callback(null,newNotif._id,sendTo)
                              }
                          })
                 },
                function(notifId,sendTo,callback){
                           async.each(
                           sendTo,
                           function(element,callback){
                               databaseModels.profs.findById(element.id,function(err,prof){
                               if(!err&&prof){
                                   if(prof._id != req.body.userId){
                                           socket.emit(prof._id,'newEmoduleNotif',notifId);
                                           prof.addNotif(notifId,'eModuleNotif');
                                           prof.save(function(err){
                                               callback(null);
                                           })

                                   }else {
                                       callback(null);
                                   }
                               }else{
                                   callback(null)
                               }
                               });
                           },
                           function(err){
                               callback(null);
                           })
                       } 
               ,
               function(callback){
                   databaseModels.eModules.remove({_id : req.body.eModuleId},function(err){
                       if(err) return callback({code : '002',message :"database problem!!"});
                       callback(null);
                   });
               },
               function(callback){
                            databaseModels.modules.find({ eModules: { $in: [req.body.eModuleId] } }, 'eModules', function (err, modules) {
                                if (modules) {
                                    callback(null, modules)
                                } else {
                                    callback(null)
                                }
                            })
                        },
                       function(modules,callback){
                           async.each(
                           modules,
                           function(module,callback){
                               module.eModules.splice(module.eModules.indexOf(req.body.eModuleId),1)
                               module.save(function(err){
                                   callback(null);
                               })       
                           },
                           function(err){
                               if(err) return callback(err,null);
                               callback(null);
                           })
                       }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"eModule deleted",data : data},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data},null,'\t'))
               }
               
               
           });
      
});


//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getEmodule",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       console.log("++++++++++++++++++++++++")
       res.setHeader('Content-Type', 'application/json');
 
           console.log("response is : ");
           async.series([
               function(callback){
                  var query =  databaseModels.eModules.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                       console.log(JSON.stringify(req.body.populate[i]))
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,eModules){
                       if(err) return callback({code : '002',message :"database problem!!"},null);
                        callback(null,eModules);
                   });
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               
               
           });
});



//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getNotif",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       res.setHeader('Content-Type', 'application/json');

           console.log("response is : ");
           async.series([
               function(callback){
                  var query =  databaseModels.eModuleNotif.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                       console.log(JSON.stringify(req.body.populate[i]))
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,Notif){
                       if(err) return callback({code : '002',message :"database problem!!"},null);
                        callback(null,Notif);
                   });
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               
               
           });

});


//{notifId : _id , status : 'seen'|'unseen'}
router.post("/updateNotif",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       res.setHeader('Content-Type', 'application/json');

           console.log("response is : ");
           async.series([
               function(callback){
                 databaseModels.eModuleNotif.update({_id : req.body.notifId},{status : req.body.status},function(err,numAffected){
                     if(err) return callback(errorMessage('002','prob database notif'));
                     if(numAffected < 1 ) return callback(errorMessage('009','notif not found'));
                     callback(null,null);
                 });
                 
               }
           ],
           function(err,data){
               if(err){ 
                    res.send(JSON.stringify(err,null,'\t'));
                    console.log(JSON.stringify(err,null,'\t'))
               }
               else{
                    res.send(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'));
                    console.log(JSON.stringify({code : "200",message:"",data : data[0]},null,'\t'))
               }
               
           });

});

module.exports = router;


