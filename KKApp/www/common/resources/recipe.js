angular.module('MCMRelationshop.Resource.Recipe', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory',
	'MCMRelationshop.Config',
])
.factory('Recipe', ['$http','HttpUtil','security',
	function($http, HttpUtil, security){
		var r = {
			getRecipeCategories: function(){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/RecipeCategories', opts);
			},
			getRecipes: function(criteria){
				var defaultCir = {
					sort: 'Name',
					start: 0,
					max: 20,
					
				};
				angular.extend(defaultCir, criteria);
				var opts = HttpUtil.opts({
					cache: true
				});
				return $http.get('/recipes?'+HttpUtil.encodeUrl(defaultCir), opts);
			},
			getRecipe: function(id){
				var opts = HttpUtil.opts();
				return $http.get('/recipes/'+id, opts);	
			},
			emailRecipe: function(id,to, from, bannerid){
				var opts = HttpUtil.opts();
				return $http.post('/recipes/'+id+'/email?'+HttpUtil.encodeUrl({bannerid: bannerid, sender: from}),  '"'+to+'"', opts);
			}			
		}
		
		return r;
	}
]);