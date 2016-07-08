
var users = {};

var socket =  {
    
    emit : function(id,event,data){
      if(users[id]){
          users[id].emit(event,data);
      }  
    },
    getUser : function(id){
        return users[id];
    },
    start : function(io){
       io.on('connection',function(socket){ 
       console.log("client connecté");
       socket.on('registerUser',function(id){
            console.log("user registred : "+id)
            socket._id = id;
            users[id] = socket; 
       });
       
       socket.on('disconnect',function(){
           console.log("user disconnect : "+socket._id);
           users[socket._id] = undefined;
       })
       
    });
    }
}


module.exports = socket;