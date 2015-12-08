angular.module('MCMRelationshop.Services', [
	'MCMRelationshop.Utils'
])
.factory('TrackingGPS', ['$http','HttpUtil','AppUtil','$cordovaGeolocation',
	function($http,HttpUtil,AppUtil,$cordovaGeolocation){
		var watch = null;
		var curentPos = null;
		var r = {
			startTrack: function(lat,long){
				var watchOptions = {
				frequency: 1000,
				timeout : 3000,
				enableHighAccuracy: true // may cause errors if true
				};

				watch = $cordovaGeolocation.watchPosition();

				watch.then(
					function(full) {
					  console.log('full');
					  console.log(full);
					  // error
					},
					function(err) {
					  console.log(err);
					  // error
					},
					function(position) {
						var lat  = position.coords.latitude;
						var long = position.coords.longitude;
						if (typeof(curentPos)!= 'undefined' && curentPos!=null) {
							var distance = AppUtil.calculateDistance(curentPos, position.coords);
							console.log('distance');
							console.log(distance);
						}		
						curentPos = position.coords;	

						console.log('watchPosition');
						console.log(position.coords);  
						if(lat==37.33233141)
						{
							console.log('You arrived');
							//watch.clearWatch(watch.watchID);
							/*
							function setSpeed(coords) {
							  var KMS_TO_KMH = 3600;
							  if (!prevCoord) {
							    prevCoord = coords;
							  }
							  $scope.session.distance += calculateDistance(prevCoord, coords);
							  if (duration.asSeconds() > 0) {
							    $scope.session.avgSpeed = ($scope.session.distance / duration.asSeconds()) * KMS_TO_KMH;
							  }
							  prevCoord = coords;
							}
							*/
						}
					},
					watchOptions
				);
				watchId = watch.watchID;
			},

			stopTrack: function(){
				if (typeof(watch)!= 'undefined' && watch!=null) {
					watch.clearWatch(watch.watchID);
				}				
			},			
		}
		return r;
	}
]);


	 