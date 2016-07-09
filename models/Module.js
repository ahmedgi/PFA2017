var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var modSchema=new Schema({
   _resp   :{type:Schema.Types.ObjectId,ref:"profs"},
   nom     :String,
   niveau  :Number,
   filiere :String,
   liste   :[{type:Number,ref:"Matiere"}],
   resultat:Schema.Types.Mixed
});
var Module= mongoose.model('Module',modSchema);
module.exports = Module;