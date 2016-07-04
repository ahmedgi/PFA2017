var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var noteSchema=new Schema({
   _elm      :{type:Schema.Types.ObjectId,ref:"Matiere"},
   editable  :Boolean,
   liste     :Schema.Types.Mixed
});
var Notes=mongoose.model('Notes',noteSchema);
module.exports = Notes;