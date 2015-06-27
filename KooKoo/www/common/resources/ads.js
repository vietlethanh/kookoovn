angular.module('MCMRelationshop.Resource.Ads', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory',
	'MCMRelationshop.Config',
])
.factory('Ads', ['$http','HttpUtil',
	function($http, HttpUtil){
		var r = {
			getHomeAds: function(){
				var opts = HttpUtil.opts({
					cache: true
				});
				return $http.get('/dynamic/gethome', opts);
			},
		}
		return r;
	}
]);