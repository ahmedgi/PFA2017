var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var ratSchema=new Schema({
   _elm   :{type:Number,ref:"Matiere"},
   rListes:Schema.Types.Mixed
});
var rattrappage= mongoose.model('rattrappage',ratSchema);
module.exports = rattrappage;