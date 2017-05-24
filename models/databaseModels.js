var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var eModuleSchema = mongoose.Schema(
                  {
                    intitulee : { type : String,default : ''},
                    volume_horaire : 
                        {
                            cour : { type: Number, min: 0 ,default : 0},
                            td : { type: Number, min: 0 , default : 0},
                            tp : { type: Number, min: 0 , default : 0}
                        },
                    activitees_pratique : [
                        {
                            libellee : { type : String,default : ''},
                            objectif : { type : String,default : ''},
                            travaux_terrain : { type: Number, min: 0, default : 0},
                            projet : { type: Number, min: 0 , default : 0},
                            stage : { type: Number, min: 0 , default : 0},
                            visite_etude : { type: Number, min: 0 , default : 0} 
                        }
                        ],
                    description_programme : { type : String,default : ''},                     
                    createdBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },
                    sendTo : [{
                            _id : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                            },
                            permision : { type : String,default : 'r'},
                            convention :String
                           }],
                   creationDate : { type: Date, default: Date.now },
                   lastUpdate : { type: Date, default: Date.now },
                   updatedBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },
                   status : { type : String,default : 'incomplet'}
                  }
              );
              
eModuleSchema.methods.appendSendTo = function(users){
    var tmp = [];
    for(var i=0 ;i<users.length ; i++){
        for(var j=0 ; j<this.sendTo.length ; j++){
            console.log(this.sendTo[j]._id)
            if(this.sendTo[j]&&this.sendTo[j]._id == users[i].id ){
            break;
            }
        }
        if(j == this.sendTo.length)
            tmp.push(users[i]);
    }
    this.sendTo = this.sendTo.concat(tmp);
}

eModuleSchema.methods.appendActivitees_pratique = function(value){
    this.activitees_pratique = this.activitees_pratique.concat(value);
}
       
eModuleSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
              
var moduleSchema = mongoose.Schema(
                 {
                     universite : { type : String,default : ''},
                     etablissement : { type : String,default : ''},
                     departement : { type : String,default : ''},
                     intitulee : { type : String,default : ''},
                     coordonnateur : 
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                        },
                    prerequis : { type : String,default : ''},
                    objectif : { type : String,default : ''},
                    didactique : { type : String,default : ''},
                    modalitee_evaluation : { type : String,default : ''},
                    note : { type : String,default : ''},
                    note_minimal : { type: Number, min: 0 , max : 20,default : 12},
                    eModules : [
                           {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'eModules'
                           },
                       ],
                    createdBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },
                    sendTo : [{
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           }],
                   creationDate : { type: Date, default: Date.now },
                   lastUpdate : { type: Date, default: Date.now },
                   updatedBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },   
                   status : { type : String,default : 'incomplet'}                    
                 }
    );
    
    moduleSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
 
 var eModuleNotifSchema = mongoose.Schema({
                    intitulee : { type : String,default : ''},
                    eModule : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'eModules'
                    },
                    prof : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'prof'
                    },
                    status : { type : String,default : 'unseen'},
                    typee : { type : String,default : ''},
                    date : { type: Date, default: Date.now },
 });
 
 var moduleNotifSchema = mongoose.Schema({
                    intitulee : { type : String,default : ''},
                    module : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'modules'
                    },
                    eModule : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'eModules'
                    },
                    prof : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'prof'
                    },
                    status : { type : String,default : 'unseen'},
                    typee : { type : String,default : ''},
                    date : { type: Date, default: Date.now },
 });
 
 eModuleNotifSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
 
 var profSchema = mongoose.Schema(
     {
         nom : { type : String,default : ''},
         prenom : { type : String,default : ''},
         tel : { type : String,default : '05-36-50-54-70/71'},
         grade : { type : String,default : ''},
         specialite : { type : String,default : ''},
         fax : { type : String,default : '0356505472'},
         email : { type : String,default : ''},
         password : String,
         login          :{type:String,required:true,unique:true},
         filiere        :{type:String}, //si l'user est un chef de filiere ===specifier la filiere
         security_mask  :{type : Number,default : 0},
         type : { type : String,default : ''},
         active_semestre:Number,
         firstlogin : {type : Number,default : 0},
         resetPasswordToken: String,
         resetPasswordExpires: Date,
         notification : {
                eModuleNotif : [
                {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'eModuleNotif'
                }
                ],
                moduleNotif : [
                {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'moduleNotif'
                }
               ]
                
        }
     }
 );

 
profSchema.methods.generatHash = function(password) {
            return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
         };
profSchema.methods.validPassword = function(password) {
            return bcrypt.compareSync(password, this.password);
        };
 

profSchema.methods.deleteEModule = function(eModuleId){
        this.notification.eModuleNotif.forEach(function(notif,index) {
            if(notif.eModule == eModuleId){
                this.notification.eModuleNotif.splice(index,1);
            }
        }, this);
}

profSchema.methods.addNotif = function(notif,notifType){
    this.notification[notifType].push(notif);
}

profSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}

 var filiereSchema = mongoose.Schema(
     {
         intitulee : { type : String,default : ''},
         annee1 : {
             s1 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ],
             s2 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ]
                },
         annee2 : {
             s1 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ],
             s2 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ]
                },
         annee3 : {
             s1 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ],
             s2 : [
                 {
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'modules'
                 }
             ]
         },
         createdBy : {
                        type: mongoose.Schema.Types.ObjectId,
                        ref : 'prof'
                    },
         responsable : {
                   type: mongoose.Schema.Types.ObjectId,
                   ref : 'prof'
                },
        creationDate : { type: Date, default: Date.now },
        lastUpdate : { type: Date, default: Date.now },

     }
 );
 filiereSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
// parametre shema
var Univshema=mongoose.Schema({
    nom:String,
    abrev:String,
    etablissements:[
    {
        nom:String,
        abrev:String
    }
    ],
    departements:[{
        nom:String,
        abrev:String
    }]
});
 
 module.exports = {
     eModules : mongoose.model('eModules',eModuleSchema),
     modules : mongoose.model('modules',moduleSchema),
     profs : mongoose.model('prof',profSchema),
     eModuleNotif : mongoose.model('eModuleNotif',eModuleNotifSchema),
     moduleNotif : mongoose.model('moduleNotif',moduleNotifSchema),
     filiere : mongoose.model('filiere',filiereSchema),
     universite : mongoose.model('universite',Univshema)
 };
              