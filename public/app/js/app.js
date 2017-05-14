/* global io */
'use strict';
var serverip = 'localhost:8010'
/**
 * @ngdoc overview
 * @name frontpfaApp
 * @description
 * # frontpfaApp
 *
 * Main module of the application.
 */
 
 /*
 	Declaration du module angualr  
 */
 
 
 
 var app = angular.module('pfaApp',[
    // Dépendances du "module"
    'ngRoute',
    'ui.bootstrap.contextMenu',
    'ui.router',
    'angularNotify'
]);
 
 app.run(function($rootScope){
      var socket = io('http://localhost:8010');

      $rootScope.socket = socket;
      
 })
/**
 * Configuration du module principal : App
 */

/*
app.config(['$routeProvider',
    function($routeProvider) { 
        
        // Système de routage
        $routeProvider
        .when('/home', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
		.when('/', {
            templateUrl: 'home.html',
            controller: 'homeCtrl'
        })
        .when('/Gest-Charges', {
            templateUrl: 'Gest-Charges/GestCharges.html',
            controller: 'GestChargesCtrl'
          }).
		  when ('/Gest-Delib', {
		   templateUrl: 'Gest-Delib/GestDelib.html',
            controller: 'GestDelibCtrl'
			}).
			when ('/Gest-Filiere', {
			templateUrl: 'Gest-Filiere/index.html',
            controller: 'gestionFilierController'
			}).
			when ('/Gest-Scolarite', {
			templateUrl: 'Gest-Scolarite/GestScolar.html',
            controller: 'GestScolarCtrl'
			}).
			when ('/Settings', {
			templateUrl: 'Settings/Settings.html',
            controller: 'SettingsCtrl'
			}).
			
		otherwise({
         //   redirectTo: '/home'
        });
    }
]);

*/
app.config(function($stateProvider, $urlRouterProvider) {

// For any unmatched url, redirect to /index.html
  $urlRouterProvider.otherwise("home");
  $stateProvider.
            state('home', {
            url : '/home',
            templateUrl: 'home.html',
            controller: 'homeCtrl'
            }).
            state('Gest-Charges', {
            url : '/Gest-Charges',
            templateUrl: 'Gest-Charges/GestCharges.html',
            controller: 'GestChargesCtrl'
            }).
		    state ('Gest-Delib', {
            url : '/Gest-Delib',
            templateUrl: 'Gest-Delib/index.html'
            }).
            
            state ('Gest-Delib.affectation', {
            url : '/affectation',
            templateUrl: '/Gest-Delib/affectation.html',
            controller: 'affectationCont'
            }).
            state ('Gest-Delib.deliberation', {
            url : '/deliberation',
            templateUrl: 'Gest-Delib/GestDelib.html',
            controller: 'GestDelibCtrl'
            }).
            state ('Gest-Delib.anneeScolaire', {
            url : '/anneeScolaire',
            templateUrl: 'Gest-Delib/anneeScolaire.html',
            controller: 'anneeScolaireCtrl'
            }).
			state ('Gest-Filiere', {
			url : '/Gest-Filiere',
            templateUrl: 'Gest-Filiere/index.html',
            controller: 'gestionFilierController'
			}).state('Gest-Filiere.eModule', {
            url: "/eModule",
            templateUrl: "./Gest-Filiere/eModule"
            })
            .state('Gest-Filiere.module', {
            url: "/module",
            templateUrl: "./Gest-Filiere/module"
            })
            .state('Gest-Filiere.filiere', {
            url: "/filiere",
            templateUrl: "./Gest-Filiere/filiere",
            resolve:{
                "check": function (profsList,$window) {
                   profsList.getCurrentUser().then(function(){
                       if (profsList.getUser().security_mask <= 1)
                           $window.location.href = "http://" + serverip + "/app/";
                    });
                  }
            }
            }).
			state ('Gest-Scolarite', {
			url : '/Gest-Scolarite',
            templateUrl: 'Gest-Scolarite/GestScolar.html',
            controller: 'GestScolarCtrl'
			}).
			state ('Settings', {
            url : '/Settings',
			      templateUrl: 'Settings/Settings.html',
            controller: 'SettingsCtrl',
            resolve:{
                "check": function (profsList,$window) {
                   profsList.getCurrentUser().then(function(){
                       if (profsList.getUser().security_mask < 8)
                           $window.location.href = "http://" + serverip + "/app/";
                    });
                  }
            }
			}).
			state ('affectation', {
            url : '/affectation',
			templateUrl: 'Settings/affectation.html',
            controller: 'affectationCont'
			})
    });
/**
 * Définition des contrôleurs
 */


// Contrôleur de la page d'accueil
app.controller('mainController',function($scope,$rootScope,$http,$window,profsList,moduleNotifList,eModuleNotifList){
      $scope.eModuleNotifCount = eModuleNotifList.getCount;
      $scope.moduleNotifCount = moduleNotifList.getCount; 
      $scope.user = profsList.getUser;
      profsList.getCurrentUser().then(function(){     
      moduleNotifList.load().then(function(){
           eModuleNotifList.load().then(function(){
           })  
        })
      }) 
      
      
      
      $scope.logout = function(){
          $http({
              method : 'GET',
              url : '/logout'
          },function(response){
             $window.location.href = 'http://'+serverip+'/app/login';
          })
      }
})


app.controller('homeCtrl', ['$scope',
    function($scope){
        $scope.message = "Bienvenue sur la page d'accueil";
    }
]);


app.controller('GestChargesCtrl', ['$scope',
    function($scope){
        $scope.message = "Gestion de charge";
    }
]);

app.controller('GestScolarCtrl', ['$scope',
    function($scope){
        $scope.message = "Gestion de scolarité";
    }
]);


