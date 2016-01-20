angular.module('MCMRelationshop.Resource.Store', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory'
])
.factory('Store', ['$q','$http','DSCacheFactory','HttpUtil','CacheUtil','AppUtil','APP_CONFIG',
	function($q, $http, DSCacheFactory, HttpUtil, CacheUtil, AppUtil, APP_CONFIG){
		var r = {
			getStore: function(storeid,clearCache){

				var opts = HttpUtil.opts({
					cache: true,
					offcache: true,
					intercetorParams: {api: false}
				})
				if(typeof(clearCache) != 'undefined' && clearCache) {
					CacheUtil.clearKey([APP_CONFIG.KooKooAPI+'/store.php?act=2&id='+storeid]);
				}
				return $http.get(APP_CONFIG.KooKooAPI+'/store.php?act=2&id='+storeid,opts);
				/*var p  = $http.get('http://kookoo.local:8080/store.php?id='+storeid, opts).then(function(res){
					if(!res.data.Services){
						return res;
					}
					res.data.Services = angular.fromJson(res.data.Services);
					return res;

				});
				return p;*/
			},
			searchStore: function(keyword,catId,pos){				
				keyword = keyword == undefined ? '': keyword;
				var opts = HttpUtil.opts({
					intercetorParams: {api: false},
					cache: true	,
					offcache: true	
					
				});
				console.log('searchStore pos');

				console.log(pos);

				return $http.get(APP_CONFIG.KooKooAPI+'/store.php?act=1&distance=1&'+ 
					HttpUtil.encodeUrl({keyword: keyword})+'&'+
					HttpUtil.encodeUrl({cat: catId})+'&'+ 
					HttpUtil.encodeUrl({lat: typeof(pos) != 'undefined'? AppUtil.setDecimal(pos.lat,4):0})+'&'+
					HttpUtil.encodeUrl({lng: typeof(pos) != 'undefined'?AppUtil.setDecimal(pos.lng,4):0}),opts);
			},
			getCheckedInStores: function(userName,page,clearCache){					
				var opts = HttpUtil.opts({
					intercetorParams: {	api: false,	},
					cache: !clearCache	,
					offcache: !clearCache			
				});
				
				return $http.get(APP_CONFIG.KooKooAPI+'/store.php?act=20&'+ 
					HttpUtil.encodeUrl({UserName: userName})+'&'+
					HttpUtil.encodeUrl({page: page}),opts);
			},
			loadFavoriteStores: function(userName,page,clearCache){					
				var opts = HttpUtil.opts({
					intercetorParams: {	api: false,	},
					cache: !clearCache	,
					offcache: !clearCache			
				});
				
				return $http.get(APP_CONFIG.KooKooAPI+'/store.php?act=21&'+ 
					HttpUtil.encodeUrl({UserName: userName})+'&'+
					HttpUtil.encodeUrl({type: APP_CONFIG.TrackType.FAVORITE})+'&'+
					HttpUtil.encodeUrl({page: page}),opts);
			},


			getCategory: function(){					
				var opts = HttpUtil.opts({
					intercetorParams: {api: false}
					
				});				
				return $http.get(APP_CONFIG.KooKooAPI+'/store.php?act=5');
			},
			addCheckIn: function(checkin){			
			
				var opts = HttpUtil.opts({
					intercetorParams: {api: false}
					
				});
				return $http.post( APP_CONFIG.KooKooAPI+'/store.php',checkin, opts);					
			},
			getTracker: function(tracker){		
			
				var opts = HttpUtil.opts({
					intercetorParams: {api: false}
					
				});
				return $http.post( APP_CONFIG.KooKooAPI+'/tracker.php',tracker, opts);					
			},
			addTracker: function(tracker){		
			
				var opts = HttpUtil.opts({
					intercetorParams: {api: false}
					
				});
				return $http.post( APP_CONFIG.KooKooAPI+'/tracker.php',tracker, opts);					
			},
			searchNearByStore: function(latlng){
				var opts = HttpUtil.opts();
				return $http.get('/stores?'+HttpUtil.encodeUrl({latlng:latlng}),opts);

			},
			_getCircular: function(storeid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				})
				var p = $http.get('/stores/'+storeid+'/circular', opts);
				return p;
			},
			//Request.Get('/circulars/'+OLC.Account.CircularID+'/SearchCategories?storeId='+OLC.CurrentStoreID+'&keyword=', {},
			getCircularDepartmentList: function(circularId, storeid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				var promise = $http.get('/circulars/'+circularId+'/SearchCategories?storeId='+storeid+'&keyword=', opts);
				return promise;
			},
			getRecommendedItems: function(circularId, storeid, cardid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				var promise = $http.get('/recommended-items/circular/'+circularId+'/store/'+storeid+'/card/'+cardid, opts);
				return promise;
				
			},
			_apiCirular2WeeklyAd: function(circular, deparmentlist, store){
				var i = 0, l = circular.length, weeklyad, cir,
					ip, lp, p,
					is,ls, s;
				var weeklyads = _.map(circular, function(cir, index){
					var pages = cir.CS_Page,
						weeklyad = {};
					weeklyad.StartDate = cir.StartDate;
					weeklyad.EndDate = cir.EndDate;
					weeklyad.CS_CircularID = cir.CS_CircularID;
					weeklyad.DepartmentList = deparmentlist[index];
					weeklyad.Store  = store;

					if(!cir.CS_Page){
						return [];
					}
					weeklyad.Flyers = pages;
					var ps = _.flatten(pages, 'SaleItems');

					// handle cateogryName					
					weeklyad.items = ps;
					return weeklyad;
				});
				//weeklyad.items = _.flatten(cir_saleItems);
				return weeklyads;
			},
			/*
				keycache: /stores/'+storeid+'/circular';
			*/
			getCircular: function(storeid){
				var appCahce, key, circular,deferred;
				deferred = $q.defer();
				appCahce = CacheUtil.getAppCache();
				key = '/stores/'+storeid+'/circular';

				circular = appCahce.get(key);
				if(circular){
					deferred.resolve({data: circular});
				}
				// not cache
				else {
					var pCir = this._getCircular(storeid),
						pStore = this.getStore(storeid),
						thenFn, failFn;
					thenFn = function(res_array){
						var pStoreRes = res_array[0],
							pCirRes = res_array[1],
							cirs = pCirRes.data,
							depReq = [];
						for(var i = 0; i < cirs.length;i++){
							depReq.push(this.getCircularDepartmentList(cirs[i].CS_CircularID, pStoreRes.data.CS_StoreID));
						}
						$q.all(depReq).then(function(res_array){
							var deptlist = _.map(res_array, function(dept){
								return dept.data;
							})
							var weeklyad = this._apiCirular2WeeklyAd(cirs,deptlist, pStoreRes.data);
							// put to cache
							appCahce.put(key, weeklyad);
							deferred.resolve({data:weeklyad});
						}.bind(this));
						
					};
					failFn = function(res){
						deferred.reject(res);
					}
					$q.all([pStore, pCir]).then(thenFn.bind(this), failFn);
				}


				return deferred.promise;
			}
		}
		return r;
	}
]);