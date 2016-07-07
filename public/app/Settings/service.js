var app = angular.module('pfaApp')

app
.factory("settingFactory",function($http){

	this.getListProf = function(){            
        return $http
		({
	        method : "GET",
	        url : "/profs"//Settings/prof.json
	    }).then(function mySucces(res) {
               if(res.data.info=="non_auto"){
                  //alert("vous n'avez pas le droit");
                  console.log("vous n'avez pas le droit");
                  return [];
                }
	               else return res.data.data;
	        
		});          
 }

	this.getListMatiere = function(){            
        return $http
		({
	        method : "GET",
	        url    : "/matieres"//Settings/matiere.json
	  }).then(function mySucces(res) {
         if(res.data.info=="non_auto"){
                  alert("vous n'avez pas le droit");
                  return [];
         }else
	        return res.data.matieres;
	        
		    });          
 }    
	return this;
});
app.factory("affectionFactory",function($http){

		this.getListMatiere = function(){            
        return $http
		  ({
	        method : "GET",
	        url    : "/matieres"//Settings/matiereAffectation.json
	    }).then(function mySucces(res) {
         if(res.data.info=="non_auto"){
                  alert("vous n'avez pas le droit");
                  return [];
         }else
	        return res.data.matieres;
	        
		      });          
  }    
    return this;
});