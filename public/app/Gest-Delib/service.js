
app.factory("delibNoteFactory",function($http){

	this.getListNote = function(filliere,annee){ 
	           
        return $http
		({
	        method : 'GET',
	        url : '/list',
	        params : {filiere:filliere,annee:annee}
	    }).then(function mySucces(response) {
          console.log("data :"+JSON.stringify(response.data));
	        return response.data;
		},function(response){
   
  });          
    }
	return this;
});


app.factory("anneeScolaireFactory",function($http){

	this.getListAnnee = function(){ 
	           
        return $http
		({
	        method : 'GET',
	        url : '/anneeScolaire',
	    }).then(function mySucces(response) {
          alert("data :"+JSON.stringify(response.data));
	        return response.data;
		},function(response){
   			alert("data :"+JSON.stringify(response.data));
  });          
    }
	return this;
});