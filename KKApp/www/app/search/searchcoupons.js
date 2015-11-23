angular.module('MCMRelationshop.SearchCoupons', [
	'MCMRelationshop.Resource.DigitalCoupon',
	'MCMRelationshop.Resource.SmartRewards'
])
.controller('SearchCouponsCtrl', ['$scope', '$state', '$stateParams', 'security', 'DigitalCoupon', '$ionicLoading','$ionicPopup','APP_CONFIG','MCMTracker',
	function($scope, $state, $stateParams, security, DigitalCoupon, $ionicLoading,$ionicPopup, APP_CONFIG, MCMTracker) {  
// private properties -------------------------------------------------------------
		$scope.currentUser = security.getCurrentUser();
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------		
		$scope.digitalcoupons = [];
		$scope.result = {};
		// private method -------------------------------------------------------------
		//public method -------------------------------------------------------------
		$scope.search = function(form){
			if(form && form.$invalid){
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: 'Please input at least one character.'
				});
				return;
			}

			$ionicLoading.show();
			return DigitalCoupon.getDigitalCoupons().then(function(res){
				$scope.digitalcoupons = res.data;
				$ionicLoading.hide();
			}, function(res){
				$ionicLoading.hide();
				if(res.status === 404){
					$scope.showWatingCardView =  true;
				}
			});
		};
		$scope.add = function(dc){
			$ionicLoading.show();
			DigitalCoupon.redeemDigitalCoupon(dc.Id).then(function(res){
				dc.IsAdded = true;
				$ionicLoading.hide();
			});
		}
		// Init -------------------------------------------------------------
		MCMTracker.trackView('Search');
	}
]);