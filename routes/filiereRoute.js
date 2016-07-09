
var express = require('express');
var async = require('async')
var conEnsure= require('connect-ensure-login');
var databaseModels = require('../models/databaseModels')

var errorMessage = function(code,message){
    return {code : code,message : message}
}

var okMessage = function(code,message,data){
    return {code : code,message : message , data : data}
}


var router = express.Router();

//{userId : id,searchQuery : {key : value},responseFields : "filed1 filed2 ..",populate : [{path : '',select:''}]}
router.post("/getFiliere",conEnsure.ensureLoggedIn(0,"/login_",false),function(req,res){
           res.setHeader('Content-Type', 'application/json');
           console.log("response is : ");
           console.log(JSON.stringify(req.body))
           async.series([
               function(callback){
                  var query =  databaseModels.filiere.find(req.body.searchQuery,req.body.responseFields);
                   //query.populate('createdBy');
                   if(req.body.populate)
                   for(var i = 0 ; i<req.body.populate.length ; i++){
                       query.populate(req.body.populate[i]);
                   }
                   //.populate('updatedBy')
                   //.populate({path : 'sendTo.id',select :'nom'})
                   query.exec(
                   function(err,profs){
                        if(err) return callback({code : '002',message :"database problem!!"},null);
                        callback(null,profs);
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

//{intitulee : String,cordId : _id,
// userId : _id }
router.post("/creeFiliere",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       
       console.log(req.connection.remoteAddress+" requested "+req.path);
       console.log("request is : "+JSON.stringify(req.body,null));
       res.setHeader('Content-Type', 'application/json');

           console.log("connection to database ");
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.filiere.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem!",data : err})
                       if(doc.length>0) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                   var filiere = new databaseModels.filiere({
                                        intitulee : req.body.intitulee,
                                        createdBy : req.body.userId,
                                        status : 'incomplet'});
                   filiere.save(function(err){
                       if(err) return callback({code : '002',message :"database problem!"});
                       callback(null,module._id);
                   });
               },
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


//{filiereId : _Id ,userId : _Id,intitulee : intitulee,status : String}
router.post("/deleteFiliere",conEnsure.ensureLoggedIn(0,"/login_",true),function(req,res){
       res.setHeader('Content-Type', 'application/json');

       console.log("response is : ");
           
      databaseModels.filiere.remove({_id : req.body.filiereId},function(err){
          if (err){
             res.send(JSON.stringify({code : "001",message:"database Prob",data :'' },null,'\t'));
             console.log(JSON.stringify({code : "001",message:"database Prob",data :'' },null,'\t'));
          }
          else{
             res.send(JSON.stringify({code : "200",message:"",data :'' },null,'\t'));
             console.log(JSON.stringify({code : "200",message:"",data :'' },null,'\t'));
          }
      });
      
});


//{filiereId : id,userId : id,intitulee : Sting,annee1 : {},annee2 : {},annee3 : {}}
router.post('/editeFiliere',conEnsure.ensureLoggedIn(0,"/login_",false),function(req,res){
        res.setHeader('Content-Type', 'application/json');
           console.log("response is : ");
           async.waterfall([
               function(callback){
                   databaseModels.filiere.find({intitulee : req.body.intitulee},function(err,doc){
                       if(err) return callback({code : '002',message:"database problem! remplireFiliere",data : err})
                       if(doc.length>0&&req.body.filiereId!=doc[0]._id) return callback({code : '003',message : "Intitulee taken !!"});
                       callback(null);
                   });  
               },
               function(callback){
                  databaseModels.filiere.findById(req.body.filiereId,function(err,filiere){
                      if(err) return callback({code : '002',message:"database problem!"})
                      if(!filiere) return callback({code : '004',message : "Filiere not found !!"});
                      callback(null,filiere);
                  });
               },
               function(filiere,callback){
                   filiere.setAtt('intitulee',req.body.intitulee);
                   filiere.setAtt('annee1',req.body.annee1);
                   filiere.setAtt('annee2',req.body.annee2);
                   filiere.setAtt('annee3',req.body.annee3);
                   filiere.setAtt('lastUpdate',new Date());                  
                   filiere.setAtt('status',req.body.status);                  
                   filiere.save(function(err){
                       if(err) return callback({code : '002',message:"database problem!",data : err});
                       callback(null)
                   });
                   
               },
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



module.exports = router;
