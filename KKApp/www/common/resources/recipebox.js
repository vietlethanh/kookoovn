angular.module('MCMRelationshop.Resource.RecipeBox', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory',
	'security'
])
.factory('UserRecipeBox', ['$http', 'HttpUtil', 'CacheUtil',
	function($http, HttpUtil, CacheUtil){
		var r  = {
			getRecipeBox: function(userid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/RecipeBoxes/user-recipes?username='+userid+'&max=400', opts)
			},
			addRecipe: function(recipe, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/RecipeBoxes/user-recipes?username='+userid+'&max=400']
				})				
				return $http.post('/RecipeBoxes/add-recipebox?username='+userid,recipe.CS_RecipeID, opts);
			},
			removeRecipe: function(id, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/RecipeBoxes/user-recipes?username='+userid+'&max=400']
				});

				return $http.delete('/RecipeBoxes/remove-recipes?username='+userid+'&recipeIds='+id, opts)	
			}
		}
		return r;
	}
])
.factory('GuestRecipeBox', ['$q', 'HttpUtil', 'CacheUtil',
	function($q, HttpUtil, CacheUtil){
		var r = {
			cache: CacheUtil.getGuestCache(),
			userid: 'guest',
			_getRecipeBox: function(){
				return this.cache.get('/RecipeBoxes/'+this.userid+'/recipes') || [];
			},
			getRecipeBox: function(userid){
				var deferred = $q.defer();
				var items = this._getRecipeBox();
				deferred.resolve({data:{Recipes:items}});
				return deferred.promise;
			},
			addRecipe: function(recipe, userid){
				var deferred, recipeBox;
				recipeBox = this._getRecipeBox(); 
				deferred = $q.defer();
				var exist = _.find(recipeBox, {CS_RecipeID: recipe.CS_RecipeID});
				if(exist){
					deferred.resolve({data: false})
				}
				else{
					recipeBox.push(recipe);
					this.cache.put('/RecipeBoxes/'+this.userid+'/recipes', recipeBox);
					deferred.resolve({data: true});
				}
				return deferred.promise;
			},
			removeRecipe: function(id){
				var deferred, recipeBox, recipe;
				deferred = $q.defer();
				recipeBox = this._getRecipeBox();
				recipe = _.remove(recipeBox, {CS_RecipeID: id});
				this.cache.put('/RecipeBoxes/'+this.userid+'/recipes', recipeBox);
				deferred.resolve({data: true});
				return deferred.promise;
			}
		}
		return r;
	}
])
.factory('RecipeBox', ['security','AppUtil','UserRecipeBox','GuestRecipeBox', 
	function(security, AppUtil, UserRecipeBox,GuestRecipeBox){
		var s  = {
			getGateway: function(){
				// guest
				if(security.isGuestMode()){
					return GuestRecipeBox;
				}
				return UserRecipeBox;
			}
		} 
		return s;
	}
]);