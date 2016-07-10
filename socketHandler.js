
var users = {};

var socket =  {
    
    emit : function(id,event,data){

      if(users[id]){
          users[id].emit(event,data);
          setTimeout(function(){
              console.log("Message "+event+" envoyer a : "+id)
          },1000)
      }else  
       setTimeout(function(){
              console.log("Message "+event+" NON envoyer a : "+id+"-->")
          },1000)
    },
    getUser : function(id){
        return users[id];
    },
    start : function(io){
       setInterval(function(){
        console.log(JSON.stringify(Object.keys(users).length ,null,'\t'))
       },4000)
       io.on('connection',function(socket){ 
       console.log("client connecté");
       socket.on('registerUser',function(id){
            console.log("user registred : "+id)
            socket._id = id;
            users[id] = socket; 
       });
       
       socket.on('disconnect',function(){
          setTimeout(function(){
            console.log("user disconnect : "+socket._id);
          },1000) 
         delete users[socket._id] ;
       })
       
    });
    }
}


module.exports = socket;