var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var anneeScolaire=new Schema({
   description    :String,
   annee    :String,
   fillieres:[{type:Schema.Types.ObjectId,ref:"filiere"}]
});
var AnneeScolaire = mongoose.model('AnneeScolaire',anneeScolaire);
module.exports = AnneeScolaire;