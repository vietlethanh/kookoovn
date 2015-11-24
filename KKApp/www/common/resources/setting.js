angular.module('KooKoo.Resource.Setting', [
	'KooKoo.Utils',
	'angular-data.DSCacheFactory',
	'KooKoo.Config',
])
.factory('Setting', ['$http','HttpUtil',
	function($http, HttpUtil){
		var r = {
			getSetting: function(key){
				var opts = HttpUtil.opts();
				return $http.get('/setting/'+key, opts);
			},
			sendFeedback: function(feedback){
				var opts = HttpUtil.opts();
				return $http.post('/feedbacks',feedback,opts);
			},
			search: function(keyword,storeid){
				var opts = HttpUtil.opts();
				return $http.get('/circulars/0/items?'+HttpUtil.encodeUrl({keyword:keyword, storeId: storeid}),opts);
			},
			getLastVersion: function(){
				var opts = HttpUtil.opts();
				return $http.get('/app/version', opts);
			}
		}
		return r;
	}
]);