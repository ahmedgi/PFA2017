'use strict';

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
    'routeAppControllers',
    'ui.bootstrap.contextMenu',
    'ui.router'
]);
  
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
            templateUrl: 'Gest-Delib/GestDelib.html',
            controller: 'GestDelibCtrl'
			}).
			state ('Gest-Filiere', {
			url : '/Gest-Filiere',
            templateUrl: 'Gest-Filiere/index.html',
            controller: 'gestionFilierController'
			}).
			state ('Gest-Scolarite', {
			url : '/Gest-Scolarite',
            templateUrl: 'Gest-Scolarite/GestScolar.html',
            controller: 'GestScolarCtrl'
			}).
			state ('Settings', {
            url : '/Settings',
			templateUrl: 'Settings/Settings.html',
            controller: 'SettingsCtrl'
			})
    });
/**
 * Définition des contrôleurs
 */
var routeAppControllers = angular.module('routeAppControllers', []);


// Contrôleur de la page d'accueil
routeAppControllers.controller('homeCtrl', ['$scope',
    function($scope){
        $scope.message = "Bienvenue sur la page d'accueil";
    }
]);

routeAppControllers.controller('GestChargesCtrl', ['$scope',
    function($scope){
        $scope.message = "Gestion de charge";
    }
]);

routeAppControllers.controller('GestDelibCtrl', ['$scope',
    function($scope){
        $scope.message = "Gestion de délibération";
    }
]);



routeAppControllers.controller('GestScolarCtrl', ['$scope',
    function($scope){
        $scope.message = "Gestion de scolarité";
    }
]);

routeAppControllers.controller('loginController', ['$scope',
    function($scope){
        alert('ok');
    }
]);
