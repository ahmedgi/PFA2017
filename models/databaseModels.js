var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var eModuleSchema = mongoose.Schema(
                  {
                    intitulee : String,
                    prerequis : String,
                    objectif : String,
                    volume_horaire : 
                        {
                            cour : { type: Number, min: 0},
                            td : { type: Number, min: 0},
                            tp : { type: Number, min: 0}
                        },
                    activitees_pratique : [
                        {
                            libellee : String,
                            objectif : String,
                            travaux_terrain : { type: Number, min: 0},
                            projet : { type: Number, min: 0},
                            stage : { type: Number, min: 0},
                            visite_etude : { type: Number, min: 0} 
                        }
                        ],
                    description_programme : String, 
                    modalitee_evaluation : String,
                    note : String,
                    note_minimal : { type: Number, min: 0 , max : 10},
                    
                    createdBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },
                    sendTo : [{
                            _id : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                            },
                            permision : String
                           }],
                   creationDate : { type: Date, default: Date.now },
                   lastUpdate : { type: Date, default: Date.now },
                   updatedBy : {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                           },
                   status : String
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
                     universite : String,
                     etablissement : String,
                     departement : String,
                     intitulee : String,
                     coordonnateur : 
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref : 'prof'
                        },
                    didactique : String,
                    note_minimal : { type: Number, min: 0 , max : 12},
                    eModules : [
                           {
                              _id :  {
                                    type: mongoose.Schema.Types.ObjectId,
                                    ref : 'eModules'
                                    },
                              intitulee : String
                           }
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
                   status : String                    
                 }
    );
    
    moduleSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
 
 var eModuleNotifSchema = mongoose.Schema({
                    intitulee : String,
                    eModule : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'eModules'
                    },
                    prof : {
                        type : mongoose.Schema.Types.ObjectId,
                        ref : 'prof'
                    },
                    status : String,
                    typee : String,
                    date : { type: Date, default: Date.now },
 });
 
 var moduleNotifSchema = mongoose.Schema({
                    intitulee : String,
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
                    status : String,
                    typee : String,
                    date : { type: Date, default: Date.now },
 });
 
 eModuleNotifSchema.methods.setAtt = function(att,value){
    if(value){
        this[att] = value;
    }
}
 
 var profSchema = mongoose.Schema(
     {
         nom : String,
         prenom : String,
         tel : String,
         grade : String,
         email : String,
         password : String,
         login          :{type:String,required:true,unique:true},
         filiere        :{type:String}, //si l'user est un chef de filiere ===specifier la filiere
         security_mask  :Number,
         active_semestre:Number,
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
         intitulee : String,
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
         },annee3 : {
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
                   type : mongoose.Schema.Types.ObjectId,
                   ref : 'profs'
                },
        creationDate : { type: Date, default: Date.now },
        lastUpdate : { type: Date, default: Date.now },

     }
 );
 
 
 module.exports = {
     eModules : mongoose.model('eModules',eModuleSchema),
     modules : mongoose.model('modules',moduleSchema),
     profs : mongoose.model('prof',profSchema),
     eModuleNotif : mongoose.model('eModuleNotif',eModuleNotifSchema),
     moduleNotif : mongoose.model('moduleNotif',moduleNotifSchema),
     filiere : mongoose.model('filieres',filiereSchema)
 }
              