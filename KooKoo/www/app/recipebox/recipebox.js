angular.module('MCMRelationshop.RecipeBox', [
	'MCMRelationshop.Resource.RecipeBox',
	'MCMRelationshop.Utils'
])
.controller('RecipeBoxCtrl',['$scope', '$state', '$stateParams', 'security', 'RecipeBox', 'CacheUtil','$ionicLoading','MCMTracker','AppUtil','APP_CONFIG',
function($scope, $state, $stateParams, security, RecipeBox, CacheUtil, $ionicLoading,MCMTracker,AppUtil,APP_CONFIG){
	// private properties -------------------------------------------------------------
	var userId = security.getCurrentUserId();
	// public properties -------------------------------------------------------------
	// scope properties -------------------------------------------------------------
	$scope.recipes = [];
	// private method -------------------------------------------------------------
	function loadRecipes(){
		$ionicLoading.show();
		
		return RecipeBox.getGateway().getRecipeBox(userId).then(function(res){
				_.forEach(res.data.Recipes, function(recipe){
					if(AppUtil.isBlankImgUrl(recipe.ImageUrl)){
						recipe.ImageUrl = APP_CONFIG.RecipeImageDefault;
					}
				});
				$scope.recipes = res.data.Recipes;

				$ionicLoading.hide();
		})
	};
	
	//public method -------------------------------------------------------------
	$scope.viewDetail = function(recipe){
		CacheUtil.getAppCache().put('recipe/detail/incomming', recipe);
		$state.go('app.recipedetail', {id: recipe.CS_RecipeID, inbox: 'true'});
	};
	$scope.remove = function(recipe, $event){
		if ($event.stopPropagation) $event.stopPropagation();
		if ($event.preventDefault) $event.preventDefault();
		$event.cancelBubble = true;
		$event.returnValue = false;
		// remove
		recipe.isLoading = true;
		RecipeBox.getGateway().removeRecipe(recipe.CS_RecipeID, userId).then(function(){
			recipe.isLoading = false;
			_.remove($scope.recipes, function(re){
				return re.CS_RecipeID == recipe.CS_RecipeID;
			});
			// update store locator
			RecipeBox.getGateway().getRecipeBox(userId);
		});
	}
	// Init -------------------------------------------------------------
	loadRecipes();
	MCMTracker.trackView('RecipeBox');
}
]);