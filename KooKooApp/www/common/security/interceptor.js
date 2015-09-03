
angular.module('security.interceptor', [
	'security.retryQueue', 
	'security.info',
	'angular-data.DSCacheFactory',
	'MCMRelationshop.Utils'
])
.factory('cacheHttpInterceptor', ['$q', '$log', 'securityInfo','APP_CONFIG', 'securityRetryQueue', '$injector','DSCacheFactory','CacheUtil','AppUtil',
	function(q, log, info, appConfig, queue, $injector,DSCacheFactory,CacheUtil,AppUtil) {
		return {
			request: function(config){
				
				if(config.clearCache){
					CacheUtil.clearKey(config.clearCache);
					delete config.clearCache;
				}
				return config;
			}
		}// return
	}
])
.factory('myHttpInterceptor', ['$q', '$log', 'securityInfo','APP_CONFIG', 'securityRetryQueue', '$injector','DSCacheFactory','CacheUtil','AppUtil',
	function(q, log, info, appConfig, queue, $injector,DSCacheFactory,CacheUtil,AppUtil) {		
		return {
			request: function(config) {
				var cache;

				if(config.cache){
					cache = config.cache;
					delete config.cache;
				}
				config = angular.copy(config, {});
				if(cache){
					config.cache = cache;
				}

				// handle Offline
				if(config.offcache && (AppUtil.isOffline() || appConfig.enable_local)){
					config.cache = CacheUtil.getOfflineHttpCache();	
				}
				// end handle Offline
				//Temp
				
					
				if(config.intercetorParams && config.intercetorParams.api){
					config.url = config.secure ? appConfig.SecureHost+config.url : appConfig.Host+config.url;
					delete config.intercetorParams.api;
				}
				// end handle interceptor params

				if(info.apiKey && info.apiKey.AccessToken){
					//config.headers['X-MCMAccessToken'] = info.apiKey.AccessToken;
					config.headers['Content-Type'] = 'application/json';
				}
						
				return config || q.when(config);
			},

			requestError: function(rejection) {
				return q.reject(rejection);
			},

			response: function(response) {
				if(response.config.offcache){
					var offcache = CacheUtil.getOfflineHttpCache();
					try {
						offcache.put(response.config.url, [response.status, response.data,response.headers() , response.statusText]);
					}
					catch(error){		
						if(error.name == 'QUOTA_EXCEEDED_ERR'){
							var currentUserId = info.currentUser ? info.currentUser.Email: 'guest';
							// clear all expect shoppinglist and recipeboxes of current User
							CacheUtil.clearAllExcept([
								'/shoppinglists/user-items?username='+currentUserId,
								'/shoppinglists/user-notes?username='+currentUserId,
								'/shoppinglists/user-notes?username='+currentUserId,
								'/RecipeBoxes/user-recipe?username='+currentUserId
								/*
								'RecipeBoxes/'+currentUserId,
								'shoppinglists/'+currentUserId,
								*/
							], offcache);
							/*
							CacheUtil.clearKeyPattern([
								'^(.(?!shoppinglist))*$',
								'^(.(?!RecipeBoxes))*$',
							], offcache);
							*/
						}
					}
				}
				return response || q.when(response);
			},

			responseError: function(rejection) {
				return;
				if(rejection.status === 401) {
					
					if (rejection.config.url.indexOf(appConfig.Host) > -1) {
						if(info.apiKey && info.apiKey.AccessToken){
							rejection.config.headers['X-MCMAccessToken'] = info.apiKey.AccessToken;	
						}
					}
					promise = queue.pushRetryFn('unauthorized-server', function retryRequest() {
						// We must use $injector to get the $http service to prevent circular dependency
						return $injector.get('$http')(rejection.config);
					});
					
					return promise;
				}
				else{
					if(rejection.config.failRequest){
						rejection.config.failRequest(rejection);
					}
				}
				
				return q.reject(rejection);
			}
		};
	}
])

// We have to add the interceptor to the queue as a string because the interceptor depends upon service instances that are not available in the config block.
.config(['$httpProvider',
	function($httpProvider) {
		$httpProvider.interceptors.push('cacheHttpInterceptor');
		$httpProvider.interceptors.push('myHttpInterceptor');
	}
]);