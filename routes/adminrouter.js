var express    =require('express');
var adminrouter=express.Router();
var async     =require('async');
var conEnsure =require('connect-ensure-login');
var nodemailer=require('nodemailer');
//-----models---------------
var User = require("../models/databaseModels").profs
var Rat    =require("../models/rattrappage");
var Matiere=require("../models/Matiere");
var Notes  =require("../models/Notes");
var Module =require("../models/Module");
var AnneeScolaire=require("../models/AnneeScolaire");
var dbModel = require("../models/databaseModels");

//==================================creer un compte=======================================

 adminrouter.post('/create'/* ,conEnsure.ensureLoggedIn(2,"/login") */,function(req,res){
    console.log("req --------received ! ");
    var nregx =new  RegExp(/^[a-zA-Z_]{3,}$/),
        pnregx=new  RegExp(/^[a-zA-Z_]{3,}$/),
        eregx =new  RegExp(/^[^]+@gmail.com$/),
        mregx =new  RegExp(/^([0-9]{1}|1[0-5])$/),
        gregx =new  RegExp(/^([a-zA-Z_]+)$/),
        nom   =req.body.nom,
		email =req.body.email,
        tel   =req.body.tel,
        grade =req.body.grade,
        passwd="0000000",//req.body.passwd,
        prenom=req.body.prenom;
    var transporter=nodemailer.createTransport({
        service:'Gmail',
        auth:{
          user:"abfadllah@gmail.com",
          pass:"___passwd_____"
        }        
    });
    var mailOptions={
       from:"example@gmail.com",
       to  :"",
       subject:"mot de passe",
       text:"votre mot de pass: "+passwd
    };
    console.log("#########################"+nom)
    if (nom.gtrim() == "" || !nregx.test(nom))
        res.json({ err: "vous devez entrez un nom valide" });
    else if (typeof prenom == "undefined" || prenom.gtrim() == "" || !pnregx.test(prenom))
        res.json({ err: "vous devez entrez un prenom valide" });
    else if (typeof grade == "undefined" || grade.gtrim() == "" || !gregx.test(grade))
        res.json({ err: "vous n'êtes pas serieux" });
    else if (!email || !eregx.test(email)) {
      res.json({err:"email invalide !!"});
    }
				else{
      //console.log('security_mask='+mask);
      var user=new User({
        login        :nom+"_"+prenom,
        nom          :nom,
        prenom       :prenom,
        tel          :tel,
        email        :email,
        grade        :grade,
        security_mask: 0,
        matieres     : [],
        modules      : []
      });
      console.log(JSON.stringify(user));
      user.password=passwd;
      User.findOne({login:nom},function(err,doc){
            if(typeof doc!='undefined' && doc!=null){
              if(doc.login.gtrim().toUpperCase()==nom.gtrim().toUpperCase())
																	res.json({err:"ce nom d'user existe déja !"});
            }
            else {
              user.save(function(err){
                        if(err)res.json({err:"vos infos ne sont pas saisies , veuillez vérifier"});
                        else {
                         mailOptions.to=email;
                         transporter.sendMail(mailOptions,function(err,info){
                            if(!err) res.json({ok:"compte créé ! -info:"+info.response});
                            else res.json({err:"une erreur s'est produite"+JSON.stringify(err)});
                         });
                        }
              });     
            }
      });
				}
});

//---------get prof list-----------------------------------

adminrouter.get('/profs',/* conEnsure.ensureLoggedIn(2,"/login_"), */function(req,res){
   console.log("waaaaaaaaa:"+req.user);
   var tsend={};
   User.find({},
   {_id   :1,
    nom   :1,
    prenom:1,
    tel   :1,
    email :1,
    grade :1,
    security_mask:1
    }).exec(function(err,profs){
      if(!err) {
       tsend.data=profs;
       console.log("les profs :\n "+JSON.stringify(tsend));
       res.status(200).json(tsend); 
      }
      else res.status(500).json({err:""});
   });
});
//-----------get-Subject-List------------------------------
adminrouter.get('/matieres',/*conEnsure.ensureLoggedIn(2,"/login_"),*/function(req,res){
  var tsend={};
  var ijson={};
  tsend.matieres=[];
   Matiere.find({},
    {
    _id:1,
     nom:1,
     _ens:1,
     _mod:1
    })
   .populate(
    {
     path  :"_ens",
	   model : "prof",
     select:"login"     
    })
   .populate(
    {
     path  :"_mod",
     model :"Module",
     select:"nom"
    }
    )
    .exec(function(err,mats){
     if(!err){
      async.each(mats,function(mat,done){
        ijson.id      =mat._id;
        ijson.nom     =mat.nom;
        ijson.idProf  =(mat._ens)?mat._ens._id:0;
        ijson.nomProf =(mat._ens)?mat._ens.login:"non affecté";
        ijson.module  =(mat._mod)?mat._mod.nom:"non affecté";
        ijson.idModule=(mat._mod)?mat._mod._id:0;
        tsend.matieres.push(ijson);
        ijson={};
        done();
      },
      function(err){
       if(err)res.status(500).json({err:' server internal error'});
      }
      );
      res.status(200).json(tsend);
     }else res.status(500).json({err:"can not get matieres !"});
    });
});

//projet :nodemailerPro


adminrouter.post("/admin_data",/* conEnsure.ensureLoggedIn(8,"/login"), */function(req,res){
   console.log("789789#"+JSON.stringify(req.body))
   try{
     var mask=req.body.security_mask;
     var mr=new RegExp(/^[0-9]{1,2}$/);
     if(!mask||!mr.test(mask)){
        res.json({err:"impossible de modifier"});
     }
     else{
          mask =parseInt(mask);
          User.update({_id:req.body._id},{$set:{"security_mask":mask}},function(err,r){
            if(!err) res.json({ok:"mask successfully modified !"});
            else res.status(500).json({err:"internal server error"});
          });
        
     }
   }catch(NumberFormatException){
      res.json({err:"vous ne pouvez pas modifier !"});
   }
});

adminrouter.post("/delete_user",function(req,res){
   console.log("pppp"+JSON.stringify(req.body))
   User.findOne({_id:req.body.user_id},function(err,user){
     if(!err&&user){
        async.parallel([
         //-----détacher les matières----------
          function(matDone){
           if(user.matieres&&user.matieres.length){
            Matiere.update({_ens:req.body.user_id},{$set:{_ens:null}},{multi:true},function(err,mats){
                 if(!err)matDone(null);
                 else matDone({err:"unknown error while deleting !"});
            });
           }else  matDone(null);
          },
         //-----détacher les modules-----------
          function(modDone){
           if(user.modules&&user.modules.length){
            Module.update({_resp:req.body.user_id},{$set:{_resp:null}},{multi:true},function(err,mats){
                 if(!err)matDone(null);
                 else matDone({err:"unknown error while deleting !"});
            });
           }else modDone(null);
          },
          function(callback){
            User.remove({_id:req.body.user_id},function(err){
                if(err) return callback({code : "010",message:"Prob database !",data:''})
                callback(null);
            })
          },
        ],function(err,result){
           if(!err) res.json({ok:"user successfully removed !"});
           else res.json(err);
        });
     }
     else res.json({err:"can't remove user!!"});
   });
});

adminrouter.post("/update_user",function(req,res){
    var nregx =new  RegExp(/^[a-zA-Z_]{3,}$/),
            pnregx=new  RegExp(/^[a-zA-Z_]{3,}$/),
            eregx =new  RegExp(/^[^]+@gmail.com$/),
            mregx =new  RegExp(/^([0-9]{1}|1[0-5])$/),
            gregx =new  RegExp(/^([a-zA-Z_]+)$/);
    if (req.body.nom && (req.body.nom.gtrim() == "" || !nregx.test(req.body.nom)))
        res.json({ err: "vous devez entrez un nom valide" });
    else if (req.body.prenom && (req.body.prenom.gtrim() == "" || !pnregx.test(req.body.prenom)))
        res.json({ err: "vous devez entrez un prenom valide" });
    else if (req.body.grade && (req.body.grade.gtrim() == "" || !gregx.test(req.body.grade)))
        res.json({ err: "vous n'êtes pas serieux" });
    else if (req.body.email && !eregx.test(req.body.email)) {
      res.json({err:"email invalide !!"});
    }else{
        User.findOne({_id:req.body._id},function(err,user){
            if(err) res.json({err:"error database!!"})
            else if(!user) res.json({err:"error user not found!!"})
            else {
                user.setAtt('nom',req.body.nom);
                user.setAtt('prenom',req.body.prenom);
                user.setAtt('tel',req.body.tel);
                user.setAtt('grade',req.body.grade);
                user.setAtt('email',req.body.email);
                user.save(function(err){
                    if(err) res.json({err:"saving prof Prob"})
                    else  res.json({ok:"prof updated"})
                })
            }
        })
    }
   
});

//---------------------Annee Scolaire----------------------------
adminrouter.get('/anneeScolaire',function(req,res){

  AnneeScolaire.find({}).populate({
    path:"fillieres",
    model:"filieres",
    select:"intitulee"
  }).exec(function(err,anneeData){
      if(!err){
        res.status(200).json(anneeData);
      }
    });

});

function exportData(filliereIDs,callback){
  

}

function ImportData(modules,callback){
    
}

adminrouter.post('/creeAnneeScolaire',function(req,res){
  if(req.body.description && req.body.annee && req.body.fillieres){

    async.waterfall([function(callback){
      //----recuperer tous data des filliere pour trouver les modules
      dbModel.filiere.find({_id:{$in : req.body.fillieres}})
      .populate({
        
          path:"annee1.s1",
          model:"modules"
        
      })
      .exec(function(err,res){
        console.log("aaaaaaaaaaaa"+res);
        if(err){
          callback(err);
        }else{
          callback(null,res);  
        }
        
      });
    },function(data,callback){
      //remplire la collection modules
      console.log("-----0"+data);

      callback(null);   
    }],
      function(err,res){

      });

    var annee=new AnneeScolaire(req.body);
    annee.save(function(err){
      if(err){
        res.json({"err":"save err"});
      }else{
        res.json({"ok":"ok save success !"});
      }
    });
  }

});

adminrouter.get('/getFillieres',function(req,res){

    dbModel.filiere.find({createdBy:req.user._id},"intitulee",function(err,result){
      if(err){
        res.json({"err":"err get fillieres"});
      }else{
        res.json(result);
      }
      });
    });
module.exports=adminrouter;

