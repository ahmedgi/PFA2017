
var serverip = 'localhost:8010'


var app = angular.module('pfaApp');

//filterres

app.filter('unique', function() {
        return function(collection, primaryKey, secondaryKey) { //optional secondary key
          var output = [], 
              keys = [];

          angular.forEach(collection, function(item) {
                var key;
                secondaryKey === undefined ? key = item[primaryKey] : key = item[primaryKey][secondaryKey];

                if(keys.indexOf(key) === -1) {
                  keys.push(key);
                  output.push(item);
                }
          });

          return output;
        };
    });
// la liste des parametre
app.factory('parametrelist', function($http){
        this.getparametre=function(){
        return $http({
            method:"GET",
            url:'/parametres',
        }).then(function success(res){
             if(res.data.info=="non_auto"){
                  alert("vous n'avez pas le droit");
                  return [];
             }else
                return res.data.data;
        },function(err){
            alert("erreur de recuperation des param");
        });
    }
    return this;
});
//filiere Service
app.service('filiereService',function($http){
    this.get = function(req){
        var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/filiere/getFiliere',
                        data : req
                    })
         return promise;
    };
    
    this.cree = function(req){
        var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/filiere/creeFiliere',
                        data : req
                    })
         return promise;
    }
    
    this.edite = function(req){
        var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/filiere/editeFiliere',
                        data : req
                    })
         return promise;
    }
    this.delete = function(req){
        var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/filiere/deleteFiliere',
                        data : req
                    })
         return promise;
    }
});

app.service('filiereList',function(filiereService,$rootScope,profsList){
    var items = [];
    var selectedItemIndex =  -1;
    var load  = function(){
                    return filiereService.get({ userId: profsList.getUser()._id, searchQuery: {createdBy : profsList.getUser()._id},
                            populate : [{path : 'annee1.s1',select : 'intitulee'},{path : 'annee1.s2',select : 'intitulee'}
                                        ,{path : 'annee2.s1',select : 'intitulee'},{path : 'annee2.s2',select : 'intitulee'}
                                        ,{path : 'annee3.s1',select : 'intitulee'},{path : 'annee3.s2',select : 'intitulee'}]})
                        .then(function successCallback(response) {
                            items = response.data.data;
                            $rootScope.$broadcast('filiereListUpdate', {});
                        },
                            function errorCallback(response) {

                            }
                            );
    };
    
    var getItems = function(){
        return items;
    };
    
     var getSelectedItemIndex = function(){
        return selectedItemIndex;
    }
    
    var setSelectedItemIndex = function(index){
        selectedItemIndex = index;
    }
    
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex :setSelectedItemIndex
    }
});

//Prof Services
app.service('profService',function($http,$window){
    this.getProfs = function(req){
            var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/profs/getProf',
                        data : req
                    })
            promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
           return promise;
    };
    
    this.getCurrentUser = function(){
        var promise =  $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/profs/currentUser',
                        data : {}
                    });
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
        return promise;
    }
    
    
});


app.service('profsList',function(profService,$rootScope,$window){
    var items = [];
    var user = undefined;
    var getCurrentUser = function(){
       return profService.getCurrentUser().
                    then(function successCallback(response){
                             if(response.data.code == "200")
                                user = response.data.data
                            },
                            function errorCallback(response) {
                                
                            })
    }
    var load = function(){
            return profService.getProfs({userId : user._id, searchQuery : {_id : { $ne : user._id}},responseFields : 'nom prenom'})
                    .then(function successCallback(response){
                                 items = response.data.data;
                                 $rootScope.$broadcast('profsListUpdate',{});
                            },
                            function errorCallback(response) {
                                
                            }
                      );                
            };
    var getItems = function(){
        return items;
    };
    
    var getUser = function(){
        return user
    }
    
    var setUser = function(user){
        user = user
    }
    
    return {
        load : load,
        getItems : getItems,
        getCurrentUser : getCurrentUser,
        getUser : getUser,
        setUser : setUser
    };
});

//Module Services
app.service('moduleService',function($http,$window){
    this.cree = function(req){
        var promise = $http({
                     method: 'POST',
                     url: 'http://'+serverip+'/gestionfiliere/modules/creeModule',
                     data : req
                });
         promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
        return promise;
    }
    
    this.delete = function(req){
        var promise =  $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/deleteModule',
                    data : req
                });
       promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.share = function(req){
        var promise =  $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/shareModule',
                    data : req
                });
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.edite = function(req){
        var promise = $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/modules/remplireModule',
                    data : req
                });
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.load = function(req){
        var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/getModule',
                        data : req
                    })
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
              }
     this.generatePDF = function(req){
         var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/generatePDF',
                        data : req
                    })
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
         return promise;
     }
});

app.service('modulesList',function(moduleService,profsList,$rootScope,$filter){
    var items = []
    var selectedItemIndex =  -1;
    
    var load = function(){
              items = [];
              return  moduleService.load({userId : profsList.getUser()._id, searchQuery : {/*createdBy : profsList.getUser()._id ,*/'coordonnateur' :{ $in : [profsList.getUser()._id]}},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom prenom'},{path : 'updatedBy',select : 'nom prenom'},{path : 'coordonnateur',select : 'nom prenom'},{path : 'eModules',select : 'intitulee'}]})
                      .then(function successCallback(response){
                              items = items.concat(response.data.data);
                              return moduleService.load({userId : profsList.getUser()._id, searchQuery : {createdBy : profsList.getUser()._id },
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom prenom'},{path : 'updatedBy',select : 'nom prenom'},{path : 'coordonnateur',select : 'nom prenom'},{path : 'eModules',select : 'intitulee'}]})
                                .then(function successCallback(response){
                                        items = $filter('orderBy')(items.concat(response.data.data),'-lastUpdate');
                                        $rootScope.$broadcast('moduleListUpdate',{});
                                        },
                                        function errorCallback(response) {
                                            
                                        }
                                );
                            },
                            function errorCallback(response) {
                                
                            }
                      );
            };
    var getItems = function(){
        return items;
    }
    
    var getSelectedItemIndex = function(){
        return selectedItemIndex;
    }
    
    var setSelectedItemIndex = function(index){
        selectedItemIndex = index;
    }
    
    var getPermision = function(moduleId){
            for(var i=0 ; i<items.length ; i++){
                if(items[i]._id == moduleId){
                    if(items[i].createdBy._id == profsList.getUser()._id||items[i].coordonnateur._id == profsList.getUser()._id)
                        return 'w';
                    for(var j = 0 ; j<items[i].sendTo.length ; j++ ){
                        if(items[i].sendTo[j]._id._id == profsList.getUser()._id){
                            return items[i].sendTo[j].permision;
                        }
                    }
                }
            } 
        }
           
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex,
        getPermision : getPermision,
    }
    
});

app.service('moduleNotifService',function($http,$window){
    this.getNotif = function(req){
            var promise =  $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/getNotif',
                        data : req
                    })
            promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
           return promise;
    }
    
    this.updateNotif = function(req){
            var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/modules/updateNotif',
                        data : req
                    })
           promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
           return promise;
    }
});

app.service('moduleNotifList',function($rootScope,moduleNotifService,profService,profsList){
    var items = [];
    var count = 0;
    var load = function(){
        return profService.getProfs({userId : profsList.getUser()._id, searchQuery :{ _id : profsList.getUser()._id},responseFields : 'notification.moduleNotif'})
                    .then(function successCallback(response){
                         return moduleNotifService.getNotif({userId : profsList.getUser()._id, searchQuery : {_id : {$in : response.data.data[0].notification.moduleNotif}},populate : [{path : 'module',select : 'intitulee'},{path : 'eModule',select : 'intitulee'},{path : 'prof',select : 'nom prenom'}]})
                                    .then(function successCallback(response){
                                       count = 0;                                       
                                       items = response.data.data;
                                       if(items)
                                       for(var i=0 ; i< items.length ; i++){
                                           if(items[i].status == 'unseen')
                                                count++;
                                       }
                                       $rootScope.$broadcast('notifsListUpdate',{})
                                    },function errorCallback(respnse){
                                        
                                    });       
                     },
                     function errorCallback(response) {
                                
                      }
                     );
    };
    
    var getItems = function(){
        return items;
    }
    
    var getCount = function(){
        return count;
    }
    
    var setCount = function(n){
        count = n;
    }
    
    return {
        load : load,
        getItems : getItems,
        setCount : setCount,
        getCount : getCount
    }
})


//element de Module Services
app.service('eModuleService',function($http,$window){
    this.cree = function(req){
               var promise = $http({
                     method: 'POST',
                     url: 'http://'+serverip+'/gestionfiliere/eModules/creeEmodule',
                     data : req
                });
               promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
             return promise;
    }
    
    this.delete = function(req){
        var promise = $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/deleteEmodule',
                    data : req
                });
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.share = function(req){
        var promise = $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/shareEmodule',
                    data : req
                });
       promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.edite = function(req){
        var promise = $http({
                    method: 'POST',
                    url: 'http://'+serverip+'/gestionfiliere/eModules/remplireEmodule',
                    data : req
                });
        promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
    }
    
    this.load = function(req){
       var promise = $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/getEmodule',
                        data : req
                    })
       promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
       return promise;
       }
       
});



app.service('eModulesList',function(eModuleService,profsList,$rootScope,$filter){
    var items = []
    var selectedItemIndex =  -1;
    
    var load = function(){
              items = [];
              return  eModuleService.load({userId : profsList.getUser()._id, searchQuery : {/*createdBy : profsList.getUser()._id ,*/'sendTo._id' :{ $in : [profsList.getUser()._id]}},
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom prenom'},{path : 'updatedBy',select : 'nom prenom'},{path : 'sendTo._id',select : 'nom prenom'}]})
                      .then(function successCallback(response){
                               items = items.concat(response.data.data);
                              return eModuleService.load({userId : profsList.getUser()._id, searchQuery : {createdBy : profsList.getUser()._id },
                                    responseFields : '',
                                    populate : [{path : 'createdBy',select : 'nom prenom'},{path : 'updatedBy',select : 'nom prenom'},{path : 'sendTo._id',select : 'nom prenom'}]})
                                .then(function successCallback(response){
                                        items = $filter('orderBy')(items.concat(response.data.data),'-lastUpdate');
                                        $rootScope.$broadcast('eModulesListUpdate',{});
                                        },
                                        function errorCallback(response) {
                                            
                                        }
                                );
                            },
                            function errorCallback(response) {
                                
                            }
                      );
            };
    var getItems = function(){
        return items;
    }
    
    var getSelectedItemIndex = function(){
        return selectedItemIndex;
    }
    
    var setSelectedItemIndex = function(index){
        selectedItemIndex = index;
    }
    

    
    var getPermision = function(eModuleId){
            for(var i=0 ; i<items.length ; i++){
                if(items[i]._id == eModuleId){
                    if(items[i].createdBy._id == profsList.getUser()._id)
                        return 'w';
                    for(var j = 0 ; j<items[i].sendTo.length ; j++ ){
                        if(items[i].sendTo[j]._id._id == profsList.getUser()._id){
                            return items[i].sendTo[j].permision;
                        }
                    }
                }
            } 
        }
    
    return {
        load : load,
        getItems : getItems,
        getSelectedItemIndex : getSelectedItemIndex,
        setSelectedItemIndex : setSelectedItemIndex,
        getPermision : getPermision,
    }
    
});

app.service('eModuleNotifService',function($http,$window){
    this.getNotif = function(req){
            var promise =  $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/getNotif',
                        data : req
                    });
            promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
            return promise;
         
    }
    
    this.updateNotif = function(req){
            var promise =  $http({
                        method: 'POST',
                        url: 'http://'+serverip+'/gestionfiliere/eModules/updateNotif',
                        data : req
                    });
            promise.then(function(response){
                    if(response.data.info == 'non_auto'){
                       $window.location.href = 'http://'+serverip+'/app/login';
                    }
                })
           return promise;
    }
});

app.service('eModuleNotifList',function($rootScope,eModuleNotifService,profService,profsList){
    var items = [];
    var count = 0;
    var load = function(){
       return profService.getProfs({userId : profsList.getUser()._id, searchQuery :{ _id : profsList.getUser()._id},responseFields : 'notification.eModuleNotif'})
                    .then(function successCallback(response){
                         return eModuleNotifService.getNotif({userId : profsList.getUser()._id, searchQuery : {_id : {$in : response.data.data[0].notification.eModuleNotif}},populate : [{path : 'eModule',select : 'intitulee'},{path : 'prof',select : 'nom prenom'}]})
                                    .then(function successCallback(response){
                                       count = 0;
                                       items = response.data.data;
                                       if(items)
                                       for(var i=0 ; i< items.length ; i++){
                                           if(items[i].status == 'unseen')
                                                count++;
                                       }
                                       $rootScope.$broadcast('notifsListUpdate',{})
                                    },function errorCallback(respnse){
                                        
                                    });       
                     },
                     function errorCallback(response) {
                                
                      }
                      );
        
    };
    
    var getItems = function(){
        return items;
    }
    
    var getCount = function(){
        return count;
    }
    
    var setCount = function(n){
        count = n;
    }
    
    return {
        load : load,
        getItems : getItems,
        getCount : getCount,
        setCount : setCount
    }
})



//Module Controllers
app.controller('m_creeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                cordId : '',
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
               // $('.selectpicker').selectpicker('refresh');

                $scope.cree.req.userId = profsList.getUser()._id;
                $scope.cree.validation.WTaken = false;
                $scope.cree.validation.taken = false;
                $scope.cree.req.intitulee = '';
                $scope.creeModuleForm.intitulee.$setUntouched();
                $scope.cree.req.cordId = '';
            }
            ,
            submit : function(){
                //if($scope.cree.req.cordId._id)
                $scope.cree.req.cordId = $scope.cree.req.cordId._id;
                moduleService.cree($scope.cree.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load();
                                            $('#creeModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "Module "+$scope.cree.req.intitulee+" cree avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }else if(response.data.code == '003'){
                                            $scope.cree.validation.taken = true;
                                        }else {
                                            $('#creeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                          $('#creeModal').modal('hide');
                                           var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                    }
                             );
                
            },
            annuler : function(){

            }
        }
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('m_shareModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.share = {
            req : {
                userId : '',
                moduleId : '',
                cordId : '',
            },
            currentCord : '',
            removeCurrentCord : function(){
                $scope.share.currentCord = '';
            }
            ,
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
                $('.selectpicker').selectpicker('refresh');

                $scope.share.req.userId = profsList.getUser()._id
                $scope.share.req.cordId = '';
                $scope.share.req.moduleId = modulesList.getItems()[modulesList.getSelectedItemIndex()]._id;
                $scope.share.currentCord = modulesList.getItems()[modulesList.getSelectedItemIndex()].coordonnateur;
            }
            ,
            submit : function(){
                $scope.share.req.cordId = $scope.share.req.cordId._id;
                moduleService.share($scope.share.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load();
                                            $('#shareModal').modal('hide');
                                        }else {
                                             $('#shareModal').modal('hide');
                                        }
                                    },
                                    function errorCallback(response) {
                                     }
                             );
                
            },
            annuler : function(){

            }
        }
        
        $scope.$on('init_shareModal',function(){
            $scope.share.init();
        })
        
})

app.controller('m_headerController',function($scope,$rootScope,moduleNotifList,profService,moduleNotifService,modulesList,profsList){
        $scope.selectedItemIndex = modulesList.getSelectedItemIndex;
        $scope.getPermision = modulesList.getPermision;
        $scope.header = {
            moduleNotif : moduleNotifList.getItems,
            newNotifCount : moduleNotifList.getCount,
            init : function(){
                   
            }
        }
        

        
        $scope.apercu = function(){
            $rootScope.$broadcast('init_apercuModal',{});
        }
        $scope.edite = function(){
            $rootScope.$broadcast('init_editeModal',{});
        }
        $scope.share = function(){
            $rootScope.$broadcast('init_shareModal',{});
        }
        $scope.cree = function(){
            $rootScope.$broadcast('init_creeModal',{});
        }
        $scope.reportChange = function(){
            $rootScope.$broadcast('updateSearch',$scope.search);
        }
        $scope.notifClick = function(notif){
            if(notif.module){
                $rootScope.$broadcast('init_apercuModal',notif.module._id);
                $('#apercuModal').modal('show');
            }
            if(notif.status == 'unseen'){
                notif.status == 'seen'
                moduleNotifList.setCount(moduleNotifList.getCount()-1)
                moduleNotifService.updateNotif({userId : profsList.getUser()._id, notifId : notif._id,status : 'seen'})
            }
        }
});

app.controller('m_moduleTableController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,$window){
        $scope.selectedItemIndex = modulesList.getSelectedItemIndex;
        $scope.getPermision = modulesList.getPermision;
        $scope.moduleTable = {
            items : modulesList.getItems,
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.moduleTable.selectedIndex = -1;
                modulesList.setSelectedItemIndex(-1);
                $scope.moduleTable.search = '';
            },
            menuOptions : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                   $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                ['Partager...',function($itemScope){
                    $scope.moduleTable.selectedId = $itemScope.module._id;
                    $rootScope.$broadcast('init_shareModal',{});
                    $('#shareModal').modal('show');
                  
                }],
                null
                ,
                ['Télécharger',function($itemScope){
                    moduleService.generatePDF({ userId: $scope.user()._id, moduleId: modulesList.getItems()[modulesList.getSelectedItemIndex()]._id })
                        .then(function (response) {
                            if (response.data.code = '200') {
                                $window.location.href = 'http://' + serverip + response.data.data.url;
                            }
                            else {
                                var notify = {
                                    type: 'error',
                                    title: "une erreur est survenue !!",
                                    content: ''
                                };
                                $scope.$emit('notify', notify);
                            }
                        },function(response){
                            var notify = {
                                type: 'error',
                                title: "une erreur est survenue !!",
                                content: ''
                            };
                            $scope.$emit('notify', notify);
                        });
                }],
                null,
                ['Supprimer',function($itemScope){
                    $scope.moduleTable.selectedId = $itemScope.module._id;
                    $('#deleteModal').modal('show');
                }]
            ],
            menuOptionsw : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                null
                ,['Télécharger',function($itemScope){
                    moduleService.generatePDF({ userId: $scope.user()._id, moduleId: modulesList.getItems()[modulesList.getSelectedItemIndex()]._id })
                        .then(function (response) {
                            if (response.data.code = '200') {
                                $window.location.href = 'http://' + serverip + response.data.data.url;
                            }
                            else {
                                var notify = {
                                    type: 'error',
                                    title: "une erreur est survenue !!",
                                    content: ''
                                };
                                $scope.$emit('notify', notify);
                            }
                        },function(response){
                            var notify = {
                                type: 'error',
                                title: "une erreur est survenue !!",
                                content: ''
                            };
                            $scope.$emit('notify', notify);
                        });
                }],
               ],
            menuOptionsr : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
               ],
            clicked : function(index,id,_intitulee){
                $scope.moduleTable.selectedIndex = index;
                modulesList.setSelectedItemIndex(index);
            }
        }
         
        $scope.$on('updateSearch',function(event,search){
            $scope.moduleTable.search = search;
        })  
})

app.controller('m_deleteModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = modulesList.getItems()[modulesList.getSelectedItemIndex()]._id;
                var userId = profsList.getUser()._id;
                var intitulee = modulesList.getItems()[modulesList.getSelectedItemIndex()].intitulee;
                moduleService.delete({intitulee : intitulee,moduleId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         modulesList.setSelectedItemIndex(-1)
                                         modulesList.load();
                                         var notify = {
                                                type: 'success',
                                                title: "Module "+intitulee+" supprimer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                    }
                             );
            }
        }
});

app.controller('m_editeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,eModulesList,parametrelist){
    $scope.eModules = eModulesList.getItems;
    $scope.listparametre=[];
    $scope.etablissement=[];
    $scope.departement=[];

    parametrelist.getparametre().then(function(arrItems){//fetch the informations of the subjects from the factory
         $scope.listparametre= arrItems;
    });
    //la liste des etabliessements
    $scope.etablissements=function(){
        for(i=0;i<$scope.listparametre.length;i++){
            for(j=0;j<$scope.listparametre[i].etablissements.length;j++){
                $scope.etablissement.push($scope.listparametre[i].etablissements[j]);
            }
        };
        return $scope.etablissement;
    };
   // la liste des departement
    $scope.departements=function(){
        for(i=0;i<$scope.listparametre.length;i++){
            for(j=0;j<$scope.listparametre[i].departements.length;j++){
                $scope.departement.push($scope.listparametre[i].departements[j]);
            }
        };
        return $scope.departement;
    };

    $scope.edite = {
            req : {
                universite : '',
                etablissement : '',
                departement : '',
                intitulee : '',
                prerequis : '',
                objectif : '',
                didactique : '',
                modalitee_evaluation : '',
                note : '',
                status : '',
                userId : '',
                updatedBy : '',
                eModules : [],
            },
            currentEModules : [],
            removeCurrentEM : function(index){
                $scope.edite.currentEModules.splice(index,1);
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(moduleId){
              var tmpModule = modulesList.getItems()[modulesList.getSelectedItemIndex()];
              if(moduleId)
                    for(var i=0 ; i<modulesList.getItems().length ; i++){
                        if(modulesList.getItems()[i]._id == moduleId){
                            tmpModule = modulesList.getItems()[i];
                            break;
                        } 
                    }  
              
              $scope.edite.req.moduleId = tmpModule._id;
              $scope.edite.req.userId = profsList.getUser()._id;
              $scope.edite.req.universite = tmpModule.universite;
              $scope.edite.req.etablissement = tmpModule.etablissement;
              $scope.edite.req.departement = tmpModule.departement;
              $scope.edite.req.intitulee = tmpModule.intitulee;
              $scope.edite.req.prerequis = tmpModule.prerequis;
              $scope.edite.req.objectif = tmpModule.objectif;
              $scope.edite.req.didactique = tmpModule.didactique;
              $scope.edite.req.modalitee_evaluation = tmpModule.modalitee_evaluation;
              $scope.edite.req.note = tmpModule.note;
              $scope.edite.req.status = tmpModule.status; 
              $scope.edite.req.note_minimal = tmpModule.note_minimal;
              $scope.edite.currentEModules = tmpModule.eModules;
              $scope.edite.req.eModules = [];
              
           
              $('.selectpicker').selectpicker()
              $('.selectpicker').selectpicker('refresh');
            },
           submit : function(){
                 $scope.edite.req.eModules =  $scope.edite.req.eModules.concat($scope.edite.currentEModules);
                 
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                moduleService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            modulesList.load(); 
                                            $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "Module "+$scope.edite.req.intitulee+" éditer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                            
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }else {
                                            $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                        $('#editeModal').modal('hide');
                                        var notify = {
                                            type: 'error',
                                            title: "une erreur est survenue !!",
                                            content: ''
                                        };
                                        $scope.$emit('notify', notify);
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(event,id){
            $scope.edite.init(id);
        })
       
        $scope.$on('eModulesListUpdate',function(){
            $('.selectpicker').selectpicker()
            $('.selectpicker').selectpicker('refresh');
        })
});

app.controller('m_apercuModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,$window){
    $scope.module;
    
    $scope.generatePDF = function(){
        moduleService.generatePDF({userId : $scope.user()._id,moduleId : modulesList.getItems()[modulesList.getSelectedItemIndex()]._id })
            .then(function(response){
               if(response.data.code = '200'){
                   $window.location.href = 'http://'+serverip+response.data.data.url;
                   $('#apercuModal').modal('hide');
               }
               else{
                   $('#apercuModal').modal('hide');
                   var notify = {
                       type: 'error',
                       title: "une erreur est survenue !!",
                       content: ''
                   };
                   $scope.$emit('notify', notify);
               }
            },function (response) {
                $('#apercuModal').modal('hide');
                var notify = {
                    type: 'error',
                    title: "une erreur est survenue !!",
                    content: ''
                };
                $scope.$emit('notify', notify);
          });
    }
    
    $scope.init = function(moduleId){
             $scope.module = modulesList.getItems()[modulesList.getSelectedItemIndex()];
              if(moduleId)
                    for(var i=0 ; i<modulesList.getItems().length ; i++){
                        if(modulesList.getItems()[i]._id == moduleId){
                            $scope.module = modulesList.getItems()[i];
                            break;
                        } 
               } 
    }
    
   
        $scope.$on('init_apercuModal',function(event,id){
            $scope.init(id);
        })
});

//element de module Controllers
app.controller('e_shareModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
    $scope.profs = profsList.getItems;
    
    $scope.share = {
            req : {
                intitulee : '',
                userId : '',
                eModuleId : '',
                sendTo : []
            },
            sharedWith : '',
            currentSendTo : '',
            removeCurrentST : function(index){
                $scope.share.currentSendTo.splice(index,1);
            },
            init : function(){
                var eModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
                $('.selectpicker').selectpicker('refresh')
                $scope.share.req.intitulee = eModule.intitulee;
                $scope.share.req.userId = profsList.getUser()._id;
                $scope.share.req.eModuleId = eModule._id;
                $scope.share.req.sendTo = [];
                $scope.share.currentSendTo = eModule.sendTo;
                
                if(eModule.sendTo.length > 0)
                    $scope.share.sharedWith = 'Partgé avec :'
                for(var i=0 ; i<eModule.sendTo.length ; i++){
                         $scope.share.sharedWith = $scope.share.sharedWith.concat(' '+eModule.sendTo[i]._id.nom+',');
                }
                $scope.share.sharedWith = $scope.share.sharedWith.slice(0,-1);
                
            },
            submit : function(){
                $scope.share.req.sendTo =  $scope.share.req.sendTo.concat($scope.share.currentSendTo);
                eModuleService.share($scope.share.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#shareModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "élémenet de module "+$scope.edite.req.intitulee+" partagé avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }else{
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                        var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                    }
                             );
                
            },
            annuler : function(){
            }
            
        }
        
        $scope.$on('init_shareModal',function(){
            $scope.share.init();
        })
});

app.controller('e_editeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){

    $scope.edite = {
            req : {
                userId : '',
                updatedBy : '',
                eModuleId : '',
                intitulee : '',
                volume_horaire : 
                        {
                            cour :0,
                            td : 0,
                            tp : 0
                        },
                activitees_pratique : [],
                description_programme : '', 
                status : '',
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(eModuleId){
              var tmpEModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
              
              if(eModuleId)
                    for(var i=0 ; i<eModulesList.getItems().length ; i++){
                        if(eModulesList.getItems()[i]._id == eModuleId){
                            tmpEModule = eModulesList.getItems()[i];
                            break;
                        } 
               }  
               
              
              $scope.edite.req.userId = profsList.getUser()._id;
              $scope.edite.req.updatedBy = profsList.getUser()._id;
              $scope.edite.req.eModuleId = tmpEModule._id;
              $scope.edite.req.intitulee = tmpEModule.intitulee;
              $scope.edite.req.volume_horaire = tmpEModule.volume_horaire;
              $scope.edite.req.activitees_pratique = tmpEModule.activitees_pratique;
              $scope.edite.req.description_programme = tmpEModule.description_programme;
              $scope.edite.req.status = tmpEModule.status;
              
              
            },
            addActivite : function(){
                var newActivitee = {
                            libellee : '',
                            objectif : '',
                            travaux_terrain : 0,
                            projet : 0,
                            stage : 0,
                            visite_etude : 0
                        }
                $scope.edite.req.activitees_pratique.push(newActivitee);
            }
            ,
            submit : function(){
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                eModuleService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#editeModal').modal('hide');
                                             var notify = {
                                                type: 'success',
                                                title: "élémenet de module "+$scope.edite.req.intitulee+" éditer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }else {
                                            $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                             $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(event,id){
            $scope.edite.init(id);
        })
});



app.controller('e_apercuModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
    $scope.eModule;
    $scope.init = function(eModuleId){
             $scope.eModule = eModulesList.getItems()[eModulesList.getSelectedItemIndex()];
              
              if(eModuleId)
                    for(var i=0 ; i<eModulesList.getItems().length ; i++){
                        if(eModulesList.getItems()[i]._id == eModuleId){
                            $scope.eModule = eModulesList.getItems()[i];
                            break;
                        } 
               } 
    }
    
   
        $scope.$on('init_apercuModal',function(event,id){
            $scope.init(id);
        })
});


app.controller('e_creeModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
         $scope.profs = profsList.getItems;
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                sendTo : [],
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
               //$('.selectpicker').selectpicker('deselectAll');
               $('.selectpicker').selectpicker('refresh');
                
                $scope.cree.req.userId = profsList.getUser()._id
                $scope.cree.validation.WTaken = false;
                $scope.cree.validation.taken = false;
                $scope.cree.req.intitulee = '';
                $scope.creeEModuleForm.intitulee.$setUntouched();
                $scope.cree.req.sendTo = [];
            }
            ,
            submit : function(){
                eModuleService.cree($scope.cree.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            eModulesList.load();
                                            $('#creeModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "élement de Module "+$scope.cree.req.intitulee+" cree avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }else if(response.data.code == '003'){
                                            $scope.cree.validation.taken = true;
                                        }else {
                                             $('#creeModal').modal('hide');
                                             var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                         $('#creeModal').modal('hide');
                                             var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                     }
                             );
                
            },
            annuler : function(){

            }
        }
        
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('e_deleteModalController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
     $scope.delete = {
            delete : function(){
                var id = eModulesList.getItems()[eModulesList.getSelectedItemIndex()]._id;
                var userId = profsList.getUser()._id;
                var intitulee = eModulesList.getItems()[eModulesList.getSelectedItemIndex()].intitulee;
                eModuleService.delete({intitulee : intitulee,eModuleId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         eModulesList.setSelectedItemIndex(-1)
                                         eModulesList.load();
                                         var notify = {
                                                type: 'success',
                                                title: "élément de module "+intitulee+" supprimer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                         var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                     }
                             );
            }
        }
});

app.controller('e_eModuleTableController',function($scope,$rootScope,eModuleService,profService,eModulesList,profsList){
        $scope.selectedItemIndex = eModulesList.getSelectedItemIndex;
        $scope.getPermision = eModulesList.getPermision;
      
        $scope.eModuleTable = {
            items : eModulesList.getItems,
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.eModuleTable.selectedIndex = -1;
                eModulesList.setSelectedItemIndex(-1);
                $scope.eModuleTable.search = '';
            },
            menuOptions : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                ['Partager...',function($itemScope){
                    $scope.eModuleTable.selectedId = $itemScope.eModule._id;
                    $rootScope.$broadcast('init_shareModal',{});
                    $('#shareModal').modal('show');
                  
                }],
                null,
                ['Supprimer',function($itemScope){
                    $scope.eModuleTable.selectedId = $itemScope.eModule._id;
                    $('#deleteModal').modal('show');
                }]
            ],
            menuOptionsw : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
                null,
                ['Modifier',function($itemScope){
                    $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
               ],
            menuOptionsr : [
                ['Apercu', function($itemScope){
                    $rootScope.$broadcast('init_apercuModal',{});
                    $('#apercuModal').modal('show');
                }],
               ],
            clicked : function(index,id,_intitulee){
                $scope.eModuleTable.selectedIndex = index;
                eModulesList.setSelectedItemIndex(index);
            }
        }

        $scope.$on('updateSearch',function(event,search){
            $scope.eModuleTable.search = search;
        })  
})

app.controller('e_headerController',function($scope,$rootScope,eModuleNotifList,profService,eModuleNotifService,eModulesList,profsList){
        $scope.selectedItemIndex = eModulesList.getSelectedItemIndex;
        $scope.getPermision = eModulesList.getPermision;
        $scope.header = {
            eModuleNotif : eModuleNotifList.getItems,
            newNotifCount : eModuleNotifList.getCount,
            init : function(){
               
            }
        }
        

        $scope.apercu = function(){
            $rootScope.$broadcast('init_apercuModal',{});
        }
        $scope.edite = function(){
            $rootScope.$broadcast('init_editeModal',{});
        }
        $scope.share = function(){
            $rootScope.$broadcast('init_shareModal',{});
        }
        $scope.cree = function(){
            $rootScope.$broadcast('init_creeModal',{});
        }
        $scope.reportChange = function(){
            $rootScope.$broadcast('updateSearch',$scope.search);
        }
        $scope.notifClick = function(notif){
            if(notif.eModule){
                $rootScope.$broadcast('init_apercuModal',notif.eModule._id);
                $('#apercuModal').modal('show');
            }
            if(notif.status == 'unseen'){
                notif.status == 'seen'
                eModuleNotifList.setCount(eModuleNotifList.getCount()-1)
                eModuleNotifService.updateNotif({userId : profsList.getUser()._id, notifId : notif._id,status : 'seen'})
                 .then(function(){
                })
            }
        }
});


//filiere Controllers

app.controller('f_editeModalController',function($scope,$rootScope,moduleService,profService,modulesList,profsList,filiereService,filiereList){
    $scope.modules = modulesList.getItems;
    $scope.edite = {
            req : {
                userId : '',
                filiereId: '',
                intitulee : '',
                status : '',
                annee1 : {
                    s1 : [],
                    s2 : []
                },
                annee2 : {
                    s1 : [],
                    s2 : []
                },
                annee3 : {
                    s1 : [],
                    s2 : []
                }
            },
            currentModules : {
                annee1 : {
                    s1 : [],
                    s2 : []
                },
                annee2 : {
                    s1 : [],
                    s2 : []
                },
                annee3 : {
                    s1 : [],
                    s2 : []
                }
            },
            removeCurrentM : function(index,annee,s){
                $scope.edite.currentModules[annee][s].splice(index,1);
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(filiereId){
              var tmpFiliere = filiereList.getItems()[filiereList.getSelectedItemIndex()];
              if(filiereId)
                    for(var i=0 ; i<filiereList.getItems().length ; i++){
                        if(filiereList.getItems()[i]._id == filiereId){
                            tmpFiliere = filiereList.getItems()[i];
                            break;
                        } 
                    }  
               
              
              $scope.edite.req.filiereId = tmpFiliere._id;
              $scope.edite.req.intitulee = tmpFiliere.intitulee;
              $scope.edite.req.status = tmpFiliere.status;
              $scope.edite.req.userId = profsList.getUser()._id;
              $scope.edite.currentModules.annee1 = tmpFiliere.annee1;
              $scope.edite.currentModules.annee2 = tmpFiliere.annee2;
              $scope.edite.currentModules.annee3 = tmpFiliere.annee3;
              $scope.edite.req.annee1 = {s1 : [],s2 : []};
              $scope.edite.req.annee2 = {s1 : [],s2 : []};
              $scope.edite.req.annee3 = {s1 : [],s2 : []};
              
              $('.selectpicker').selectpicker()
              $('.selectpicker').selectpicker('refresh');
            },
           submit : function(){
                 
                 for(var i=0; i<$scope.edite.req.annee1.s1.length ; i++){
                     $scope.edite.req.annee1.s1[i] = {_id : $scope.edite.req.annee1.s1[i]._id}
                 }
                 for(var i=0; i<$scope.edite.req.annee1.s2.length ; i++){
                     $scope.edite.req.annee1.s2[i] = {_id : $scope.edite.req.annee1.s2[i]._id }
                 }
                 for(var i=0; i<$scope.edite.req.annee2.s1.length ; i++){
                     $scope.edite.req.annee2.s1[i] = {_id : $scope.edite.req.annee2.s1[i]._id }
                 }
                 for(var i=0; i<$scope.edite.req.annee2.s2.length ; i++){
                     $scope.edite.req.annee2.s2[i] = {_id : $scope.edite.req.annee2.s2[i]._id }
                 }
                 for(var i=0; i<$scope.edite.req.annee3.s1.length ; i++){
                     $scope.edite.req.annee3.s1[i] = {_id : $scope.edite.req.annee3.s1[i]._id }
                 }
                 for(var i=0; i<$scope.edite.req.annee3.s2.length ; i++){
                     $scope.edite.req.annee3.s2[i] = {_id : $scope.edite.req.annee3.s2[i]._id }
                 }
                 
                 
                 $scope.edite.req.annee1.s1 =  $scope.edite.req.annee1.s1.concat($scope.edite.currentModules.annee1.s1);
                 $scope.edite.req.annee1.s2 =  $scope.edite.req.annee1.s2.concat($scope.edite.currentModules.annee1.s2);
                 $scope.edite.req.annee2.s1 =  $scope.edite.req.annee2.s1.concat($scope.edite.currentModules.annee2.s1);
                 $scope.edite.req.annee2.s2 =  $scope.edite.req.annee2.s2.concat($scope.edite.currentModules.annee2.s2);
                 $scope.edite.req.annee3.s1 =  $scope.edite.req.annee3.s1.concat($scope.edite.currentModules.annee3.s1);
                 $scope.edite.req.annee3.s2 =  $scope.edite.req.annee3.s2.concat($scope.edite.currentModules.annee3.s2);
                
                
                console.log(JSON.stringify( $scope.edite.req.annee1)) 
                
                
                if(!$scope.editeForm.$pristine){
                    $scope.edite.req.lastUpdate = new Date();
                }
                
                
                filiereService.edite($scope.edite.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            filiereList.load(); 
                                            $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "Filiere "+$scope.edite.req.intitulee+" éditer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                            
                                        }else if(response.data.code == "003"){
                                            $scope.edite.validation.taken = true;
                                            $('#editeModal').scrollTop(0)
                                        }else {
                                            $('#editeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                        var notify = {
                                            type: 'error',
                                            title: "une erreur est survenue !!",
                                            content: ''
                                        };
                                        $scope.$emit('notify', notify);
                                     }
                             );
                
            },
            annuler : function(){
            }
            
        }
        $scope.$on('init_editeModal',function(event,id){
            $scope.edite.init(id);
        })
       
        $scope.$on('filiereListUpdate',function(){
            $('.selectpicker').selectpicker()
            $('.selectpicker').selectpicker('refresh');
        })
});


app.controller('f_deleteModalController',function($scope,$rootScope,moduleService,profService,modulesList,filiereList,profsList,filiereService){
     $scope.delete = {
            delete : function(){
                var id = filiereList.getItems()[filiereList.getSelectedItemIndex()]._id;
                var userId = profsList.getUser()._id;
                var intitulee = filiereList.getItems()[filiereList.getSelectedItemIndex()].intitulee;
                filiereService.delete({filiereId : id,userId : userId})
                               .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                         filiereList.load();
                                         filiereList.setSelectedItemIndex(-1)
                                         var notify = {
                                                type: 'success',
                                                title: "filiere "+intitulee+" supprimer avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                    }
                             );
            }
        }
});

app.controller('f_filiereTableController',function($scope,$rootScope,moduleService,profService,modulesList,filiereService,filiereList,profsList){
        $scope.selectedItemIndex = filiereList.getSelectedItemIndex;
        var prof=profsList.getItems;
        $scope.moreinfo=function(){
             return function($itemScope){
                   $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                };
        };
        $scope.responsable=function(id){
            return prof().filter(function(v){
                return v._id===id;
            });
        };
        $scope.filiereTable = {
            items : filiereList.getItems,
            search : '',
            selectedIndex : -1,
            init : function(){  
                $scope.filiereTable.selectedIndex = -1;
                filiereList.setSelectedItemIndex(-1);
                $scope.filiereTable.search = '';
            },
            menuOptions : [
                ['Modifier',function($itemScope){
                   $rootScope.$broadcast('init_editeModal',{});
                    $('#editeModal').modal('show');
                }],
                null,
                ['Supprimer',function($itemScope){
                    $scope.filiereTable.selectedId = $itemScope.filiere._id;
                    $('#deleteModal').modal('show');
                }]
            ],
            clicked : function(index,id,_intitulee){
                $scope.filiereTable.selectedIndex = index;
                filiereList.setSelectedItemIndex(index);
            }
        }
         
        $scope.$on('updateSearch',function(event,search){
            $scope.filiereTable.search = search;
        })  
})


app.controller('f_headerController',function($scope,$rootScope,filiereService,profService,filiereList,profsList){
        $scope.selectedItemIndex = filiereList.getSelectedItemIndex;
        $scope.filiereList
        
        $scope.cree = function(){
            $rootScope.$broadcast('init_creeModal',{});
        }
        $scope.edite = function(){
            $rootScope.$broadcast('init_editeModal',{});
        }
})
app.controller('f_creeController',function($scope,$rootScope,filiereService,profService,filiereList,profsList){
         $scope.filieres = filiereList.getItems;
         $scope.profs = profsList.getItems;
         $scope.cree = {
            req : {
                userId : '',
                intitulee : '',
                cordId :'',
            },
            validation : {
                 taken : false,
                 WTaken : false
            },
            init : function(){
                $scope.cree.req.userId = profsList.getUser()._id;
                $scope.cree.validation.WTaken = false;
                $scope.cree.validation.taken = false;
                $scope.cree.req.intitulee = '';
                $scope.cree.req.cordId = '';
                $scope.creeFiliereForm.intitulee.$setUntouched();
            }
            ,
            submit : function(){
                $scope.cree.req.cordId = $scope.cree.req.cordId._id;
                filiereService.cree($scope.cree.req)
                              .then(function successCallback(response){
                                        if(response.data.code == '200'){
                                            filiereList.load();
                                            $('#creeModal').modal('hide');
                                            var notify = {
                                                type: 'success',
                                                title: "Filiere "+$scope.cree.req.intitulee+" cree avec succes ",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }else if(response.data.code == '003'){
                                            $scope.cree.validation.taken = true;
                                        }else {
                                            $('#creeModal').modal('hide');
                                            var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                        }
                                    },
                                    function errorCallback(response) {
                                        var notify = {
                                                type: 'error',
                                                title: "une erreur est survenue !!",
                                                content: ''
                                            };
                                            $scope.$emit('notify', notify);
                                    }
                             );
                
            },
            annuler : function(){

            }
        }
        
        $scope.$on('init_creeModal',function(){
            $scope.cree.init();
        })
        
})

app.controller('gestionFilierController',function($window,$scope,$rootScope,profService,modulesList,profsList,eModulesList,eModuleNotifList,moduleNotifList,moduleNotifService,eModuleNotifService,filiereList){
        
        $scope.modulesList = modulesList.getItems;
        $scope.eModulesList = eModulesList.getItems;
        $scope.eModuleNotifCount = eModuleNotifList.getCount;
        $scope.moduleNotifCount = moduleNotifList.getCount; 
        $scope.filiereList = filiereList.getItems
        $scope.user = profsList.getUser;
        profsList.getCurrentUser().then(function(){        
        profsList.load().then(function(){               
            eModulesList.load().then(function(){        
                modulesList.load().then(function(){
                    eModuleNotifList.load().then(function(){
                        moduleNotifList.load().then(function(){
                           filiereList.load().then(function(){
                                $rootScope.socket.emit("registerUser",$scope.user()._id)
                            });
                        })
                    })
                })
            })
        })
       })  
       
       
       $rootScope.socket.on('newModuleNotif',function(notifId){
           moduleNotifService.getNotif({userId : $scope.user()._id,searchQuery : {_id : notifId},populate : [{path : 'prof',select : 'nom prenom'},{path : 'module',select : 'status'},{path : 'eModule',select : 'intitulee status'}]})
                    .then(function(response){
                       if(response.data.code = '200'&&response.data.data.length>0){
                        var notif = response.data.data[0];
                        var notify;
                        if(notif.typee == 'update'){
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a modifier '+notif.intitulee,
                                content: 'status : '+notif.module.status
                            };
                        }
                        else if(notif.typee == 'cord')
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' vous a designé coordonnateur du Module ' + notif.intitulee,
                                content: 'status : ' + notif.module.status
                            };
                       else if(notif.typee == 'share')
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a partagé avec vous ' + notif.intitulee,
                                content: 'status : ' + notif.module.status
                            };
                       else if(notif.typee == 'eModuleUpdate')
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a modifier ' + notif.intitulee,
                                content: 'element de module Modifier: '+notif.eModule.intitulee+'\nstatus : ' + notif.module.status
                            };
                       else if(notif.typee == 'delete')
                             notify = {
                                type: 'warning',
                                title: notif.prof.nom + ' a Supprimer ' + notif.intitulee,
                                content: ''
                            };
                      
                        
                        if(notify)    
                            $scope.$emit('notify', notify);
                      }
                    })
           
                    moduleNotifList.load().then(function(){
                        modulesList.load();
                    });
                    
            })
            
           $rootScope.socket.on('newEmoduleNotif',function(notifId){
           eModuleNotifService.getNotif({userId : $scope.user()._id,searchQuery : {_id : notifId},populate : [{path : 'prof',select : 'nom prenom'},{path : 'eModule',select : 'status'}]})
                    .then(function(response){
                      if(response.data.code == '200'&&response.data.data.length>0){ 
                        var notif = response.data.data[0];
                        var notify;
                        if(notif.typee == 'update')
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a modifier '+notif.intitulee,
                                content: 'status : '+notif.eModule.status
                            };
                        else if(notif.typee == 'share')
                             notify = {
                                type: 'info',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a partagé avec vous ' + notif.intitulee,
                                content: 'status : ' + notif.eModule.status
                            };
                       else if(notif.typee == 'delete')
                             notify = {
                                type: 'warning',
                                title: notif.prof.nom+" "+notif.prof.prenom+' a Supprimer ' + notif.intitulee,
                                content: ''
                            };
                                
                        $scope.$emit('notify', notify);
                      }
                    })
           
                    eModuleNotifList.load().then(function(){
                        eModulesList.load();
                    });
                    
            })
});