// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('MCMRelationshop', [
	'ionic',
	'toaster',	
	'Scope.safeApply',	
	'MCMRelationshop.Push',
	'MCMRelationshop.Config',
	'security',
	'MCMRelationshop.Resource.Store',
	'MCMRelationshop.Resource.User',
	'MCMRelationshop.Intro',
	'MCMRelationshop.Home',
	'MCMRelationshop.Login',
	
	//Angular Utils
	'ui.utils',
	
	'ionic.contrib.drawer'

])
.config(function($sceDelegateProvider, $compileProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'http://**',
    'https://**',
    'geo:/**',
    'tel:/**',
    'maps:/**',
    'maps:**',
    'chrome-extension:/**',
  ]);
  /*
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|geo|tel|chrome-extension):/);
  */
})
.run(function($ionicPlatform, $http, DSCacheFactory, push, CacheUtil,MCMAnalytics, MCMTracker, APP_CONFIG) {
	// register push notification 
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		/*	
		if(navigator.splashscreen){
			navigator.splashscreen.hide();
		}
		*/
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
			//StatusBar.hide();
		}
		// default caches
		 $http.defaults.cache = CacheUtil.getHttpCache();
		});
})
.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state('app', {
			url: "/app",
			abstract: true,
			templateUrl: "templates/menu.html",
			controller: 'AppCtrl',
			resolve: {
				ready: ['$q','$ionicPlatform', function($q,$ionicPlatform){
					var q = $q.defer();

					  $ionicPlatform.ready(function(){
					    q.resolve();
					    
					  });
					return q.promise;

				}],
				

			}
		})
		.state('app.intro',{
			url: "/intro",
			views: {
				'menuContent': {
					controller: 'IntroCtrl',
					templateUrl: 'app/intro/intro.html'
				}
			}
		})
		.state('app.home', {
			url: "/home",
			views: {
				'menuContent': {
					controller: 'HomeCtrl',
					templateUrl: "app/home/home.html",
				}
			}
		})
		.state('app.login', {
			url: "/login?return&hidebar",
			views: {
				'menuContent': {
					//controller: 'LoginCtrl',
					templateUrl: "app/login/login.html",
				}
			}
		})
		
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
})
.controller('AppCtrl', ['$scope','$state','$stateParams', '$ionicModal', '$timeout', 'AppUtil','APP_CONFIG','CacheUtil','$ionicViewService','$ionicPopup','$ionicSideMenuDelegate','$ionicGesture','$ionicNavBarDelegate',
	function($scope,$state, $stateParams, $ionicModal, $timeout, AppUtil, APP_CONFIG,  CacheUtil, $ionicViewService, $ionicPopup, $ionicSideMenuDelegate,$ionicGesture,$ionicNavBarDelegate) {
				
	}
]);