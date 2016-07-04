var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var matiereSchema=new Schema({
   _ens    :{type:Schema.Types.ObjectId,ref:"User"},
   _mod    :{type:Schema.Types.ObjectId,ref:"Module"},
   coef    :Number,
   niveau  :Number,
   semestre:Number,
   nom     :String,
   filiere :String,
   notes   :{type:Schema.Types.ObjectId,ref:"Notes"}
});
var Matiere = mongoose.model('Matiere',matiereSchema);
module.exports = Matiere;