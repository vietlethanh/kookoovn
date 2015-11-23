angular.module('MCMRelationshop.Search', [
	'MCMRelationshop.Resource.Setting',
	'MCMRelationshop.StoreLocator',
	'MCMRelationshop.ShoppingList'
])
.controller('SearchCtrl', ['$scope', '$state', '$stateParams', 'security','Setting','ShoppingList', '$ionicLoading','$ionicPopup','APP_CONFIG','CacheUtil','toaster','MCMTracker','$ionicViewService','$location',
	function($scope, $state, $stateParams, security, Setting, ShoppingList, $ionicLoading,$ionicPopup, APP_CONFIG, CacheUtil,toaster,MCMTracker, $ionicViewService, $location) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		var currentUser, currentStore, departmentList,userId;
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------		
		$scope.form = {
			keyword: $stateParams.keyword
		}
		$scope.result = {};
		// private method -------------------------------------------------------------
		//public method -------------------------------------------------------------
		$scope.search = function(form){
			if(form && form.$invalid){
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: 'Please input at least one character.'
				});
				return;
			}
			if(form){
				var currentView = $ionicViewService.getCurrentView();
				currentView.stateParams = {keyword: $scope.form.keyword};
				currentView.url =$location.url();
			}

			$ionicLoading.show();
			return Setting.search($scope.form.keyword, currentStore.CS_StoreID).then(function(res){
				$ionicLoading.hide();
				$scope.restult = res.data;
				//console.log(res.data);

			});
		};
		$scope.viewRecipe = function(recipe){
			CacheUtil.getAppCache().put('recipe/detail/incomming', recipe);
			$state.go('app.recipedetail', {id: recipe.CS_RecipeID});
		}
		$scope.addToShoppingList = function(item){
			$ionicLoading.show();
			item.CategoryName = 'Weekly Ad';
			ShoppingList.getGateway().addItem(item, userId).then(function(data){
				$ionicLoading.hide();
				toaster.pop('success','Success', 'The item is added.')
			});
		};
		// Init -------------------------------------------------------------
		currentStore =security.getCurrentStore();
		currentUser = security.getCurrentUser();
		userId = currentUser? currentUser.Email: 'guest';

		if(!currentStore){
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.search_storelocator');
			return;
		};
		if(!_.isEmpty($scope.form.keyword)){
			$scope.search();
		}
		MCMTracker.trackView('Search');
	}
])
.controller('SearchStoreCtrl', ['$scope','$state', 'APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security','$ionicPopup',
	function($scope, $state, APP_CONFIG, Store,BaseStoreLocatorCtrl, security,$ionicPopup) {  
		var controllerCls = BaseStoreLocatorCtrl.extend({
			onSelectStore: function(store){
				delete store.selectStore;
				security.setCurrentStore(store);
				$state.go('app.search');
			}
		});
		var controller = new controllerCls($scope);
		$ionicPopup.alert({
			title: APP_CONFIG.AlertTitle,
			template: "Please select store."
		});
	}
])