var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');
var userSchema=new Schema({
   login          :{type:String,required:true,unique:true},
   nom            :{type:String,required:true},
   prenom         :{type:String,required:true},
   tel            :{type:String},
   grade          :{type:String},
   email          :{type:String},
   filiere        :{type:String}, //si l'user est un chef de filiere ===specifier la filiere
   password       :{type:String,required:true},
   security_mask  :Number,
   active_semestre:Number,
   matieres       : [{type:Schema.Types.ObjectId,ref:"Matiere"}],
   modules        : [{type:Schema.Types.ObjectId,ref:"Module" }] //si chef de filiere
});


userSchema.methods.generateHash=function(passwd){
  return bcrypt.hashSync(passwd,bcrypt.genSaltSync(10));
};
userSchema.methods.validPassword=function(passwd){
  return bcrypt.compareSync(passwd,this.password);
};
var User=mongoose.model('User',userSchema);
module.exports = User;