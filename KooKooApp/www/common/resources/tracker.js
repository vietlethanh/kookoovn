angular.module('MCMRelationshop.Resource.Tracker', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory'
])
.factory('Tracker', ['$q','$http','DSCacheFactory','HttpUtil','CacheUtil','AppUtil','APP_CONFIG',
	function($q, $http, DSCacheFactory, HttpUtil, CacheUtil, AppUtil, APP_CONFIG){
		var r = {				
			addTracker: function(tracker){
				var opts = HttpUtil.opts({
					intercetorParams: {api: false}
					
				});
				return $http.post( APP_CONFIG.KooKooAPI+'/tracker.php',tracker, opts);	
			}		
			
		}
		return r;
	}
]);