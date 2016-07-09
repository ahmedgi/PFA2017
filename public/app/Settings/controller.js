app
.controller('SettingsCtrl',function($scope,$http,$filter,settingFactory){

	$scope.tmpEdit   =[];//hold the tmp info of the prof in editing time
	$scope.isEditable=[];//hold the statut of a table line if it's editable or not
	$scope.addVisible=false; //the form add prof is visible
	$scope.isLightboxVisible=false;	
	$scope.activeObj ={};//active prof in the modal-lighbox
	$scope.masks     ={};//the masks of privilege
	$scope.items     =[];//list of the profs 
	$scope.user      ={};//the tmp information of the prof in the form add prof

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
		var obj={"nom":$scope.user.nNom,"prenom":$scope.user.nPrenom,"tel":$scope.user.nTel,"email":$scope.user.nEmail,"grade":$scope.user.nGrade};
		//var obj={"nom":"haaaada howa","prenom":$scope.user.nPrenom,"tel":$scope.user.nTel,"email":$scope.user.nEmail,"grade":$scope.user.nGrade};
		
  $scope.items.push(obj);
		$scope.isEditable.push(false);
		$scope.reset();

		$http({
			method:'POST',
			data:obj,
			url:'/create'
		}).then(
    function success(res){
      if(res.data.info=="non_auto"){
        alert("vous n'êtes pas autorisé !!");
      }
      else alert(JSON.stringify(res.data));
    },function err(res){
      alert(JSON.stringify(res.data.err));
    });
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
  $http(
  {
   method:"POST",
   data  :obj,
   url   :"/update_user"
  }
  );
	}

	$scope.annuler=function(id){//when click on annuler(after editer), it turn the line form to a simple table line
		$scope.isEditable[id]=false;
	}

	//----------------------------Delete Modal---------------------------------------------------------------------------------------------------------------------------------------
	$scope.delete=function(obj){//when click on delete ,it show up the confirmation modal 
		$scope.activeObj=obj;
		$scope.lightboxContentSwitch="delete";
	};

	$scope.confirmDelete=function(obj){//when click on confirmer(after delete), it delete the active prof
		$scope.items.splice($scope.items.indexOf(obj),1);
        alert("hnaya")
        $http({
			method:'POST',
			data:{user_id:obj._id},
			url   :'http://localhost:801/delete_user'
		}).then(function success(res){alert(JSON.stringify(res.data));},function err(res){alert(res.data.err);});
		$scope.hideLightbox();
	};

	//----------------------------Privelege Modal-----------------------------------------------------------------------------------------------------------------------------------
	$scope.privilege=function(obj){//when click on privilege , show up the modal-lightbox of the privilege of the active prof
		$scope.lightboxContentSwitch="settings";	
		$scope.activeObj=obj;
  console.log(JSON.stringify(obj.security_mask));
		$scope.masks.prof=(obj.security_mask&1)==1?true:false;
		$scope.masks.filliere=(obj.security_mask&2)==2?true:false;
		$scope.masks.departement=(obj.security_mask&4)==4?true:false;
		$scope.masks.admin=(obj.security_mask&8)==8?true:false;

	};

	$scope.confirmPrivilege=function(){//when click on confirm(after privilege), change the privilege of a prof

		//$scope.activeObj.mask=0;//????
  console.log(JSON.stringify($scope.activeObj));
		if($scope.masks.prof){$scope.activeObj.security_mask|=1;}
		if($scope.masks.filliere){$scope.activeObj.security_mask|=2;}
		if($scope.masks.departement){$scope.activeObj.security_mask|=4;}
		if($scope.masks.admin){$scope.activeObj.security_mask|=8;}
  alert(JSON.stringify($scope.activeObj.security_mask));
  $http({
			method:'POST',
			data:$scope.activeObj,
			url:'/admin_data'
		}).then(function success(res){alert(JSON.stringify(res.data));},function err(res){alert(res.data.err);});
 };

	//----------------------------Matiere Modal-----------------------------------------------------------------------------------------------------------------------------------

	$scope.matiere=function(obj){
		$scope.lightboxContentSwitch="matiere";	
		$scope.activeObj=obj;

		$scope.test=$filter('filter')($scope.matieres,function(d){return d.idProf==obj._id});
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

app.controller("affectationCont",function($scope,$filter,$http,affectionFactory,settingFactory){
	
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
         //console.log(JSON.stringify(arrItems));
       //$scope.isAffected.push(false);
 });

	$scope.options=function(n){// when click on options btn, fetch the profs and check if they are affected to the current subject

	//$scope.isAffected=[];
		$scope.activeSubject=n;
		$scope.radio={};
		$scope.radio.id=0;
		$scope.radio.id=$scope.matieres[n].idProf;
  console.log("++++++++"+$scope.matieres[n].idProf);
		console.log($scope.radio.id+"-----"+$scope.matieres[n].idProf);

		//----the following algorithm is performed for the case of one subject for multiple 
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
 
		var findProfName=$filter("getProfName");
		//changing the affectation of the active subject subject
		$scope.matieres[$scope.activeSubject].idProf=$scope.radio.id;
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
       $scope.matieres[$scope.activeSubject].nomProf=findProfName($scope.profs,$scope.matieres[$scope.activeSubject].idProf);
     },function err(res){
     alert(res.data.err);
    });
	}
});






