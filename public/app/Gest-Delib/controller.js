app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                scope.$apply(function () {
                    scope.fileread = changeEvent.target.files[0];
                    // or all selected files:
                    // scope.fileread = changeEvent.target.files;
                });
            });
        }
    }   }
 ]);

app.controller("GestDelibCtrl",function($rootScope,$http,$scope,delibNoteFactory){
	$scope.data={};
	//$scope.data.element={};
	$scope.data.editToggle=[];
	$scope.data.notes=[];
	//$scope.data.nom="";
	$scope.data.tmpNote=[];
	$scope.step=1;
	$scope.filiere="";//filiere choosen name
	$scope.annee=0;//annee choosen number
	$rootScope.Utils={
		keys:Object.keys
	}
	$scope.ready=false;//this bool turn on when we choose any subject !

	$scope.editBtn=function(obj,$index){
		$scope.data.editToggle[$index]=!$scope.data.editToggle[$index];

		//$scope.data.tmpNote[$index]=$scope.data.notes[$index].note;
		$scope.data.tmpNote[$index]=obj;
	}

	$scope.annulerBtn=function(i){
		$scope.data.editToggle[i]=!$scope.data.editToggle[i];		
	}

	$scope.confirmBtn=function(i,$index){
		$scope.data.notes[$rootScope.Utils.keys($scope.data.notes)[i]]=$scope.data.tmpNote[$index];
		$scope.data.editToggle[$index]=!$scope.data.editToggle[$index];
	}
/*
	$scope.incrementStep=function(){
		$scope.step++;
	}

	$scope.decrementStep=function(){
		$scope.step--;
	}*/

	$scope.getListMatiereAndNote=function(){

		delibNoteFactory.getListNote($scope.filiere,$scope.annee).then(function(arrItems){
	   	//console.log("$scope.filiere: "+$scope.filiere+"\n$scope.annee:"+$scope.annee);
	   	//console.log("-------getListMatiereAndNote---------");
		$scope.data.matieres=arrItems;
		console.log(arrItems);
        // $scope.data.nom= arrItems.matiere.nom;
        // $scope.data.notes=arrItems.matiere.notes;
       });

	}

	$scope.getListMatiereAndNote();

	/*$scope.chooseFiliere=function(filiere){
		$scope.filiere=filiere;
	}

	$scope.chooseAnnee=function(annee){
		$scope.annee=annee;
		$scope.getListMatiereAndNote();
	}*/

	$scope.clickMatiere=function(i){
 		$scope.activeMatiere=$scope.data.matieres[i];
		if($scope.ready){
			$scope.data.notes=$scope.data.matieres[i].notes;
		}
		//$scope.ready=true;
	}

	$scope.upload=function(){
		var fd=new FormData();
		fd.append("file",$scope.noteFile);
		fd.append("mat",$scope.activeMatiere._ref.intitulee);
		fd.append("id",$scope.activeMatiere._id);
  		console.log("active matiere="+$scope.activeMatiere._ref.intitulee);
  

		$http.post('/charger',fd,{
            transformRequest: angular.identity,
            headers: {'Content-Type':undefined}
        })
        .success(function(res){
          console.log("success!!"+JSON.stringify(res));
        })
        .error(function(res){
          console.log("error!!"+res.data);
        });
  
  	}

 $scope.selected=function(files){
    if(files && files.length) $scope.file=files[0];
  
 };
 
 /*$scope.upload=function(){
		// var file=new FormData();
		// file.append("file",$scope.noteFile);
   var file=$scope.file;
		$upload({
			url :"/charger",
			file:file
		}).success(function success(res){
        alert(JSON.stringify(res.data.ok));
		});
	}*/
});

app.filter("range",function(){
	return function(input,param){
		param=parseInt(param);
		for(var i=0;i<param;i++){
			input.push(i);
		}
		return input;
	}

});
app.controller("replissageNotes",function($scope,$http){

	$scope.upload=function(){
		var file=new formData();
		file.append("file",$scope.noteFile);

		$http({
			method:"POST",
			url:"/charger",
			data:file
		}).then(function success(res){

		},function err(res){

		});
	}

});


app.controller("anneeScolaireCtrl",function($scope,anneeScolaireFactory){

	$scope.data={};
	anneeScolaireFactory.getListAnnee().then(function(arrItems){
		$scope.data.annees=arrItems;
       });

	$scope.createAnnnee=function(){

		anneeScolaireFactory.creatAnnee({
			"description":$scope.data.description,
			"annee":$scope.data.annee,
			"fillieres":$scope.multipleSelect
		}).then(function(){
			$scope.data.annees=angular.copy($scope.master);

			anneeScolaireFactory.getListAnnee().then(function(arrItems){
				$scope.data.annees=arrItems;
	       });
		});	

	}

	$scope.fetchFillieres=function(){
		anneeScolaireFactory.getListFilliere().then(function(arrItems){
			$scope.data.fillieres=arrItems;
		});
	}

	$scope.changeActiveTo=function(id){
		anneeScolaireFactory.changeActiveTo(id);
	}
});


//--------------subject afectation stuff-----------------------
 
 
 //--------filter :get prof name by id-------------
app.filter("getProfName",function(){
	 return function(collection,id){
			for(var i=0;i<collection.length;i++){
				if(collection[i]._id==id){
					return collection[i].nom+"_"+collection[i].prenom;
				}
			}
		}
	});

app.controller("affectationCont",function($scope,$filter,$http,affectionFactory,settingFactory,profsList){
	
	$scope.matieres=[];
	//$scope.profs=[];
	$scope.isAffected=[];
	$scope.activeAffectation=[];//hold the ids of the prof for the active subject
	$scope.activeSubject=0;


	affectionFactory.getListMatiere().then(function(arrItems){//fetch the informations of the subject from the factory
         $scope.matieres = arrItems;
 	});

	profsList.getCurrentUser().then(function(){
		profsList.load().then(function(){
			$scope.profs = profsList.getItems;
		});
		
	});
	/*settingFactory.getListProf().then(function(arrItems){//fetch the informations of the profs from the factory
         $scope.profs = arrItems;
 	});*/

	$scope.options=function(n){// when click on options btn, fetch the profs and check if they are affected to the current subject

	//$scope.isAffected=[];
		$scope.activeSubject=n;
		$scope.radio={};
		$scope.radio.id=0;
		$scope.radio.id=$scope.matieres[n].idProf;

	}
 
 
	$scope.confirmer=function(){//when click on confirm(after options), it save the affectation info
 
		var findProfName=$filter("getProfName");
		//changing the affectation of the active subject subject
		$scope.matieres[$scope.activeSubject].idProf=$scope.radio.id;
		console.log($scope.matieres[$scope.activeSubject]);
  var data={
     idprof:$scope.matieres[$scope.activeSubject].idProf,
     idmat :$scope.matieres[$scope.activeSubject].id
  };
  var matiers=$scope.matieres[$scope.activeSubject];
  $http({
			method:'POST',
			data  :data,
			url   :'/affect'
		}).then(function success(res){
       if(res.data.info=="non_auto"){
         alert(res.data.info); 
       }else
       		$scope.matieres[$scope.activeSubject].nomProf=findProfName($scope.profs(),$scope.matieres[$scope.activeSubject].idProf);
     },function err(res){
     	alert(res.data);
    });
	}
});
