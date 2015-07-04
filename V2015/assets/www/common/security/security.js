// Based loosely around work by Witold Szczerba - https://github.com/witoldsz/angular-http-auth
angular.module('security.service', [
	'ui.router',
	'security.info',
	'security.retryQueue',
	'MCMRelationshop.Config', 
	'MCMRelationshop.Utils'
])

.factory('security', ['$rootScope', '$http', 'HttpUtil', '$q', '$location', '$state', 'securityInfo', 'securityRetryQueue', '$log', 'APP_CONFIG','CacheUtil',
	function($rootScope, $http, HttpUtil, $q, $location, $state, info, queue, $log, appConfig, CacheUtil) {

		// Register a handler for when an item is added to the retry queue
		queue.onItemAddedCallbacks.push(function(retryItem) {
			if (queue.hasMore()) {
				// force to request new API key
				if (!service.requestingApiKey) {
					service.requestApiKey(true);
				}
			}
		});

		// The public API of the service
		var service = {
			_getApiKey: function(){
				return $http.post('/tokens/'+appConfig.APIComsumerKey, {
					Username: appConfig.APIUserName, 
					Password: appConfig.APIPassword
				},HttpUtil.opts())
			},
			// Ask the backend to see if a user is already authenticated - this may be from a previous session.
			requestApiKey: function(force) {
				var self = this;

				if(!force && this.isAuthenticated()){
					return;
				}
				self.requestingApiKey = true;
				var req = this._getApiKey().then(
					function(response){
						self.requestingApiKey = false;
					 	self.updateAuthentication(response.data);
					 	return response;
					}, 
					function(){
						self.requestingApiKey = false;
						return {data:false};
					}	
				);
				return req;
			},

			updateAuthentication: function(apiKey) {
				info.apiKey = apiKey;
				if (service.isAuthenticated() && queue.hasMore()) {
					queue.retryAll();
				}
			},

			clearAuthentication: function() {
				info.apiKey = null;
				queue.cancelAll();
			},

			// Is the current user authenticated?
			isAuthenticated: function() {
				return info.apiKey;
			},
			login: function(uid, pwd){
				var opts, promise
				opts = HttpUtil.opts();
				opts.secure = true;
				promise =  $http.post('/login/'+uid, '"'+pwd+'"',opts);
				promise = promise.then(function(res){
					var result = res.data;
					if(!result.IsSuccess){
						return res;
					}
					this.setCurrentUser(res.data.User);
					$rootScope.$broadcast('userLoggedIn');
					return res;
				}.bind(this));	
				return promise;
			},
			logout: function(){	
				this.setCurrentUser(null);
				this.setCurrentStore(null);	
				$location.path('/');			
			},
			getCurrentUser: function() {
				//return info.currentUser;
				var cache;
				cache = CacheUtil.getOfflineAppCache();
				console.log(cache);
				
				var infoCache = cache.get('/security/info');	
				//itemsData = cache.get(cacheKey);	
				if(infoCache!=null && typeof(infoCache.currentUser) != 'undefined')
					return infoCache.currentUser;
				return null;
			},
			setCurrentUser: function(user) {
				//console.log(user);
				info.currentUser = user;
				var cache = CacheUtil.getOfflineAppCache();
				cache.put('/security/info', info);

			},
			getCurrentUserId: function(){
				var user = this.getCurrentUser();
				return user ? user.Email: 'guest';
			},
			getCurrentStore: function(){
				return info.currentStore;
			},
			setCurrentStore: function(store){
				info.currentStore = store;
				var cache = CacheUtil.getOfflineAppCache();
				cache.put('/security/info', info);
			},
			loadSecurityFromCache: function(){
				var cache;
				cache = CacheUtil.getOfflineAppCache();
				var infoCache = cache.get('/security/info');
				/*
				if(infoCache){
					angular.extend(info, infoCache);
				}
				*/
				return infoCache;
			},
			isGuestMode: function(){
				return this.getCurrentUser() == null;
			},
			getInfo: function(){
				return info;
			}			
		};

		return service;
	}
]);