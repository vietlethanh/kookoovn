angular.module('KooKoo.Resource.Ads', [
	'KooKoo.Utils',
	'angular-data.DSCacheFactory',
	'KooKoo.Config',
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