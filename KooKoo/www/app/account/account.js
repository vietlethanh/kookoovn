angular.module('MCMRelationshop.Account', [
	'MCMRelationshop.Resource.User',
	'MCMRelationshop.Resource.Store',
	'MCMRelationshop.Directive.PasswordMatch',
	'MCMRelationshop.StoreLocator'
])

.controller('AccountCtrl', ['$scope','$state','$q', 'Store', 'User', 'security','$ionicLoading','AppUtil','MCMTracker',
	function($scope, $state,$q, Store, User, security, $ionicLoading, AppUtil,MCMTracker) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.user = angular.copy(security.getCurrentUser());
		$scope.userStore = null;
		//console.log($scope.user);
		// private method -------------------------------------------------------------
		function loadData(){
			var storeReq = Store.getStore($scope.user.StoreID).then(function(res){
				$scope.userStore = res.data;
			});
			var userReq = User.getUser($scope.user.Email, true).then(function(res){
				$scope.user = res.data;
				security.setCurrentUser(res.data);
			});	
			$ionicLoading.show();
			$q.all([storeReq, userReq]).then(function(){
				$ionicLoading.hide();
			})
		}
		//public method -------------------------------------------------------------
		$scope.edit  = function(part){
			$state.go('app.editaccount',{part:part})
		}
		$scope.goInfo = function(part){
			$state.go('app.info')
		}
		$scope.changeStore = function(){
			$state.go('app.changestore');
		}
		// Init -------------------------------------------------------------
		if(!AppUtil.isOnline()){
			return;
		}
		loadData();
		MCMTracker.trackView('Account');
	}
])
.controller('ChangeStoreCtrl', ['$scope','$state', 'APP_CONFIG','Store', 'User', 'BaseStoreLocatorCtrl','security','CacheUtil','$ionicLoading',
	function($scope, $state, APP_CONFIG, Store, User, BaseStoreLocatorCtrl, security, CacheUtil,$ionicLoading) {  
		var controllerCls = BaseStoreLocatorCtrl.extend({
			onSelectStore: function(store){
				delete store.selectStore;
				var currentUser = security.getCurrentUser();
				var user  = angular.copy(currentUser);
				user.StoreID = store.CS_StoreID;
				$ionicLoading.show();
				User.updateUser(user).then(function(res){
					$ionicLoading.hide();
					if(!res.data){
						
						return;
					}
					currentUser.StoreID = user.StoreID;
					security.setCurrentStore(store);
					$state.go('app.account');
				});
			}
		});
		var controller = new controllerCls($scope);
	}
])
.controller('EditAccountCtrl', ['$scope','$state', '$stateParams', 'Store','User', 'AppUtil', 'security','$ionicLoading','$ionicPopup','APP_CONFIG',
	function($scope, $state, $stateParams, Store, User, AppUtil, security, $ionicLoading,$ionicPopup, APP_CONFIG) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.user = angular.copy(security.getCurrentUser());
		$scope.userStore = null;
		$scope.part = $stateParams.part;
		$scope.states = AppUtil.getStateList();
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		$scope.emailRegx = /^[\w.\-]+@[a-zA-Z_.\-]+?\.[a-zA-Z]{2,3}$/;
		$scope.passwordRegx =/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,12}$/;
		$scope.showInvalid = $scope.part != 'password'? true: false;
		if($scope.part == 'password'){
			$scope.user.Password = '';
			$scope.user.RetypePassword = '';
		}
		$scope.redMessage = false;
		// private method -------------------------------------------------------------
		function getCommunicationOpt(){
			User.getCommunicationOpt($scope.user.UserID, 'Text').then(function(res){
				if($scope.user.ReceiveTextMessage == false && res.data != null && res.data.AtStep != null && res.data.AtStep != '')
				{
					$scope.redMessage = true;
				}
			});
		}
		function loadData(){
			Store.getStore($scope.user.StoreID).then(function(res){
				$scope.userStore = res.data;
			})
		}
		$scope.$watch('user.Phone', function(){
			if(!$scope.user.Phone) return;
			$scope.user.Phone = $scope.user.Phone.replace(/\D/gi, '');
			// check min length
			var form = $scope.$$childHead.editForm;
			if(form && form['phone']){
				if( $scope.user.Phone.length != 10){
					form['phone'].$setValidity('format', false);
				}
				else {
					form['phone'].$setValidity('format', true);
				}
			}
		});
		$scope.$watch('user.CellPhone', function(newvalue, oldvalue){
			if(!$scope.user.CellPhone) return;
			$scope.user.CellPhone = $scope.user.CellPhone.replace(/\D/gi, '');
			// check min length
			var form = $scope.$$childHead.editForm;
			if(form && form['cellphone']){
				if( $scope.user.CellPhone.length != 10){
					form['cellphone'].$setValidity('format', false);
				}
				else {
					form['cellphone'].$setValidity('format', true);
				}
			}
			
		});
		//public method -------------------------------------------------------------
		$scope.cancel = function(){
			$state.go('app.account');
		};
		$scope.save  = function(form){
			$scope.showInvalid = true;
			if($scope.part != 'password'){
				$ionicLoading.show();
				User.updateUser($scope.user).then(function(res){
					$ionicLoading.hide();
					if(!res.data){
						return;
					}
					$state.go('app.account');
				});
			}
			else{

				if(form.$invalid){
					return;
				}
				$ionicLoading.show();
				User.updatePassword($scope.user.Email, $scope.user.OldPassword, $scope.user.Password).then(function(res){
					$ionicLoading.hide();
					
					if(!res.data || res.data=='false'){
						$ionicPopup.alert({
							title: APP_CONFIG.AlertTitle,
							template: 'Old Password not match.'
						});
						return;
					}
					$state.go('app.account');
				});
			}
		}
		// Init -------------------------------------------------------------
		getCommunicationOpt();
		loadData();
	}
])
.controller('ForgotPasswordCtrl', ['$scope', '$state','User','security','$ionicPopup','APP_CONFIG',
	function($scope, $state, User, security, $ionicPopup, APP_CONFIG){
		var bannerid = security.getCurrentStore() ? security.getCurrentStore().CS_BannerID: 13; // united
		$scope.form ={
			email: ''
		};
		$scope.send = function(){
			User.forgotPassword($scope.form.email, bannerid).then(function(res){
				var alertPopup;
				if(res.data){
					alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'Password reset link has been sent to your email address'
					});
				}
				else {

				alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'User name does not exist. Please try-again'
					});	
				}
			}, function(res){
				var alertPopup;
				alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: res.data.Message
					});
			})
		}
	}
])
.controller('ForgotUsernameCtrl', ['$scope', '$state','User','security','$ionicPopup','APP_CONFIG',
	function($scope, $state, User, security, $ionicPopup, APP_CONFIG){
		var bannerid = security.getCurrentStore() ? security.getCurrentStore().CS_BannerID: 13; // united
		$scope.form ={
			email: ''
		};
		$scope.send = function(){
			User.forgotUsername($scope.form.email, bannerid).then(function(res){
				var alertPopup;
				if(res.data){
					alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'User Name has been sent to your email address'
					});
				}
				else {

				alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'Email does not exist. Please try-again'
					});	
				}
			}, function(res){
				var alertPopup;
				alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: res.data.Message
					});
			})
		}
	}
])
;
