angular.module('MCMRelationshop.Services', [
	'MCMRelationshop.Utils',
	'MCMRelationshop.Resource.Store',
	'security.service'
])
.factory('TrackingGPS', ['$http','HttpUtil','AppUtil','$cordovaGeolocation','Store','security','$ionicPopup','APP_CONFIG',
	function($http,HttpUtil,AppUtil,$cordovaGeolocation,Store,security,$ionicPopup,APP_CONFIG){
		var watch = null;
		var curentPos = null;
		var r = {
			startTrack: function(store,userName, desPos,successFunc){
				var watchOptions = {
						frequency: 1000,
						timeout : 3000,
						enableHighAccuracy: false // may cause errors if true
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
						console.log('curentPos');
						console.log(curentPos);  
						if (typeof(curentPos)!= 'undefined' && curentPos!=null) {
							var speed = AppUtil.calculateDistance(curentPos, position.coords);
							console.log('speed');
							console.log(speed);

						}		
						curentPos = position.coords;	
						var distance = AppUtil.calculateDistance(desPos, curentPos);

						console.log('current Position');
						console.log(position.coords);  
						console.log('destionation position');
						console.log(desPos);  
						console.log('distance');
						console.log(distance);
						if( distance<= 0.05)
						{
							var checkin = {
							  StoreID: store.StoreID,
							  UserName:  userName,
							  Message: 'checkin',							 
							  act: 3
							};
							Store.addCheckIn(checkin);
							console.log('You arrived');
							$ionicPopup.alert({
									title: APP_CONFIG.AlertTitle,
									template: 'You checked in '+store.Name+' successfully.'
								});
							watch.clearWatch(watch.watchID);
							successFunc();
							
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
					},watchOptions
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


	 