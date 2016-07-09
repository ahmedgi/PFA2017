
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

	$scope.incrementStep=function(){
		$scope.step++;
	}

	$scope.decrementStep=function(){
		$scope.step--;
	}

	$scope.getListMatiereAndNote=function(){

		delibNoteFactory.getListNote($scope.filiere,$scope.annee).then(function(arrItems){
   console.log("$scope.filiere: "+$scope.filiere+"\n$scope.annee:"+$scope.annee);
   console.log("-------getListMatiereAndNote---------");
		$scope.data.matieres=arrItems.matiere;
        // $scope.data.nom= arrItems.matiere.nom;
        // $scope.data.notes=arrItems.matiere.notes;
       });

		

	}

	$scope.chooseFiliere=function(filiere){
		$scope.filiere=filiere;
	}

	$scope.chooseAnnee=function(annee){
		$scope.annee=annee;
		$scope.getListMatiereAndNote();
	}

	$scope.clickMatiere=function(i){
		$scope.data.notes=$scope.data.matieres[i].notes;
		$scope.ready=true;
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
	anneeScolaireFactory.getListAnnee().then(function(arrItems){
		$scope.data.annees=arrItems;
       });

	$scope.createAnnnee=function(){
		anneeScolaireFactory.getCreatAnnee({
			"description":$scope.data.description,
			"annee":$scope.data.annee,
			"fillieres":$scope.multipleSelect
		});	
		alert($scope.multipleSelect);
		anneeScolaireFactory.getListAnnee().then(function(arrItems){
		$scope.data.annees=arrItems;
       });	
	}

	$scope.fetchFillieres=function(){
		anneeScolaireFactory.getListFilliere().then(function(arrItems){
			$scope.data.fillieres=arrItems;
			console.log(arrItems);
			//$('.selectpicker').selectpicker('refrech')
		});
	}
});
