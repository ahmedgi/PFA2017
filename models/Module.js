var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var modSchema=new Schema({
   _resp   :{type:Schema.Types.ObjectId,ref:"profs"},
   _anneeScolaire:{type:Schema.Types.ObjectId,ref:"AnneeScolaire"},
   _ref:{type:Schema.Types.ObjectId,ref:"Module"},
   nom     :String,
   niveau  :Number,
   semestre:String,
   filliere :{type:Schema.Types.ObjectId,ref:"filiere"},
   liste   :[{type:Schema.Types.ObjectId,ref:"Matiere"}],
   resultat:Schema.Types.Mixed
});
var ModuleAnnee= mongoose.model('ModuleAnnee',modSchema);
module.exports = ModuleAnnee;