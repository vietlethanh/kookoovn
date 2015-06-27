angular.module('MCMRelationshop.Utils', [
	'MCMRelationshop.Config', 
	'angular-data.DSCacheFactory'
])
.factory('HttpUtil',['$ionicLoading',function($ionicLoading){
	var util = {
		getAPIParams: function(){
			return {intercetorParams:{api: true}};
		},
		opts: function(opts){
			var defaultOpts = {
				intercetorParams: {api: true},
				//offcache: true,
				cache: false,
				failRequest: this.defaultFail,
				timeout: 50000
			}
			if(!opts){
				return defaultOpts;
			}
			opts.cache = opts.cache === true;
			return angular.extend(defaultOpts,opts);
		},
		encodeUriQuery: function(val, pctEncodeSpaces) {
		  return encodeURIComponent(val).
					replace(/%40/gi, '@').
					replace(/%3A/gi, ':').
					replace(/%24/g, '$').
					replace(/%2C/gi, ',').
					replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
		},
		encodeUrl: function(obj){
			var forEach = angular.forEach,
				parts = [],
				self = this;
			forEach(obj, function(value, key) {
				if (angular.isArray(value)) {
					forEach(value, function(arrayValue) {
						parts.push(self.encodeUriQuery(key, true) +
							(arrayValue === true ? '' : '=' + self.encodeUriQuery(arrayValue, true)));
				  });
				} else {
				parts.push(self.encodeUriQuery(key, true) +
						   (value === true ? '' : '=' + self.encodeUriQuery(value, true)));
				}
			});
			return parts.length ? parts.join('&') : '';
		},
		defaultFail: function(rejection){
			$ionicLoading.hide();
		}
	}
	return util;
}])
.factory('AppUtil',['$q', 'APP_CONFIG' , function($q,APP_CONFIG){
	var statelist = [
		{text: 'Alabama', value: 'AL'},
		{text: 'Alaska', value: 'AK'},
		{text: 'Arizona', value: 'AZ'},
		{text: 'Arkansas', value: 'AR'},
		{text: 'California', value: 'CA'},
		{text: 'Colorado', value: 'CO'},
		{text: 'Connecticut', value: 'CT'},
		{text: 'Delaware', value: 'DE'},
		{text: 'District Of Columbia', value: 'DC'},
		{text: 'Florida', value: 'FL'},
		{text: 'Georgia', value: 'GA'},
		{text: 'Hawaii', value: 'HI'},
		{text: 'Idaho', value: 'ID'},
		{text: 'Illinois', value: 'IL'},
		{text: 'Indiana', value: 'IN'},
		{text: 'Iowa', value: 'IA'},
		{text: 'Kansas', value: 'KS'},
		{text: 'Kentucky', value: 'KY'},
		{text: 'Louisiana', value: 'LA'},
		{text: 'Maine', value: 'ME'},
		{text: 'Maryland', value: 'MD'},
		{text: 'Massachusetts', value: 'MA'},
		{text: 'Michigan', value: 'MI'},
		{text: 'Minnesota', value: 'MN'},
		{text: 'Mississippi', value: 'MS'},
		{text: 'Missouri', value: 'MO'},
		{text: 'Montana', value: 'MT'},
		{text: 'Nebraska', value: 'NE'},
		{text: 'Nevada', value: 'NV'},
		{text: 'New Hampshire', value: 'NH'},
		{text: 'New Jersey', value: 'NJ'},
		{text: 'New Mexico', value: 'NM'},
		{text: 'New York', value: 'NY'},
		{text: 'North Carolina', value: 'NC'},
		{text: 'North Dakota', value: 'ND'},
		{text: 'Ohio', value: 'OH'},
		{text: 'Oklahoma', value: 'OK'},
		{text: 'Oregon', value: 'OR'},
		{text: 'Pennsylvania', value: 'PA'},
		{text: 'Rhode Island', value: 'RI'},
		{text: 'South Carolina', value: 'SC'},
		{text: 'South Dakota', value: 'SD'},
		{text: 'Tennessee', value: 'TN'},
		{text: 'Texas', value: 'TX'},
		{text: 'Utah', value: 'UT'},
		{text: 'Vermont', value: 'VT'},
		{text: 'Virginia', value: 'VA'},
		{text: 'Washington', value: 'WA'},
		{text: 'West Virginia', value: 'WV'},
		{text: 'Wisconsin', value: 'WI'},
		{text: 'Wyoming', value: 'WY'}
	];
	var util = {
		isOnline: function(){
			if(APP_CONFIG.IsWeb){
				return function(){
					return navigator.onLine;
				}
			}
			else{
				return function(){
					//return navigator.connection && navigator.connection.type != Connection.NONE;
					return navigator.connection && navigator.connection.type != 'none';
				}
			}
		}(),
		isOffline: function(){
			return !this.isOnline();
		},
		generateID: function() {
			var length = 8,

				timestamp = +new Date;
			 
			var _getRandomInt = function( min, max ) {
				return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
			}
			var ts = timestamp.toString();
			var parts = ts.split( "" ).reverse();
				 var id = "";
				 
				 for( var i = 0; i < length; ++i ) {
					var index = _getRandomInt( 0, parts.length - 1 );
					id += parts[index];	 
				 } 
			return id;
			 
			
			/*
			var d = new Date();
			return d.getTime();
			*/

		},
		getCurrentPosition: function(){
			if(APP_CONFIG.IsWeb){
				return function(){
					var deferred = $q.defer();
					var onSuccess = function(position){
						deferred.resolve({data: {latitude: position.coords.latitude, longitude: position.coords.longitude}});
					};
					var onFail = function(error){
						deferred.reject();
					};  				
					navigator.geolocation.getCurrentPosition(onSuccess, onFail, { timeout: 10000 });
					return deferred.promise;
				}
			}
			// app
			else {
				return function(){
					var deferred = $q.defer();
					var onSuccess = function(position){
						deferred.resolve({data: {latitude: position.coords.latitude, longitude: position.coords.longitude}});
					};
					var onFail = function(error){
						deferred.reject();
					};				
					navigator.geolocation.getCurrentPosition(onSuccess, onFail, { timeout: 10000 });
					return deferred.promise;
				}
			}
		}(),
		getStateList: function(){
			return statelist;
		},
		convertLink: function(s){
			var hrefReg = /href="http:\/\/.*?"/,
				linkReg = /"http:\/\/.*?"/;
			var matches = hrefReg.exec(s);
			_.forEach(matches, function(match){
				var a = linkReg.exec(match);
				 s = s.replace(match, 'ng-click=openLink('+a+')');
			});
			return s ;
		},
		openNewWindow: function(){
			if(APP_CONFIG.IsWeb){
				return function(url){
					var link = document.createElement('a');
					link.setAttribute('href', url);
					link.setAttribute('target','_blank');
					var clickevent = document.createEvent('Event');
					clickevent.initEvent('click', true, false);
					link.dispatchEvent(clickevent);
					return false;
				}
			}
			else {
				return function(url){
					window.open(url, '_system');
				}
			}
		}(),
		isBlankImgUrl: function(imgUrl){
			return !imgUrl || imgUrl == APP_CONFIG.BlankImge;	
		},
		mapLink: function(){
			if(isAndroid()){
				return function(lat, long){
					return 'geo:'+lat+','+long+'?z=8&q='+lat+','+long;
				}
			}
			else {
				return function(lat, long){
					//var protocol = APP_CONFIG.IsWeb? 'http://maps.apple.com/': 'maps://maps.apple.com/';
					return 'http://maps.apple.com/?q='+lat+','+long+'&ll='+lat+','+long;
				}
				
			}
		}()
	}
	return util;
}])
.factory('CacheUtil',['APP_CONFIG', 'DSCacheFactory' , function(APP_CONFIG, DSCacheFactory){
	var util = {
		getHttpCache: function(){
			var cache = DSCacheFactory.get('http');
			if(!cache){
				cache = DSCacheFactory('http', {
					maxAge: 900000, // Items added to this cache expire after 15 minutes.
					cacheFlushInterval: 600000, // This cache will clear itself every hour.
					deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
					//storageMode: 'localStorage'
				});
			}
			return cache;
		},
		getOfflineHttpCache: function(){
			var cache = DSCacheFactory.get('off_http');
			if(!cache){
				cache = DSCacheFactory('off_http', {
					maxAge: 1000*60*60*24*7, // Items added to this cache expire after 1 weeks.
					storageMode: 'localStorage',
					capacity: 200,
					deleteOnExpire: 'aggressive'
				});
			}
			return cache;
		},
		getAppCache: function(){
			var cache = DSCacheFactory.get('app');
			if(!cache){
				cache = DSCacheFactory('app', {
					capacity: 200,
					cacheFlushInterval: 600000, // This cache will clear itself every hour.
					deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
					//storageMode: 'localStorage'
				});
			}
			return cache;
		},
		getOfflineAppCache: function(){
			var cache = DSCacheFactory.get('off_app');
			if(!cache){
				cache = DSCacheFactory('off_app', {
					maxAge: 1000*60*60*24*7, // Items added to this cache expire after 1 weeks.
					storageMode: 'localStorage',
					capacity: 200,
					deleteOnExpire: 'aggressive'
				});
			}
			return cache;

		},
		getGuestCache: function(){
			var cache = DSCacheFactory.get('guest');
			if(!cache){
				cache = DSCacheFactory('guest', {
					maxAge: 1000*60*60*24*7, // Items added to this cache expire after 1 weeks.
					storageMode: 'localStorage',
					capacity: 200,
					deleteOnExpire: 'aggressive'
				});
			}
			return cache;
		},
		getAllCaches: function(){
			var caches = [
				this.getHttpCache(), 
				this.getOfflineHttpCache(), 
				this.getAppCache(),
				this.getOfflineAppCache(),
				this.getGuestCache()
			];
				
			return caches;
		},
		clearKey:  function(keys){
			var caches = this.getAllCaches();
			_.forEach(caches, function(cache){
				_.forEach(keys, function(key){
					cache.remove(key);
					cache.remove(APP_CONFIG.Host+key);
				});
			});
		},
		clearKeyPattern: function(keyPatterns, cache){
			var cacheKeys = cache.keys(),
				delKeys = [],
				regex;	
			_.forEach(keyPatterns, function(keyPattern){
				regex = new RegExp(keyPattern);
				var tmpDelKeys = _.filter(cacheKeys, function(ckey){
					return regex.test(ckey);
				});
				delKeys = delKeys.concat(tmpDelKeys);
			});
			_.forEach(delKeys, function(delKey){
				cache.remove(delKey);
			});
		},
		clearAllExcept:function(keyPatterns, cache){
			var cacheKeys = cache.keys(),
				delKeys = [];
			
			delKeys = _.filter(cacheKeys, function(ckey){
				var match = false;
				_.forEach(keyPatterns, function(keyPattern){
					match = ckey.indexOf(keyPattern)>=0 ||  match;
				});
				return !match;
			});
			_.forEach(delKeys, function(delKey){
				cache.remove(delKey);
			});
		}
	}
	return util;
}])
;