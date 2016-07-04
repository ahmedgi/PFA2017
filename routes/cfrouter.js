/**
* ce router regroupe les routes 
* concernant un chef de flière!
*
**/

var express  = require('express');
var cfrouter = express.Router();
var async    = require('async');
var conEnsure= require('connect-ensure-login');
//-----models-------------------------------
var User = require("../models/databaseModels").profs
var Rat      = require   ("../models/rattrappage");
var Matiere  = require   ("../models/Matiere");
var Notes    = require   ("../models/Notes");
var Module   = require   ("../models/Module");

//---------ouvrire un semestre-------------------------------
/*
* si un semestre n'est pas encore ouvert, un prof
* ne peut pas charger les notes des matière aui appartiennent 
* à ce semestre .
*
*/
cfrouter.get('/open',conEnsure.ensureLoggedIn(2,"/login_"),function(req,res){
   var semestre=parseInt(req.query.semestre);
   User.update(
    {},
    {$set:{active_semestre:semestre}},
    {multi:true},
    function(err){
     if(err)res.status(500).json({err:"internal server error"});
    });
});



//------------get modules list---------------------------------

cfrouter.get('/listmod',conEnsure.ensureLoggedIn(2,"/login_"),function(req,res){
    var fil    =req.query.fil; //la filiere
    var niv    =req.query.niv;
      User.findOne({_id:req.user._id},{modules:1,filiere:1})
         .populate({
           path    :"modules",
           model   :"Module",
           select  :"liste nom",
           match   :{$and:[{niveau:niv},{filiere:fil}]},
           populate:{
             path    :"liste",
             model   :"Matiere",
             select  :"nom notes",
             populate:{
               path :"notes",
               model:"Notes",
               select  :"liste"
             }
           }
         })
         .exec(function(err,doc){
           if(!err){	
               res.status(200).json(doc.modules);
               /*
                *modules_list entry:
                *{
                * nom:"module_name",
                * liste:[
                *  {nom:"subj_name",notes:{liste:{e1:15,e2:15.5,....}}},
                *  {nom:"subj_name",notes:{liste:{e1:15,e2:15.5,....}}},
                *   ...
                * ]
                *}
               */
               //console.log(doc.modules);
                          
											}else {
																//console.log(err);
																res.status(500).json({err:"internal server error ! : may be connexion error!"});
												}
         });  
});
//------------get module information---------------------------
cfrouter.get('/modinfo',conEnsure.ensureLoggedIn(2,"/login_"),function(req,res){
    var nom_module=req.query.nom;
    var fil       =req.query.fil; //la filiere
    var list      =[]; 
         User.findOne({login:req.user.login},{modules:1}).populate({
           path    :"modules",
           match   :{$and:[{nom:nom_module},{filiere:fil}]},
           populate:{path:"liste",populate:{path:"notes"}}
         }).exec(function(err,doc){
           if(!err){	
                res.json({});
                console.log(JSON.stringify(doc));           
											}else {
																console.log(err);
																//res.json({err:""});
												}
         });  
});


cfrouter.post('/affect',conEnsure.ensureLoggedIn(2,"/login_"),function(req,res){
   
   var idmat =req.body.idmat ;     //nom de la matiere
   var idprof=req.body.idprof;
   async.waterfall(
   [//-------1st function:find user------------
    function(findUserDone){
     User.findOne({_id:idprof})
      .populate({
       path:"matieres",
       model:"Matiere"
      })
      .exec(function(err,user){
       if(!err){
         async.each(user.matieres,function(mat,cb){
           if(mat._id==idmat) cb({err:"subject already attributed !!"});
           else cb();
          },
          function(err){
            if(err) findUserDone(err);
            else findUserDone(null,user);
          }
         );
         
       }else {
         findUserDone({err:"can not get data !"});
       }
      });
    },
    //-------2nd function :find subject------------
    function(user,findSubjectDone){
     Matiere.findOne({_id:idmat}).exec(function(err,matiere){
        if(!err){
          if(user.matiers.indexOf(idmat)!= -1){
           user.matieres.push(matiere);
          }
           findSubjectDone(null,user,matiere)
        }
        else{
         findSubjectDone({err:"can not get data !"});
        } 
     });
    },
    //-------3rd function :save user------------
    function(user,matiere,saveUserDone){
     user.save(function(err){
       if(!err){
         matiere._ens=user._id;
         saveUserDone(null,matiere);   
       }else saveUserDone({err:"can not save data !"});
     });
    },
    //-------4th function :save subject---------
    function(matiere,saveSubjectDone){
     matiere.save(function(err){
      if(!err)saveSubjectDone(null);
      else saveSubjectDone({err:"can not save data !"});
     });
    }
    
   ],
   function(err,result){
      
      if(err)res.status(403).json(err);
      else res.status(200).json({ok:"subject attributed with success"});
   });
          
});
      
cfrouter.get("/deliberation",conEnsure.ensureLoggedIn(2,'/login'),function(req,res){
      var result={};
      var sum   =0.0;
      User.findOne({_id:req.user._id},{modules:1})
      .populate({
       path    :"modules",
       model   :"Module",
       populate:{
             path    :"liste",
             model   :"Matiere",
             populate:{
               path  :"notes",
               model :"Notes"
             }
       }
      })
      .exec(function(err,user){
       async.series(
       [
        //--------1st function------------
        function(done){
         async.each(user.modules,function(module,done0){
           async.each(Object.keys(module.liste[0].notes.liste),function(e,done2){
              async.each(module.liste,function(celm,done3){
                  sum+=celm.notes.liste[e]*celm.coef;
                  celm.notes.editable=false;
                  done3();
              },function(err){
                  if(!err){
                   result[e]={};//result={e:{}}
                   result[e]['moy']  =sum;//result={e:{moy:__,valide:__}}
                   result[e]['valide']=(sum>=12.0)?"v":"nv";
                  }
              });
                  done2();
           },function(err){
                  if(!err) sum=0.0;
             });  
             done0();
         },
         function(err){
           if(!err){
             module.resultat=result;
             result={};
             done(null);
           }else{
             done({err:"erreur"});
           }
         });
        },
        //--------2nd function------------
        function(done){
         user.save(function(err){
          if(!err){
            res.status(200).json({ok:"deliberation avant rattrappage terminée"});  
          }else res.status(500).json({err:"une erreur s'est produite !"});
         });
         done(null);
        }
       ],
       function(err,results){
         if(err) res.status(500).json({err:"erreur interne"});
       });  
      });
});

module.exports = cfrouter;




// void calcul(int tab[50],int * np,int* nimp,int *nz){
   // int i;
   // (*nz)=0;
   // (*nimp)=0;
   // (*np)=0;
   // for(i=0;i!=50;i++){
     // if(tab[i]==0)(*nz)++;
     // else if(tab[i]%2==0) (*np)++;
     // else (*nimp)++;
   // }
// }
// int main(){
  // int nimp=0;
  // int nz=0;
  // int np=0;
  // int tab[]={0,1,2,3,4,5,6,7,8,9,10,11};
  // calcul(tab,&np,&nimp,&nz);
  // printf("nb des pairs:%d \nnb des impairs:%d \nnb des zeros:%d",np,nimp,nz);
// }

