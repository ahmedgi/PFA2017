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
	var refresh=function(){
	settingFactory.getListProf().then(function(arrItems){//fetch the informations of the profs from the factory
         $scope.items = arrItems;
         $scope.isEditable.push(false);
       });
	};
	refresh();
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
		var mask=0;
		if($scope.mask.prof)
			mask=mask+1;
		if($scope.mask.chefFil)
			mask=mask+2;
		if($scope.mask.chefDepart)
			mask=mask+4;
		if($scope.mask.admin)
			mask=mask+8;
		var obj={"nom":$scope.user.nNom,"prenom":$scope.user.nPrenom,"login":$scope.user.nLogin,"tel":$scope.user.nTel,"email":$scope.user.nEmail,"grade":$scope.user.nGrade,"passwd":$scope.user.npasswd,"security_mask":mask};
		//var obj={"nom":"haaaada howa","prenom":$scope.user.nPrenom,"tel":$scope.user.nTel,"email":$scope.user.nEmail,"grade":$scope.user.nGrade};
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
      			else {
      				alert(JSON.stringify(res.data));
      				$scope.addVisible=false;
      				refresh();
      			}
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
        $http({
			method:'POST',
			data:{user_id:obj._id},
			url   :'http://localhost:8010/delete_user'
		}).then(function success(res){alert(JSON.stringify(res.data));},function err(res){alert(res.data.err);});
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
	};
});









