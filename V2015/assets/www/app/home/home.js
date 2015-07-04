angular.module('MCMRelationshop.Home', [
	'MCMRelationshop.Resource.Ads',
	'MCMRelationshop.Analytics'
])
/*
.controller('HomeCtrl', [
	function($scope) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		// private method -------------------------------------------------------------
		//public method -------------------------------------------------------------
		// Init -------------------------------------------------------------
	}
])
*/
.controller('HomeCtrl', ['$scope','Ads','APP_CONFIG','MCMTracker','security',
	function($scope, Ads, APP_CONFIG,MCMTracker, security) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		var currentStore =security.getCurrentStore();
		var bannerid = currentStore? currentStore.CS_BannerID: '';
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------

		$scope.homelink = APP_CONFIG.Host+'/dynamic/gethome?bannerid='+bannerid;
		$scope.template = '';
		// private method -------------------------------------------------------------
		/*
		function load(){
			Ads.getHomeAds().then(function(res){
				console.log(res.data);
				var text = res.data;
				//text = text.replace(/(\r\n|\n|\r)/gm,"");
				$scope.template = decodeURI(text);			
			});
		}
		*/
		//public method -------------------------------------------------------------		
		// Init -------------------------------------------------------------
		//load();
		MCMTracker.trackView('Home');
	}
])