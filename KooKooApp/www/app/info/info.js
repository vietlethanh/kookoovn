angular.module('MCMRelationshop.Info', [
	'MCMRelationshop.Resource.Setting'
])
.controller('InfoCtrl', ['$scope','$state','APP_CONFIG','MCMTracker',
	function($scope, $state,APP_CONFIG, MCMTracker) {  
		console.log('InfoCtrl');
		// private properties -------------------------------------------------------------
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.cfg = APP_CONFIG;
		// private method -------------------------------------------------------------
		//public method -------------------------------------------------------------
		
		$scope.goSupport = function(){
			$state.go('app.support');
		}
		// Init -------------------------------------------------------------
		MCMTracker.trackView('Info')
	}
])
.controller('SupportCtrl',['$scope','Setting','security','$ionicLoading','$ionicPopup','APP_CONFIG','MCMTracker',
	function($scope, Setting,security,$ionicLoading,$ionicPopup,APP_CONFIG, MCMTracker){
		// private properties -------------------------------------------------------------
		var curentUser = security.getCurrentUser();
		//console.log(curentUser);
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.feedback = {
			Email: curentUser ? curentUser.UserEmail : '',
			BannerID: curentUser ? curentUser.BannerID: 13, // default is united banner
			Body: ''
		}
		$scope.cfg = null;
		// private method -------------------------------------------------------------
		//public method -------------------------------------------------------------
		$scope.send = function(){
			$ionicLoading.show();
			Setting.sendFeedback($scope.feedback).then(function(res){
				$ionicLoading.hide();
				if(res.data){
					// clear
					$scope.feedback = {
						Email: curentUser ? curentUser.UserEmail: '',
						BannerID: '',
						Body: ''
					};
					var alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'Your feedback was sent.'
					});
				}
				else {
					var alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'Have problem.Please try another time.'
					});

				}
			})
		}
		// Init -------------------------------------------------------------
		MCMTracker.trackView('Support');
	}
])