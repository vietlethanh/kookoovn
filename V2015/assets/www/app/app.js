// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('MCMRelationshop', [
	'ionic',
	'toaster',
	'MCMRelationshop.Push',
	'MCMRelationshop.Config',
	'security',
	'MCMRelationshop.Resource.Store',
	'MCMRelationshop.Resource.User',
	'MCMRelationshop.Intro',
	'MCMRelationshop.Home',
	'MCMRelationshop.Login',
	'MCMRelationshop.Register',
	'MCMRelationshop.Account',
	'MCMRelationshop.WeeklyAd',
	'MCMRelationshop.ShoppingList',
	'MCMRelationshop.Recipe',
	'MCMRelationshop.DigitalCoupon',
	'MCMRelationshop.Analytics',
	'MCMRelationshop.RewardsProgram',
	'MCMRelationshop.StoreLocator', 
	'MCMRelationshop.RecipeBox',
	'MCMRelationshop.Info',
	'MCMRelationshop.Search',
	'MCMRelationshop.SearchCoupons',
	//Angular Utils
	'ui.utils',
	'MCMRelationshop.Filter',
	'ngOpenFB'
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
.run(function($ionicPlatform, $http, DSCacheFactory, push, CacheUtil,MCMAnalytics, MCMTracker, APP_CONFIG,ngFB) {
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
		//push.registerDevice('token test');
		// register event when app online, offline
		MCMTracker.startTrackerWithId(APP_CONFIG.AccountTrackerID);
		
		ngFB.init({appId: APP_CONFIG.SocialAppID.FacebookAppID});
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
				apiKey: ['security','ready',
					function(security,ready) {
						return security.requestApiKey(true);
					}
				],
				currentUser: ['$q', 'security','User','apiKey',
					function($q, security, User, apiKey) {
						var sInfo, defered;
						sInfo = security.loadSecurityFromCache();
						if(sInfo== null || !sInfo.currentUser){
							return null;
						}
						security.setCurrentUser(sInfo.currentUser);
						security.setCurrentStore(sInfo.currentStore);
						//get CurrentUser
						/*var promise = User.getUser(security.getCurrentUser().Email).then(function(res){
							security.setCurrentUser(res.data);
							return res.data;
						}, function(){
							security.setCurrentUser(sInfo.currentUser);
							return sInfo.currentUser;
						});

						return promise;
						*/
					}
				],
				currentStore: ['$q', 'security','apiKey', 'currentUser','Store', 
					function($q,security,apiKey,currentUser, Store){
						var sInfo, defered, storeId;
						sInfo = security.loadSecurityFromCache();
						
						if(sInfo && sInfo.currentStore){
							storeId = sInfo.currentStore.CS_StoreID;
						}
						else if(sInfo && security.getCurrentUser()){
							storeId = security.getCurrentUser().StoreID;
						}
						if(!storeId){
							return null;
						}
						//get CurrentStore
						var promise = Store.getStore(storeId).then(function(res){
							security.setCurrentStore(res.data);
							return res.data;
						}, function(){
							security.setCurrentStore(sInfo.currentStore);
							return sInfo.currentStore;
						});
						return promise;
					}
				],
				analytic: ['currentUser', 'push', 'MCMAnalytics', function(currentUser, push, MCMAnalytics){
					var result = push.registerPush(function (result) {
					  if (result.type === 'registration') {

					  	MCMAnalytics.send({
					  		DeviceToken: result.id,
					  		Notification: true
					  	})
					  }
					  else{
					  	MCMAnalytics.send({
					  		Notification: false
					  	})
					  }
					});				
				}],
				isOutdate:[ '$q', 'Setting','APP_CONFIG','Setting','apiKey',
					function($q, Setting, APP_CONFIG, Setting, apiKey){
						if(APP_CONFIG.IsWeb){
							return false;
						}
						var v = Setting.getLastVersion().then(function(res){
							if(!res.data.Device){
								return false;
							}
							var setting = _.find(res.data.Device, {DeviceName: isAndroid()?'Android': 'IOS'});
							if(!setting){
								return false;
							}
							APP_CONFIG.DowloadAppLink = setting.AppLink;
							return APP_CONFIG.BuildVersion < parseInt(setting.Version);
						});
						return v;
					}
				]

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
			url: "/login?return",
			views: {
				'menuContent': {
					//controller: 'LoginCtrl',
					templateUrl: "app/login/login.html",
				}
			}
		})
		.state('app.register', {
			url: "/register?return&step&back",
			views: {
				'menuContent': {
					controller: 'RegisterCtrl',
					templateUrl: "app/register/register.html",
				}
			}
		})
		.state('app.registercard', {
			url: "/registercard?return",
			views: {
				'menuContent': {
					controller: 'RegisterCardCtrl',
					templateUrl: "app/register/registercard.html",
				}
			}
		})
		.state('app.account', {
			url: "/account",
			views: {
				'menuContent': {
					controller: 'AccountCtrl',
					templateUrl: "app/account/account.html",
				}
			}
		})
		.state('app.editaccount', {
			url: "/editaccount/:part",
			views: {
				'menuContent': {
					controller: 'EditAccountCtrl',
					templateUrl: "app/account/edit-account.html",
				}
			}
		})
		.state('app.changestore', {
			url: "/changestore",
			views: {
				'menuContent': {
					controller: 'ChangeStoreCtrl',
					templateUrl: "app/storelocator/storelocator.html"
				}
			}
		})
		.state('app.info', {
			url: "/info",
			views: {
				'menuContent': {
					controller: 'InfoCtrl',
					templateUrl: "app/info/info.html",
				}
			}
		})
		.state('app.support', {
			url: "/support",
			views: {
				'menuContent': {
					controller: 'SupportCtrl',
					templateUrl: "app/info/support.html",
				}
			}
		})
		.state('app.forgot', {
			url: "/forgot",
			views: {
				'menuContent': {
					controller: 'ForgotPasswordCtrl',
					templateUrl: "app/account/forgot.html",
				}
			}
		})
		.state('app.forgotusername', {
			url: "/forgotusername",
			views: {
				'menuContent': {
					controller: 'ForgotUsernameCtrl',
					templateUrl: "app/account/forgotusername.html",
				}
			}
		})
		.state('app.shoppinglist', {
			url: "/shoppinglist",
			views: {
				'menuContent': {
					controller: 'ShoppingListCtrl',
					templateUrl: "app/shoppinglist/shoppinglist.html",
				}
			}
		})
		.state('app.shoppinglists', {
			url: "/shoppinglists",
			views: {
				'menuContent': {
					controller: 'ShoppingListsCtrl',
					templateUrl: "app/shoppinglist/shoppinglists.html",
				}
			}
		})
		.state('app.shoppinglistview', {
			url: "/publish_shoppinglist?id&uid",
			views: {
				'menuContent': {
					controller: 'PublishShoppingListCtrl',
					templateUrl: "app/shoppinglist/view.html",
				}
			}
		})
		.state('app.createshoppinglist', {
			url: "/createshoppinglist",
			views: {
				'menuContent': {
					controller: 'CreateShoppingListCtrl',
					templateUrl: "app/shoppinglist/create.html",
				}
			}
		})
		.state('app.editshoppinglist', {
			url: "/editshoppinglist?id",
			views: {
				'menuContent': {
					controller: 'EditShoppingListCtrl',
					templateUrl: "app/shoppinglist/edit.html",
				}
			}
		})
		.state('app.weeklyad', {
			url: "/weeklyad?dept",
			views: {
				'menuContent': {
					//controller: 'WeeklyAdCtrl',
					templateUrl: "app/weeklyad/weeklyad.html",
				}
			}
		})
		.state('app.weeklyadflyer', {
			url: "/weeklyadflyer",
			views: {
				'menuContent': {
					//controller: 'WeeklyAdCtrl',
					templateUrl: "app/weeklyad/flyer.html",
				}
			}
		})
		.state('app.weeklyaddepts', {
			url: "/weeklyad/depts",
			views: {
				'menuContent': {
					//controller: 'WeeklyAdCtrl',
					templateUrl: "app/weeklyad/depts.html"
				}
			}
			
		})
		.state('app.recipecats', {
			url: "/recipe/cats",
			views: {
				'menuContent': {
					controller: 'RecipeCatsCtrl',
					templateUrl: "app/recipe/recipecats.html"
				}
			}
			
		})
		.state('app.recipelist', {
			url: "/recipe/list/:catid",
			views: {
				'menuContent': {
					controller: 'RecipeListCtrl',
					templateUrl: "app/recipe/recipelist.html"
				}
			}
		})
		.state('app.recipedetail', {
			url: "/recipe/detail/:id?inbox",
			views: {
				'menuContent': {
					controller: 'RecipeDetailCtrl',
					templateUrl: "app/recipe/recipedetail.html"
				}
			}
			
		})

		.state('app.recipesearch', {
			url: "/recipe/search?keyword",
			views: {
				'menuContent': {
					controller: 'RecipeSearchCtrl',
					templateUrl: "app/recipe/recipesearch.html"
				}
			}
		})
		.state('app.recipebox', {
			url: "/recipebox",
			views: {
				'menuContent': {
					controller: 'RecipeBoxCtrl',
					templateUrl: "app/recipebox/recipebox.html"
				}
			}
			
		})
		.state('app.digitalcoupons', {
			url: "/digitalcoupons?sortBy&catId",
			views: {
				'menuContent': {
					controller: 'DigitalCouponCtrl',
					templateUrl: "app/digitalcoupon/digitalcoupon.html"
				}
			}
		})
		.state('app.rewardsprogram', {
			url: "/rewardsprogram?open",
			views: {
				'menuContent': {
					controller: 'RewardsProgramCtrl',
					templateUrl: "app/rewardsprogram/rewardsprogram.html"
				}
			}
		})
		.state('app.kidclubaddchild', {
			url: "/kidclubaddchild",
			views: {
				'menuContent': {
					controller: 'KidClubAddChildCtrl',
					templateUrl: "app/rewardsprogram/addchild.html"
				}
			}
		})
		.state('app.kidclubeditchild', {
			url: "/kidclubeditchild/:id",
			views: {
				'menuContent': {
					controller: 'KidClubAddChildCtrl',
					templateUrl: "app/rewardsprogram/editchild.html"
				}
			}
		})
		.state('app.storelocator', {
			url: "/storelocator",
			views: {
				'menuContent': {
					controller: 'StoreLocatorCtrl',
					templateUrl: "app/storelocator/storelocator.html"
				}
			}
		})
		.state('app.storeinfo', {
			url: "/storeinfo/:id",
			views: {
				'menuContent': {
					controller: 'StoreInfoCtrl',
					templateUrl: "app/storelocator/info.html"
				}
			}
		})
		.state('app.registerstore', {
			url: "/registerstore",
			views: {
				'menuContent': {
					controller: 'RegisterStoreCtrl',
					templateUrl: "app/storelocator/storelocator.html"
				}
			}
		})
		.state('app.search', {
			url: "/search?keyword",
			views: {
				'menuContent': {
					controller: 'SearchCtrl',
					templateUrl: "app/search/search.html"
				}
			}
		})
		.state('app.search_storelocator',{
			url: "/search_storelocator",
			views: {
				'menuContent': {
					controller: 'SearchStoreCtrl',
					templateUrl: "app/storelocator/storelocator.html"
				}
			}
		})
		.state('app.searchcoupons', {
			url: "/searchcoupons",
			views: {
				'menuContent': {
					controller: 'SearchCouponsCtrl',
					templateUrl: "app/search/searchcoupons.html"
				}
			}
		})
		.state('app.sortcoupons', {
			url: "/sortcoupons",
			views: {
				'menuContent': {
					controller: 'SortCouponsCtrl',
					templateUrl: "app/digitalcoupon/sortcoupons.html"
				}
			}
		})
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
})
.controller('AppCtrl', ['$scope','$state','$stateParams', '$ionicModal', '$timeout', 'security', 'Store','AppUtil','APP_CONFIG','apiKey', 'currentUser','currentStore','CacheUtil','$ionicViewService','$timeout','isOutdate','$ionicPopup','$ionicSideMenuDelegate',
	function($scope,$state, $stateParams, $ionicModal, $timeout, security, Store,AppUtil, APP_CONFIG, apiKey, currentUser, currentStore, CacheUtil, $ionicViewService, $timeout, isOutdate, $ionicPopup, $ionicSideMenuDelegate) {
		// Form data for the login modal
		/*
		$scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){
			console.log(error);
		});
		*/
		var didIntro = CacheUtil.getAppCache().get('didIntro') || CacheUtil.getOfflineAppCache().get('didIntro');
		if(navigator.splashscreen){
			$timeout(function(){
				navigator.splashscreen.hide();
			}, 1000);			
		}
		if(!didIntro && $state.current.name != 'app.shoppinglistview'){
			$state.go('app.intro');
		}
		else{
			CacheUtil.getOfflineAppCache().touch('didIntro');
		}
		
		$scope.loginData = {};
		$scope.currentUser = security.getCurrentUser();
		$scope.isGuestMode = security.isGuestMode();
		$scope.logout = function(){
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			security.logout();
			$scope.isGuestMode=true;
		}
		$scope.openLink = AppUtil.openNewWindow;
		$scope.appcfg = APP_CONFIG;
		$scope.goTo = function(link, params){
			$state.go(link, params);
			 $ionicSideMenuDelegate.toggleLeft();
		}

	
		$scope.$on('userLoggedIn', function(events, args){
			/*
			$state.transitionTo(state.current, null,{
				reload: true,
				inderit: false,
				notify: true
			});
			*/
			//console.log(args);
			$scope.socialWeb = args;
			$scope.isGuestMode = security.isGuestMode();

		});
		if(isOutdate){
			$ionicPopup.alert({
				title: 'Your app is out date',
				scope: $scope,
				template: "Please go to <a style=\"text-decoration: underline\" ng-click=\"openLink(appcfg.DowloadAppLink)\">here</a> for download lastest app."
			})
		};
		
		/*
		// Create the login modal that we will use later
		$ionicModal.fromTemplateUrl('app/login/login.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal = modal;
		});
		
		// Triggered in the login modal to close it
		$scope.closeLogin = function() {
			$scope.modal.hide();
		};
		// Open the login modal
		$scope.login = function() {
			$scope.modal.show();
		};
		
		// Perform the login action when the user submits the login form
		$scope.doLogin = function() {
			console.log('Doing login', $scope.loginData);

			// Simulate a login delay. Remove this and replace with your login
			// code if using a login system
			$timeout(function() {
				$scope.closeLogin();
			}, 1000);
		};
		*/
		
		
	}
]);