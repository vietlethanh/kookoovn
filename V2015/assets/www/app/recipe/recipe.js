angular.module('MCMRelationshop.Recipe', [
	'MCMRelationshop.Resource.Recipe',
	'MCMRelationshop.Resource.RecipeBox',
	'MCMRelationshop.Utils'
])
.controller('RecipeCatsCtrl', ['$scope','$state', 'security', 'Recipe','CacheUtil', '$ionicLoading','MCMTracker',
function($scope, $state ,security, Recipe, CacheUtil, $ionicLoading,MCMTracker){
	// private properties -------------------------------------------------------------
	var vm = this;
	// public properties -------------------------------------------------------------
	// scope properties -------------------------------------------------------------
	$scope.recipeCats = []
	// private method -------------------------------------------------------------
	function loadData(){
		$ionicLoading.show();
		return Recipe.getRecipeCategories().then(function(res){
			$scope.recipeCats = res.data;
			$ionicLoading.hide();
		});
	};
	//public method -------------------------------------------------------------
	$scope.goToRecipeList = function (cat){
		CacheUtil.getAppCache().put('/recipe/cat/incomming', cat);
		$state.go('app.recipelist',{catid: cat.CS_CategoryId});
	};
	$scope.search = function(){
		$state.go('app.recipesearch');
	}
	// Init -------------------------------------------------------------
	loadData();
	MCMTracker.trackView('RecipeCats')
}])
.controller('RecipeListCtrl',['$scope', '$state', '$stateParams', 'Recipe','RecipeBox', 'CacheUtil','$ionicLoading','security','toaster','MCMTracker','AppUtil','APP_CONFIG',
function($scope, $state, $stateParams, Recipe, RecipeBox, CacheUtil, $ionicLoading, security,toaster,MCMTracker,AppUtil,APP_CONFIG){
	// private properties -------------------------------------------------------------
	var catParam = $stateParams.catid;
	var userId = security.getCurrentUserId(); 
	// public properties -------------------------------------------------------------
	// scope properties -------------------------------------------------------------
	$scope.pageInfo = {
		start: 0, /* page*/ 
		max: 20, /* pagesize */
		totalResult: 0,
		catids: catParam,
		sort: 'Name'

	};
	$scope.cat = {};
	$scope.recipes = [];
	$scope.hasMore = false;
	// private method -------------------------------------------------------------
	function loadRecipes(isLoadMore){
		if(!isLoadMore){
			$ionicLoading.show();
			$scope.recipes = [];
		}
		return Recipe.getRecipes($scope.pageInfo).then(function(res){
			var reps = res.data.Recipes;
			$scope.pageInfo.totalResult = res.data.TotalResult;
			_.forEach(reps, function(recipe){
				if(AppUtil.isBlankImgUrl(recipe.ImageUrl)){
					recipe.ImageUrl = APP_CONFIG.RecipeImageDefault;
				}
			});
			//$scope.recipes = [];
			Array.prototype.push.apply($scope.recipes, reps);
			if(isLoadMore){
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}
			if(!isLoadMore){
				$ionicLoading.hide();
			}
		})
	};
	function loadCat(){
		var c = CacheUtil.getAppCache().get('/recipe/cat/incomming');
		if(!c){
			//todo: handle sau
			c = {
				CategoryName: 'Appetizer'
			}
		}
		$scope.cat = c;
		//console.log(c);
	}
	//public method -------------------------------------------------------------
	$scope.loadMore  = function(){
		++$scope.pageInfo.start;
		loadRecipes(true);
	};
	$scope.viewDetail = function(recipe){
		CacheUtil.getAppCache().put('recipe/detail/incomming', recipe);
		$state.go('app.recipedetail', {id: recipe.CS_RecipeID});
	};
	$scope.sort = function(sortBy){
		$scope.pageInfo.sort = sortBy;
		$scope.pageInfo.start = 0;
		loadRecipes();
	}
	$scope.addToRecipeBox = function(recipe, $event){
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
		//$ionicLoading.show();
		recipe.isLoading = true;
		var r  = angular.copy(recipe);
		delete r.isLoading;
		RecipeBox.getGateway().addRecipe(r,userId).then(function(res){
			//$ionicLoading.hide();
			recipe.isLoading = false;
			toaster.pop('success','Success', 'The item is added.')
		})
	}
	// Init -------------------------------------------------------------
	loadRecipes();
	loadCat();
	$scope.$watch('pageInfo', function(pi){
		$scope.hasMore = pi.start * pi.max < pi.totalResult; 
	}, true);
	MCMTracker.trackView('RecipeList')
}
])
.controller('RecipeSearchCtrl',['$scope', '$state', '$stateParams', '$location', 'Recipe','RecipeBox', 'CacheUtil','$ionicLoading','security','toaster','AppUtil','APP_CONFIG','$ionicViewService',
function($scope, $state, $stateParams, $location, Recipe, RecipeBox, CacheUtil, $ionicLoading, security,toaster,AppUtil,APP_CONFIG,$ionicViewService){
	// private properties -------------------------------------------------------------
	var catParam = $stateParams.catid;
	var userId = security.getCurrentUserId(); 
	//var sp = $location.search();
	// public properties -------------------------------------------------------------
	// scope properties -------------------------------------------------------------
	$scope.pageInfo = {
		keyword: $stateParams.keyword || '',
		start: 0, /* page*/ 
		max: 20, /* pagesize */
		totalResult: 0
	};
	$scope.cat = {};
	$scope.recipes = null;
	$scope.hasMore = false;
	
	// private method -------------------------------------------------------------
	function loadRecipes(isLoadMore){
		if(!isLoadMore){
			$ionicLoading.show();
			$scope.recipes = null;
		}
		return Recipe.getRecipes($scope.pageInfo).then(function(res){
			var reps = res.data.Recipes;
			$scope.pageInfo.totalResult = res.data.TotalResult;
			_.forEach(reps, function(recipe){
				if(AppUtil.isBlankImgUrl(recipe.ImageUrl)){
					recipe.ImageUrl = APP_CONFIG.RecipeImageDefault;
				}
			});
			$scope.recipes = $scope.recipes || [];
			Array.prototype.push.apply($scope.recipes, reps);
			if(isLoadMore){
				$scope.$broadcast('scroll.infiniteScrollComplete');
			}
			if(!isLoadMore){
				$ionicLoading.hide();
			}
		})
	};
	function loadCat(){
		var c = CacheUtil.getAppCache().get('/recipe/cat/incomming');
		if(!c){
			//todo: handle sau
			c = {
				CategoryName: 'Appetizer'
			}
		}
		$scope.cat = c;
		//console.log(c);
	}
	//public method -------------------------------------------------------------
	$scope.loadMore  = function(){
		++$scope.pageInfo.start;
		loadRecipes(true);
	};
	$scope.viewDetail = function(recipe){
		CacheUtil.getAppCache().put('recipe/detail/incomming', recipe);
		$state.go('app.recipedetail', {id: recipe.CS_RecipeID});
	};
	$scope.addToRecipeBox = function(recipe, $event){
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
		//$ionicLoading.show();
		recipe.isLoading = true;
		var r  = angular.copy(recipe);
		delete r.isLoading;
		RecipeBox.getGateway().addRecipe(r,userId).then(function(res){
			//$ionicLoading.hide();
			recipe.isLoading = false;
			toaster.pop('success','Success', 'The item is added.')
		})
	}
	$scope.search = function(){
		$scope.recipes = [];
		var currentView = $ionicViewService.getCurrentView();
		//$location.search({keyword: $scope.pageInfo.keyword});
		//$location.replace();
		currentView.stateParams = {keyword: $scope.pageInfo.keyword};
		currentView.url =$location.url();
		loadRecipes();
	}
	// Init -------------------------------------------------------------
	if(!_.isEmpty($scope.pageInfo.keyword)){
		loadRecipes();
	}
	//loadRecipes();
	//loadCat();
	$scope.$watch('pageInfo', function(pi){
		$scope.hasMore = pi.start * pi.max < pi.totalResult; 
	}, true);
}
])
.controller('RecipeDetailCtrl', ['$scope', '$stateParams','$q', 'Recipe','RecipeBox', 'CacheUtil','ShoppingList','security','$ionicLoading','$ionicPopup','APP_CONFIG','toaster','MCMTracker','AppUtil',
function($scope, $stateParams, $q, Recipe, RecipeBox, CacheUtil, ShoppingList, security,$ionicLoading,$ionicPopup, APP_CONFIG, toaster,MCMTracker,AppUtil){
	var vm = this;
	// private properties -------------------------------------------------------------
	var recipeId = $stateParams.id,
		inbox = $stateParams.inbox,
		userId = security.getCurrentUserId(),
		currentUser = security.getCurrentUser();
	// public properties -------------------------------------------------------------
	$scope.recipe = {};
	$scope.activateTab = 'preparation';
	$scope.emailPopup =  {
		email: currentUser ? currentUser.UserEmail: ''
	};
	$scope.inbox = inbox;
	// scope properties -------------------------------------------------------------
	// private method -------------------------------------------------------------
	function loadRecipe(){
		//check in cache
		
		var rep = CacheUtil.getAppCache().get('recipe/detail/incomming');

		var success = function(recipe){	
			if(AppUtil.isBlankImgUrl(recipe.ImageUrl)){
				recipe.ImageUrl = APP_CONFIG.RecipeImageDefault;
			}
			recipe.OgriImageUrl = recipe.ImageUrl.replace('&isthumb=1&size=144', '');		
			$scope.recipe = recipe;
		};
		if(rep && rep.CS_RecipeID == recipeId){
			var deferred = $q.defer();
			deferred.resolve(true);
			success(rep);
			return deferred.promise;
		}
		else {
			return Recipe.getRecipe(recipeId).then(function(res){			
				success(res.data);
				//console.log(res.data);
				return res;
			});
		}
	}
	function emailRecipe(email){
		$ionicLoading.show();
		var bannerid = security.getCurrentStore().CS_BannerID;
		var req = Recipe.emailRecipe(recipeId, email, userId, bannerid).then(function(res){
			$ionicLoading.hide();
			if(res.data){
				var alertPopup = $ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: 'The recipe has been sent to the email address.'
				});
			}

		});
		return req;
	}
	function loadData(){
		var shopReq = ShoppingList.getGateway().getShoppingList(userId);
		var recipeReq = loadRecipe();
		$ionicLoading.show();
		return $q.all([shopReq, recipeReq]).then(function(res_array){
			$ionicLoading.hide();
			var items = res_array[0].data,
				recipe = $scope.recipe,
				ingredients = recipe.IngredientCategories[0].Ingredients;
			
			var recipeShopIngres = _.filter(items, {CategoryName: "Ingredients", ReferenceID:recipe.CS_RecipeID});
			_.forEach(ingredients,function(ing){
				var inlist = _.find(recipeShopIngres, {ProductName: ing.ItemName});
				if(inlist){
					ing.IsAdded = true;
				}
			});
		})
	}
	//public method -------------------------------------------------------------
	$scope.switchTab = function(tab){
		$scope.activateTab = tab;
	}
	$scope.addToList = function(ingredient){
		ingredient.isLoading = true;
		ShoppingList.getGateway().addIngredients(recipeId,[ingredient], userId).then(function(){
			ingredient.IsAdded = true;
			ingredient.isLoading = false;
		});

	};
	$scope.addAllToList = function(ingredients){
		_.forEach(ingredients, function(ingredient){
			ingredient.isLoading = true;
		});
		ShoppingList.getGateway().addIngredients(recipeId,ingredients, userId).then(function(){
			_.forEach(ingredients, function(ingredient){
				ingredient.IsAdded = true;
				ingredient.isLoading = false;
			});
		});
	};
	$scope.addToRecipeBox = function(recipe){
		/*
		$ionicLoading.show();
		RecipeBox.getGateway().addRecipe(recipe,userId).then(function(res){
			$ionicLoading.hide();
		})
		*/
		recipe.isLoading = true;
		var r  = angular.copy(recipe);
		delete r.isLoading;
		RecipeBox.getGateway().addRecipe(r,userId).then(function(res){
			//$ionicLoading.hide();
			recipe.isLoading = false;
			toaster.pop('success','Success', 'The item is added.')
		})

	};
	$scope.email= function(){
		if(security.isGuestMode()){
			var alertPopup = $ionicPopup.alert({
				title: APP_CONFIG.AlertTitle,
				template: 'Please login to send recipe to email'
			});

			return;
		}
		var emailPopup = $ionicPopup.show({
			template: '<input type="email" ng-model="emailPopup.email">',
			title: APP_CONFIG.AlertTitle,
			scope: $scope,
			buttons: [
			  { text: 'Cancel' },
			  {
				text: '<b>Send</b>',
				type: 'button-positive',
				onTap: function(e) {
				  if (!$scope.emailPopup.email) {
					//don't allow the user to close unless he enters wifi password
					e.preventDefault();
				  } else {
					return $scope.emailPopup.email;
				  }
				}
			  }
			]
			});
		emailPopup.then(function(email){
			if(!email){
				return;
			}
			emailRecipe(email);
		});
	};

	// Init -------------------------------------------------------------
	loadData();
	MCMTracker.trackView('RecipeDetail');
}
]);