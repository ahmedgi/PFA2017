app
.controller('SettingsCtrl',function($scope,$http,$filter,settingFactory,multipartForm){

	$scope.tmpEdit   =[];//hold the tmp info of the prof in editing time
	$scope.isEditable=[];//hold the statut of a table line if it's editable or not
	$scope.addVisible=false; //the form add prof is visible
	$scope.isLightboxVisible=false;	
	$scope.activeObj ={};//active prof in the modal-lighbox
	$scope.masks     ={};//the masks of privilege
	$scope.items     =[];//list of the profs 
	$scope.user      ={};//the tmp information of the prof in the form add prof
	$scope.TypeList=["Professeur","Ingenieurs"];
	$scope.GradeList=["PA","PH","PES"];
	$scope.adduniv=false;
	$scope.addetab=[];
	$scope.adddep=[];
	$scope.ListPrametre=[];


	$scope.grade=function(){
		if(!$scope.user.selectedtype){
			return false;
		}else{
			if($scope.user.selectedtype=='Professeur'){
			return true;
			}else return false;
		}
	};

	// ajouter une université
	$scope.hideAddUniv=function(){
		$scope.adduniv=false;
	};
	$scope.Adduniv=function(){
		$scope.adduniv=true;
		$scope.addVisible=false;
	};
	//uploade images
	$scope.ajouteruniv=function(){
		$scope.addVisible=false;
		$scope.addetab.push($scope.etab);
		$scope.adddep.push($scope.dep);
		var univ={"nom":$scope.univ.nom,"abrev":$scope.univ.abrev,"etablissements":$scope.addetab,"departements":$scope.adddep};
		$scope.adduniv=false;
		$scope.ListPrametre.push(univ);
		$http({
			method:'POST',
			data:univ,
			url:'/createuniv'
		}).then(
    		function success(res){
      			if(res.data.info=="non_auto"){
        			alert("vous n'êtes pas autorisé !!");
     				 }
      			else {
      				alert(JSON.stringify(res.data.ok));
      			}
    		},function err(res){
      		alert(JSON.stringify(res.data.err));
    });
	};
	// add departement
	$scope.Addep=function(){
		$scope.adddep.push({});
	};
	$scope.deldep=function(id){
		$scope.adddep.splice(id,1);
	}
	// ajouter etablisement

	$scope.Addetab=function(){
		$scope.addetab.push({});
	};
	$scope.deletab=function(id){
		$scope.addetab.splice(id,1);
	};


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
	settingFactory.getParametre().then(function(array){
		$scope.ListPrametre=array;
	});
	$scope.add=function(){//when click on the + button , it show up the form add prof
		$scope.addVisible=true;
		$scope.adduniv=false;
	}

	$scope.hideAdd=function(){//when click on hide (after +), it hide the form add prof
		$scope.addVisible=false;
	}
	
	$scope.reset=function(){//re-initialize the user tmp variable
		$scope.user=angular.copy($scope.master);
	}

	$scope.valider=function(){//add a new prof to the list of profs (items)

		var obj={nom:$scope.user.nom,prenom:$scope.user.prenom,login:$scope.user.username,tel:$scope.user.tel,email:$scope.user.email,type:$scope.user.selectedtype,grade:$scope.user.selectedgrade};
		$scope.items.push(obj);
		multipartForm.post('/create', $scope.user);
		$scope.isEditable.push(false);
		$scope.reset();
	};
	
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
	// delete the parametre
	$scope.deleteP=function(parametre){
		$scope.ListPrametre.splice($scope.ListPrametre.indexOf(parametre),1);
		$http({
			method:"post",
			data:parametre,
			url:'/delete_param'
		}).then(function success(res){
			alert(res.data.ok);
		},function err(res){
			alert(res.data.err);
		});
	};

	$scope.confirmDelete=function(obj){//when click on confirmer(after delete), it delete the active prof
		$scope.items.splice($scope.items.indexOf(obj),1);
        $http({
			method:'POST',
			data:{user_id:obj._id},
			url   :'http://localhost:8010/delete_user'
		}).then(function success(res){alert(JSON.stringify(res.data));
		},function err(res){alert(res.data.err);});
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









