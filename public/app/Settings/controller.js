app
.controller('SettingsCtrl',function($scope,$filter,settingFactory){

	$scope.tmpEdit=[];//hold the tmp info of the prof in editing time
	$scope.isEditable=[];//hold the statut of a table line if it's editable or not
	$scope.addVisible=false; //the form add prof is visible
	$scope.isLightboxVisible=false;	
	$scope.activeObj={};//active prof in the modal-lighbox
	$scope.masks={};//the masks of privilege
	$scope.items=[];//list of the profs 
	$scope.user={};//the tmp information of the prof in the form add prof

	settingFactory.getListProf().then(function(arrItems){//fetch the informations of the profs from the factory
         $scope.items = arrItems;
         $scope.isEditable.push(false);
       });

	settingFactory.getListMatiere().then(function(arrItems){//fetch the informations of the subjects from the factory
         $scope.matieres = arrItems;
       });

	$scope.add=function(){//when click on the + button , it show up the form add prof
		$scope.addVisible=true;
	}

	$scope.hideAdd=function(){//when click on hide (after +), it hide the form add prof
		$scope.addVisible=false;
	}
	
	$scope.reset=function(){//re-initialize the user tmp variable
		$scope.user=angular.copy($scope.master);
	}

	$scope.valider=function(){//add a new prof to the list of profs (items)
		var obj={"nom":$scope.user.nNom,"prenom":$scope.user.nPrenom,"tel":$scope.user.nTel,"grade":$scope.user.nGrade};
		$scope.items.push(obj);
		$scope.isEditable.push(false);
		$scope.reset();
	}
	
	$scope.editer=function(obj,id){//when click on editer button, it turn the line of the table to a form
		$scope.isEditable[id]=true;
		var tmp={};
		angular.copy(obj,tmp);
		$scope.tmpEdit[id]=tmp;
	}
	
	$scope.confirm=function(id,obj){//when click on confirmer(after editer), it copy the tmp edit info to the prof informations
		$scope.isEditable[id]=false;
		angular.copy($scope.tmpEdit[id],obj);
	}

	$scope.annuler=function(id){//when click on annuler(after editer), it turn the line form to a simple table line
		$scope.isEditable[id]=false;
	}

	//----------------------------Delete Modal---------------------------------------------------------------------------------------------------------------------------------------
	$scope.delete=function(obj){//when click on delete ,it show up the confirmation modal 
		$scope.activeObj=obj;
		$scope.lightboxContentSwitch="delete";
	}

	$scope.confirmDelete=function(obj){//wheck click on confirmer(after delete), it delete the active prof
		$scope.items.splice($scope.items.indexOf(obj),1);
		$scope.hideLightbox();
	}

	//----------------------------Privelege Modal-----------------------------------------------------------------------------------------------------------------------------------
	$scope.privilege=function(obj){//when click on privilege , show up the modal-lightbox of the privilege of the active prof
		$scope.lightboxContentSwitch="settings";	
		$scope.activeObj=obj;

		$scope.masks.prof=((obj.mask&1)==1?true:false);
		$scope.masks.filliere=(obj.mask&2)==2?true:false;
		$scope.masks.departement=(obj.mask&4)==4?true:false;
		$scope.masks.admin=(obj.mask&8)==8?true:false;

	}

	$scope.confirmPrivilege=function(){//when click on confirm(after privilege), change the privilege of a prof

		$scope.activeObj.mask=0;

		if($scope.masks.prof){$scope.activeObj.mask+=1;}
		if($scope.masks.filliere){$scope.activeObj.mask+=2;}
		if($scope.masks.departement){$scope.activeObj.mask+=4;}
		if($scope.masks.admin){$scope.activeObj.mask+=8;}
	}

	//----------------------------Matiere Modal-----------------------------------------------------------------------------------------------------------------------------------

	$scope.matiere=function(obj){
		$scope.lightboxContentSwitch="matiere";	
		$scope.activeObj=obj;

		$scope.test=$filter('filter')($scope.matieres,function(d){return d.idProf==obj.id});
	}
});

app.controller("affectationCont",function($scope,$filter,affectionFactory,settingFactory){
	
	$scope.matieres=[];
	$scope.profs=[];
	$scope.isAffected=[];
	$scope.activeAffectation=[];//hold the ids of the prof for the active subject
	$scope.activeSubject=0;


	affectionFactory.getListMatiere().then(function(arrItems){//fetch the informations of the subject from the factory
         $scope.matieres = arrItems;
       });

	settingFactory.getListProf().then(function(arrItems){//fetch the informations of the profs from the factory
         $scope.profs = arrItems;
        // $scope.isAffected.push(false);
       });

	$scope.options=function(n){// when click on options btn, fetch the profs and check if they are affected to the current subject

		//$scope.isAffected=[];
		$scope.activeSubject=n;
		$scope.radio={};
		$scope.radio.id=0;
		$scope.radio.id=$scope.matieres[n].profs[0];
		console.log($scope.radio.id+"-----"+$scope.matieres[n].profs[0]);

		//----the following algorithm is performed for the case of one subject for multiple profs
		/*
		for(var i=0;i<$scope.matieres[n].profs.length;i++){

			for(var j=0;j<$scope.profs.length;j++){

				if($scope.matieres[n].profs[i]==$scope.profs[j].id){

					$scope.isAffected[j]=true;
					$scope.activeAffectation.push($scope.profs[j].id);
					break;
				}
			}
		}*/
	}

	$scope.confirmer=function(){//when click on confirm(after options), it save the affectation info

		
		//changing the affectation of the active subject subject
		$scope.matieres[$scope.activeSubject].profs[0]=$scope.radio.id;

	}
});