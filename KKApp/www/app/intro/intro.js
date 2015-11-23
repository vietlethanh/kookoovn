angular.module('MCMRelationshop.Intro', [
	'MCMRelationshop.Utils'
])
.controller('IntroCtrl', ['$scope','$state','CacheUtil','MCMTracker','$ionicViewService',
	function($scope, $state, CacheUtil,MCMTracker, $ionicViewService) {  
		//public function
		var offCache = CacheUtil.getOfflineAppCache(),
			appCache = CacheUtil.getAppCache();
		$scope.skip = function(){
			appCache.put('didIntro', true);
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.home');
		}
		$scope.dontshow = function(){
			offCache.put('didIntro', true);
			appCache.put('didIntro', true);
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.home');
		}
		$scope.begin = function(){
			offCache.put('didIntro', true);
			appCache.put('didIntro', true);
			$ionicViewService.nextViewOptions({
				disableBack: true
			});
			$state.go('app.home');
		}
		MCMTracker.trackView('Intro');
	}
]);