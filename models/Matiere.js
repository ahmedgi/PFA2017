var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var matiereSchema=new Schema({
   _ens    :{type:Schema.Types.ObjectId,ref:"profs"},
   _mod    :{type:Schema.Types.ObjectId,ref:"ModuleAnnee"},
   _anneeScolaire:{type:Schema.Types.ObjectId,ref:"AnneeScolaire"},
   _ref	   :{type:Schema.Types.ObjectId,ref:"eModules"},
   coef    :Number,
   niveau  :Number,
   semestre:Number,
   _filiere :{type:Schema.Types.ObjectId,ref:"filieres"},
   notes   :{type:Schema.Types.ObjectId,ref:"Notes"}
});
var Matiere = mongoose.model('Matiere',matiereSchema);
module.exports = Matiere;