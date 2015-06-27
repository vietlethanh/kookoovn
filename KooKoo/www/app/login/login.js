angular.module('MCMRelationshop.Login', [
	'security',
	'MCMRelationshop.Resource.ShoppingList'
])
.controller('LoginCtrl', ['$rootScope','$scope', '$state', '$stateParams', 'security','$ionicLoading','$ionicPopup','MCMTracker','APP_CONFIG','$q','GuestShoppingList','UserShoppingList','$ionicViewService',
	function($rootScope, $scope, $state, $stateParams, security, $ionicLoading,$ionicPopup,MCMTracker,APP_CONFIG, $q, GuestShoppingList, UserShoppingList, $ionicViewService) { 

		var vm = this;
		vm.showInvalid = 0;
		vm.userName = '';
		vm.password = '' ;
		var back = $stateParams.return;
		function handleCurrentStore(user){
			var deferred = $q.defer();
			var currentStore = security.getCurrentStore(),
				userStoreId = security.getCurrentUser().StoreID;
				if((currentStore && currentStore.CS_StoreID ==  userStoreId) || !currentStore){
					if(!currentStore){
						security.setCurrentStore({CS_StoreID: userStoreId});
					}
					deferred.resolve(true);
					return deferred.promise;
				}
				// case guest store != user store
				$ionicPopup.show({
					title: APP_CONFIG.AlertTitle,
					template: 'Your current selected store is different from your preferred store, please indicate which you want to view?',
					buttons: [
						{
							//text: user.StoreName,
							text: 'Preferred Store',
    						type: 'button-positive',
    						onTap: function(){
    							security.setCurrentStore({CS_StoreID: userStoreId});
    							deferred.resolve(true);
    						}
						},
						{
							//text: currentStore.StoreName + ' ' +currentStore.StoreID,
							text: 'Selected Store',
							type: 'button-positive',
							onTap: function(){
								deferred.resolve(true);
							}
						}
					]
				});
			return deferred.promise;

		}
		function mergeShoppingList(userid){
			var data = GuestShoppingList.prepareData(userid);
			if(!data && data.length ==0){
				return;
			}
			$ionicLoading.show();
			return UserShoppingList.merge(data, userid).then(function(res){
				$ionicLoading.hide();
				return res;
			});
		}

		vm.login = function(form){
			if(form.$invalid){
				vm.showInvalid = true;
				return;
			}
			$ionicLoading.show();
			security.login(vm.userName, vm.password).then(function(res){
				$ionicLoading.hide();
				if(!res.data.IsSuccess){
					var msg = {
						Invalid_UserNamePassword: 'Invalid User Name or Password',
				        User_Not_Active: 'User not active',
				        User_LockedOut: 'User locked out'
					};
					$ionicPopup.alert({
						title: 'Login Fail',
						template: msg[res.data.FailCode]
					});
					return;
				}
				$rootScope.$broadcast('userLoggedIn');
				mergeShoppingList(res.data.UserName);
				$q.all([handleCurrentStore(res.data.User)]).then(function(){
					$ionicLoading.hide();
					GuestShoppingList.clear();					
					$ionicViewService.nextViewOptions({
						disableBack: true
					});
					if(back){
						$state.transitionTo(back, null,{
							reload: true,
							inderit: false,
							notify: true
						});
					}
					else {
						$state.transitionTo('app.home', null,{
							reload: true,
							inderit: false,
							notify: true
						});
					}
				});
				// success
				
			}, function(res){
				$ionicLoading.hide();
				//console.log(res);
			})
			
		}
		vm.register = function(){
			$state.go('app.register', {step: 1});
		}
		vm.goForgot = function(){
			$state.go('app.forgot');
		}
		MCMTracker.trackView('Login');
	}
])