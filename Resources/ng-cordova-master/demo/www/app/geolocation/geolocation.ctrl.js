angular.module('demo.geolocation.ctrl', [])

  .controller('GeolocationCtrl', function ($scope, $cordovaGeolocation) {

      var watchOptions = {
        frequency: 1000,
        timeout : 3000,
        enableHighAccuracy: true // may cause errors if true
      };
     
      var watch = $cordovaGeolocation.watchPosition();
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
           console.log('watchPosition');
          console.log(position);  
      },watchOptions);



    $scope.getLocation = function () {

      return;

      $cordovaGeolocation
        .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
        .then(function (position) {
          console.log("position found");
          $scope.position = position;
          // long = position.coords.longitude
          // lat = position.coords.latitude
        }, function (err) {
          console.log("unable to find location");
          $scope.errorMsg = "Error : " + err.message;
        });
    };

  });
