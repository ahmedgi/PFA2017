app
.factory("settingFactory",function($http){

	this.getListProf = function(){            
        return $http
		({
	        method : "GET",
	        url : "Settings/prof.json"
	    }).then(function mySucces(response) {
	        return response.data.data;
	        
		});          
    }

	this.getListMatiere = function(){            
        return $http
		({
	        method : "GET",
	        url : "Settings/matiere.json"
	    }).then(function mySucces(response) {
	        return response.data.matieres;
	        
		});          
    }    
	return this;
});

app.factory("affectionFactory",function($http){

		this.getListMatiere = function(){            
        return $http
		({
	        method : "GET",
	        url : "Settings/matiereAffectation.json"
	    }).then(function mySucces(response) {
	        return response.data.matieres;
	        
		});          
    }    
    return this;
});