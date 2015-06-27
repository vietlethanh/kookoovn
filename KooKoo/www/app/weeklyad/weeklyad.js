angular.module('MCMRelationshop.WeeklyAd', [
	'MCMRelationshop.Resource.Store',
	'MCMRelationshop.Resource.ShoppingList'
])
.controller('WeeklyAdCtrl', ['$scope','$state','$stateParams', '$q', 'security', 'Store','ShoppingList','DSCacheFactory','$ionicLoading', 'toaster','MCMTracker','$ionicPopup','APP_CONFIG','$ionicViewService','$timeout',
	function($scope, $state, $stateParams, $q, security, store,shoppinglist, DSCacheFactory, $ionicLoading, toaster, MCMTracker, $ionicPopup,APP_CONFIG, $ionicViewService,$timeout
	 ) {  
		//Store.ge
		var vm = this;
		// private properties -------------------------------------------------------------
		var currentStore, 
			deptParam,
			currentUser,
			userId = 'guest',
			shoppingItems = [];
		
		// public properties -------------------------------------------------------------
		vm.items = [];
		vm.simtes = [];
		vm.dept = null;
		vm.hasMore = false;
		vm.currentStore = currentStore;
		// scope properties -------------------------------------------------------------
		$scope.pageInfo = {
			page: 1, 
			pageSize: 20,
			totalResult: 0
		};
		// private method -------------------------------------------------------------
		var viewportWidth = window.innerWidth;
		var colInfoWidth = viewportWidth -110 -55,
			tCharPerLine = Math.ceil(colInfoWidth/9.6),
			dCharPerLine = Math.ceil(colInfoWidth/7.3),
			pCharPerLine = Math.ceil(colInfoWidth/7.75);

		function calHeight(text,charPerLine, lineHeight){
			if(!text || text.length ==0){
				return 0;
			}
			var reg, m, lines, lineCount, line, cline, cleanReg;
			reg = /<br>|<br\/>/g;
			cleanReg = /<\/?[^>]+(>|$)/g;
			lines = text.split(reg);
			lineCount = lines.length;
			for(var i = 0; i < lines.length;i++){
				line  = lines[i];
				// remove html tag
				line = line.replace(cleanReg,'');
				cline = Math.ceil(line.length/charPerLine);
				
				if(cline>1){
					lineCount+= (cline-1);
				}
			} 
			var height = lineCount*lineHeight;
			return height;
		}
		function getPage(){
			var start, end, page, totalResult, pageSize, items;
			page = $scope.pageInfo.page;
			totalResult = $scope.pageInfo.totalResult;
			pageSize = $scope.pageInfo.pageSize;
			
			start = (page-1)* pageSize;
			end = Math.min(start + pageSize, totalResult);
			items = angular.copy(vm.items.slice(start, end));
			_.forEach(shoppingItems, function(sItem){
				var find = _.find(items, {CS_BoxID: sItem.ProductId});
				if(find){
					find.IsAdded = true;
				}
			});
			// cal height
			_.forEach(items, function(item){
				item.cheight = null;
				if(item.height){
					return;
				}
				var height = 212, reg=/<br/g, tlineHeight= 20, dLineHeight = 20, tLine, dLine, pLine;
				var nameHeight  = calHeight(item.Name, tCharPerLine, tlineHeight),
					descHeight  = calHeight(item.Description, dCharPerLine, dLineHeight),
					priceHeight = calHeight(item.Price, pCharPerLine, dLineHeight);

				height = Math.max(height, (nameHeight+descHeight+priceHeight+30+2));
				//console.log(height);
				item.height = height;
			});
			
			return items;
		};
		function loadWeeklyAd(storeId, deptId, SRCardID){
			// load weeklyAd
			deptId = parseInt(deptId);
			$ionicLoading.show();
			var req = store.getCircular(currentStore.CS_StoreID).then(function(res){
				vm.weeklyAd = res.data[0];
				//console.log(vm.weeklyAd);
				var defered = $q.defer();
				if(!vm.weeklyAd){
					defered.resolve([]);
					return defered.promise;
				}
				// getAll weekly ad
				if(!deptId){
					vm.items = vm.weeklyAd.items;
					defered.resolve(vm.items);
				}
				// get Recommend Item
				else if(deptId == -1){
					store.getRecommendedItems(vm.weeklyAd.CS_CircularID,storeId,SRCardID).then(function(res){
						vm.items = res.data;
						vm.dept = {
							CS_CategoryId: -1,
							CategoryName: 'Recommended Items'
						}
						defered.resolve(vm.items);
					});
				}
				else {
					vm.items = _.filter(vm.weeklyAd.items, {CS_CategoryID:deptId});
					vm.dept = _.find(vm.weeklyAd.DepartmentList, {CS_CategoryId: deptId});
					defered.resolve(vm.items);
				}
				return defered.promise;
			});
			
			// paging
			/*
			req.then(function(){
				$scope.pageInfo = {
					page: 1, 
					pageSize: 20,
					totalResult: vm.items.length
				}
				vm.sitems = getPage();
				$ionicLoading.hide();
				
			});
			*/

			var shopReq = shoppinglist.getGateway().getShoppingList(userId).then(function(res){
				shoppingItems = _.filter(res.data, function(sItem){
					return sItem.CategoryName != 'Ingredients';
				});
				return res;
			});
			$q.all([req, shopReq]).then(function(res){
				$scope.pageInfo = {
					page: 1, 
					pageSize: 20,
					totalResult: vm.items.length
				}
				vm.sitems = getPage();
				$ionicLoading.hide();
			});
			
		};//loadWeeklyAd
		
		
		//public method -------------------------------------------------------------
		vm.loadMore = function(){
			++$scope.pageInfo.page;
			Array.prototype.push.apply(vm.sitems, getPage());
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};
		vm.goToDeptList = function(){
			$state.go('app.weeklyaddepts');
		};
		vm.addToShoppingList = function(item){
			$ionicLoading.show();
			var cats = vm.weeklyAd.DepartmentList,
				cat = _.find(cats, {CS_CategoryId:item.CS_CategoryID});
			item.CategoryName = cat ? cat.CategoryName: 'Weekly Ad';
			shoppinglist.getGateway().addItem(item, userId).then(function(data){
				$ionicLoading.hide();
				//toaster.pop('success','Success', 'The item is added.')
				item.IsAdded = true;				
			});
		};
		// Init -------------------------------------------------------------
		currentStore =security.getCurrentStore();
		currentUser = security.getCurrentUser();
		userId = currentUser? currentUser.Email: 'guest';
		vm.currentStore = currentStore;
		//console.log(currentStore);
		if(!currentStore){
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.storelocator');
			$ionicPopup.alert({
				title: APP_CONFIG.AlertTitle,
				template: "Please select store."
			});
			return;
		};
		deptParam = $stateParams.dept;
		
		$scope.$watch('pageInfo', function(pi){
			vm.hasMore = pi.page * pi.pageSize < pi.totalResult; 
			// cheat for last item
			if(!vm.hasMore && vm.sitems && vm.sitems.length>0){
				var lastItem = vm.sitems[vm.sitems.length-1];
				lastItem.cheight = lastItem.height+70;
			}
		}, true);
		
		loadWeeklyAd(currentStore.CS_StoreID,deptParam, (currentUser?currentUser.SRCardID: null));
		MCMTracker.trackView('WeeklyAd')
	}
])
.controller('WeeklyAdDeptsCtrl', ['$scope','$state', 'security', 'Store','DSCacheFactory','MCMTracker',
	function($scope, $state, security, store, DSCacheFactory ,MCMTracker) { 
		var vm, currentStore;
		vm = this;
		currentStore =security.getCurrentStore();
		var currentUser = security.getCurrentUser();
		vm.depts = [];
		vm.ritems = [];
		store.getCircular(currentStore.CS_StoreID).then(function(res){
			var weeklyAd = res.data[0];
			vm.depts = weeklyAd.DepartmentList; 
			if(!currentUser || !currentUser.SRCardID){
				return
			}
			store.getRecommendedItems(weeklyAd.CS_CircularID,currentStore.CS_StoreID, currentUser.SRCardID).then(function(res){
				vm.ritems = res.data;
			})
		});
		
		// function
		vm.goRecommendedDept = function(){
			vm.goDept({
				CS_CategoryId: -1,
				CategoryName: "Recommended Items"
			});
		};
		vm.goAll = function(){
			$state.go('app.weeklyad');
		};
		vm.goDept = function(item){
			$state.go('app.weeklyad', {dept: item.CS_CategoryId});
		}
		// end function
		MCMTracker.trackView('WeeklyAdDept')
	}
])
.controller('WeeklyAdFlyerCtrl', ['$scope','$state','$stateParams', '$q', 'security', 'Store','ShoppingList','DSCacheFactory','$ionicLoading', 'toaster','MCMTracker','$ionicPopup','APP_CONFIG','$ionicViewService','$ionicScrollDelegate','$ionicSlideBoxDelegate',
	function($scope, $state, $stateParams, $q, security, store,shoppinglist, DSCacheFactory, $ionicLoading, toaster, MCMTracker, $ionicPopup,APP_CONFIG, $ionicViewService,  $ionicScrollDelegate,$ionicSlideBoxDelegate ) {  
		//Store.ge
		var vm = this;
		// private properties -------------------------------------------------------------
		var currentStore, 
			deptParam,
			currentUser,
			userId = 'guest',
			shoppingItems = [];
		
		// public properties -------------------------------------------------------------
		vm.items = [];
		vm.simtes = [];
		vm.dept = null;
		vm.hasMore = false;
		vm.currentStore = currentStore;
		// scope properties -------------------------------------------------------------
		$scope.pageInfo = {
			page: 1, 
			pageSize: 20,
			totalResult: 0
		};
		$scope.mode = 'full'; // full, detail
		
		// private method -------------------------------------------------------------
		function getPage(){
			var start, end, page, totalResult, pageSize;
			page = $scope.pageInfo.page;
			totalResult = $scope.pageInfo.totalResult;
			pageSize = $scope.pageInfo.pageSize;
			
			start = (page-1)* pageSize;
			end = Math.min(start + pageSize, totalResult);

			var items = angular.copy(vm.items.slice(start, end));
			_.forEach(shoppingItems, function(sItem){
				var find = _.find(items, {CS_BoxID: sItem.ProductId});
				if(find){
					find.IsAdded = true;
				}
			});
			/*
			// cal height
			_.forEach(items, function(item){
				item.cheight = null;
				if(item.height){
					return;
				}
				var height = 200, reg=/<br/g, tlineHeight= 20, dLineHeight = 20, tLine, dLine, pLine;
				if(!item.Name || item.Name.length == 0){
					tLine = 0;
				}
				else{
					var m  = item.Name.match(reg); 
					tLine = m ? m.length +1: 1;
				}
				if(!item.Description || item.Description.length == 0){
					dLine = 0;
				}
				else {
					m = item.Description.match(reg);
					dLine = m ? m.length+1: 1;
				}
				if(!item.Price || item.Price.length == 0){
					pLine = 0;
				}
				else {
					m = item.Price.match(reg);
					pLine = m ? m.length+1: 1;
				}

				height = Math.max(height, (tLine*tlineHeight +dLine*dLineHeight+ pLine*dLineHeight+30));
				item.height = height;

			});
			*/
			return items;
		};
		function loadWeeklyAd(storeId, deptId, SRCardID){
			// load weeklyAd
			deptId = parseInt(deptId);
			$ionicLoading.show();
			var req = store.getCircular(currentStore.CS_StoreID).then(function(res){
				vm.weeklyAd = res.data[0];
				//console.log(vm.weeklyAd);
				var defered = $q.defer();
				if(!vm.weeklyAd){
					defered.resolve([]);
					return defered.promise;
				}
				
				vm.items = vm.weeklyAd.Flyers[0].SaleItems;
				defered.resolve(vm.items);
				$ionicSlideBoxDelegate.update();
				return defered.promise;
			});
			
			// paging
			/*
			req.then(function(){
				$scope.pageInfo = {
					page: 1, 
					pageSize: 20,
					totalResult: vm.items.length
				}
				vm.sitems = getPage();
				$ionicLoading.hide();
			});
			*/
			var shopReq = shoppinglist.getGateway().getShoppingList(userId).then(function(res){
				shoppingItems = _.filter(res.data, function(sItem){
					return sItem.CategoryName != 'Ingredients';
				});
				return res;
			});
			$q.all([req, shopReq]).then(function(res){
				// paging
				$scope.pageInfo = {
					page: 1, 
					pageSize: 20,
					totalResult: vm.items.length
				}
				vm.sitems = getPage();
				$ionicLoading.hide();
			});
			
		};//loadWeeklyAd
		
		function changeFlyer(index){
			if($scope.mode== 'detail'){
				$ionicScrollDelegate.$getByHandle('listScroll').scrollTop();
			}
			vm.items =  vm.weeklyAd.Flyers[index].SaleItems;
			$scope.pageInfo = {
					page: 1, 
					pageSize: 20,
					totalResult: vm.items.length
				}
			vm.sitems = getPage();
		}
		//public method -------------------------------------------------------------
		vm.loadMore = function(){
			++$scope.pageInfo.page;
			Array.prototype.push.apply(vm.sitems, getPage());
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};
		vm.goToDeptList = function(){
			$state.go('app.weeklyaddepts');
		};
		vm.addToShoppingList = function(item){
			$ionicLoading.show();
			var cats = vm.weeklyAd.DepartmentList,
				cat = _.find(cats, {CS_CategoryId:item.CS_CategoryID});
			item.CategoryName = cat ? cat.CategoryName: 'Weekly Ad';
			shoppinglist.getGateway().addItem(item, userId).then(function(data){
				$ionicLoading.hide();
				//toaster.pop('success','Success', 'The item is added.')
				item.IsAdded = true;
				
			});
		};
		$scope.toggleMode = function(){
			$scope.mode = $scope.mode == 'full'? 'detail': 'full';
			$scope.$broadcast('changeMode', [$scope.mode]);
			var scrollInstances = $ionicScrollDelegate._instances;
			angular.forEach(scrollInstances, function(scrollInstance){
				if( !scrollInstance.$$delegateHandle || scrollInstance.$$delegateHandle.indexOf('flyer') < 0){
					return;
				}
				scrollInstance.zoomTo(1);
			});
		};
		$scope.slideHasChanged = function(index){
			changeFlyer(index);
			/*
			var scrollInstances = $ionicScrollDelegate.__instances;
			angular.forEach(scrollInstances, function(scrollInstance){
				scrollInstance.zoomTo(1);
			});
			*/
		};
		// Init -------------------------------------------------------------
		currentStore =security.getCurrentStore();
		currentUser = security.getCurrentUser();
		userId = currentUser? currentUser.Email: 'guest';
		vm.currentStore = currentStore;
		//console.log(currentStore);
		if(!currentStore){
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.storelocator');
			$ionicPopup.alert({
				title: APP_CONFIG.AlertTitle,
				template: "Please select store."
			});
			return;
		};
		deptParam = $stateParams.dept;
		
		$scope.$watch('pageInfo', function(pi){
			vm.hasMore = pi.page * pi.pageSize < pi.totalResult; 
		}, true);
		
		loadWeeklyAd(currentStore.CS_StoreID,deptParam, (currentUser?currentUser.SRCardID: null));
		MCMTracker.trackView('WeeklyAd');
	}
]);
