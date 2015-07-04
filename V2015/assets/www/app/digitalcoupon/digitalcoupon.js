angular.module('MCMRelationshop.DigitalCoupon', [
	'MCMRelationshop.Resource.DigitalCoupon',
	'MCMRelationshop.Resource.SmartRewards'
])
.controller('DigitalCouponCtrl', ['$scope','$state','$stateParams', '$q', 'security', 'DigitalCoupon', 'SmartRewards','$ionicLoading','MCMTracker', 'APP_CONFIG',
	function($scope, $state, $stateParams, $q, security, DigitalCoupon,SmartRewards, $ionicLoading, MCMTracker, APP_CONFIG){
		// private properties -------------------------------------------------------------
		var sortby = $stateParams.sortBy ? $stateParams.sortBy : 'brand';
		var catId = $stateParams.catId ? $stateParams.catId : '';
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------		
		$scope.defaultImage = APP_CONFIG.DefaultImage;
		$scope.digitalcoupons = [];
		$scope.isGuest = security.isGuestMode();
		$scope.predicate = sortby == 'savings' ? 'Value': 'Brand';
		$scope.reverse = sortby == 'savings' ? true : false;
		$scope.currentUser = security.getCurrentUser();
		// private method -------------------------------------------------------------
		function loadData(){
			$ionicLoading.show();
			return DigitalCoupon.getDigitalCoupons().then(function(res){
				if(catId != '')
				{
					_(res.data).forEach(function(coupon) {
						_(coupon.Categories).forEach(function(cat) {
							if(cat == catId){
								$scope.digitalcoupons.push(coupon);
							}
						});
					});
					$ionicLoading.hide();
					return;
				}
				$scope.digitalcoupons = res.data;
				$ionicLoading.hide();
			}, function(res){
				$ionicLoading.hide();
				if(res.status === 404){
					$scope.showWatingCardView =  true;
				}
			});
		}
		//public method -------------------------------------------------------------
		$scope.sortCoupons = function(){
			$state.go('app.sortcoupons');
		};
		$scope.searchCoupons = function(){
			$state.go('app.searchcoupons');
		};
		$scope.add = function(dc){
			$ionicLoading.show();
			SmartRewards.redeemDigitalCoupon(dc.Id).then(function(res){
				dc.IsAdded = true;
				$ionicLoading.hide();
			});
		}
		// Init -------------------------------------------------------------
		if($scope.currentUser && $scope.currentUser.SRCardID){
			loadData();
		}
		MCMTracker.trackView('DigitalCoupon');
	}
])

.controller('SortCouponsCtrl', ['$scope', '$state', 'DigitalCoupon', '$ionicLoading',
	function($scope, $state, DigitalCoupon, $ionicLoading){
		// public properties -------------------------------------------------------------
		// scope properties --------------------------------------------------------------
		$scope.coupondCats = [];
		//public method -------------------------------------------------------------
		$scope.goCat = function(cat){
			$state.go('app.digitalcoupons', {catId: cat.CS_CategoryId + ''});
		};
		$scope.sort = function(type){
			$state.go('app.digitalcoupons', {sortBy: type + ''});
		};
		$scope.searchCoupons = function(){
			$state.go('app.searchcoupons');
		};
		// private method -------------------------------------------------------------
		function loadCategories(){
			DigitalCoupon.getCouponCategories('').then(function(res){
				$scope.coupondCats = res.data;
			});	
		}
		loadCategories();
	}
]);