angular.module('KooKoo.Login', [
	
])
.controller('LoginCtrl', ['$rootScope','$scope', '$state', '$stateParams','$ionicPlatform','$ionicLoading','security','APP_CONFIG','$ionicPopup','$q','$ionicViewService','$ionicNavBarDelegate','$ionicSideMenuDelegate',
	function($rootScope, $scope, $state, $stateParams,$ionicPlatform, $ionicLoading,security, APP_CONFIG,$ionicPopup, $q, $ionicViewService,$ionicNavBarDelegate,$ionicSideMenuDelegate) { 
		console.log('LoginCtrl');
		ionic.Platform.ready(function(){
    		$ionicNavBarDelegate.showBar(false);
    		//$scope.slideHeader = false;
    		//$scope.drapmenu = false;
    		//console.log('$scope.drapmenu');
    		//console.log($scope.drapmenu);
    		//$scope.$safeApply();
    		if($stateParams.hidebar == "true")
	    	{
				$ionicSideMenuDelegate.canDragContent(false);
			}
			else
			{
				$ionicSideMenuDelegate.canDragContent(true);
			}
        		
     	});
		/**
     	* SOCIAL LOGIN
     	* Facebook and Google
     	*/
	    // FB Login
	    $scope.fbLogin2 = function () {
	        console.log('FB.login');
	        FB.login(function (response) {
	            if (response.authResponse) {
	                getUserInfo();
	            } else {
	                console.log('User cancelled login or did not fully authorize.');
	            }
	        }, {scope: 'email,user_photos,user_videos'});

	        function getUserInfo() {
	            // get basic info
	            FB.api('/me', function (response) {
	                console.log('Facebook Login RESPONSE: ' + angular.toJson(response));
	                // get profile picture
	                FB.api('/me/picture?type=normal', function (picResponse) {
	                    console.log('Facebook Login RESPONSE: ' + picResponse.data.url);
	                    response.imageUrl = picResponse.data.url;
	                    // store data to DB - Call to API
	                    // Todo
	                    // After posting user data to server successfully store user data locally
	                    var user = {};
	                    user.ExternalID = response.id;
	                    user.ExternalType = APP_CONFIG.SocialWeb.Facebook;
	                    user.FullName = response.name;
	                    user.Email = response.email;
	                    user.UserName = response.email;
	                    user.Password = response.email;
	                    if(response.gender) {
	                        response.gender.toString().toLowerCase() === 'male' ? user.Sex = 'Male' : user.Sex = 'Female';
	                    } else {
	                        user.Sex = '';
	                    }
	                    user.SocialWeb = APP_CONFIG.SocialWeb.Facebook;
	                    user.ProfilePic = picResponse.data.url;
	                    security.setCurrentUser(user);
	                    user.act = 19;//create account
	                    User.createUser(user);
	                   // $cookieStore.put('userInfo', user);
	                   $rootScope.$broadcast('userLoggedIn',APP_CONFIG.SocialWeb.Facebook);
	                   // $state.go('dashboard');

	                });
	            });
	        }
	    };
	}
])