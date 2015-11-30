angular.module('KooKoo.Login', [
	'ngCordovaOauth'

])
.controller('LoginCtrl', ['$rootScope','$scope', '$state', '$stateParams','$ionicPlatform','$ionicLoading','security','APP_CONFIG','$ionicPopup','$q','$ionicViewService','$ionicNavBarDelegate','$ionicSideMenuDelegate','$cordovaOauth',
	function($rootScope, $scope, $state, $stateParams,$ionicPlatform, $ionicLoading,security, APP_CONFIG,$ionicPopup, $q, $ionicViewService,$ionicNavBarDelegate,$ionicSideMenuDelegate,$cordovaOauth) { 
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

	     //Login FB with oauth2
	    $scope.facebooklogin = function() {
	        $cordovaOauth.facebook(APP_CONFIG.SocialAppID.FacebookAppID, ["email", "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
	            //$localStorage.accessToken = result.access_token;
	            //$location.path("/profile");
	            console.log(JSON.stringify(result));
	            security.setCurrentUser(
				            	{
				            		SocialWeb:APP_CONFIG.SocialWeb.Facebook
				            	}
		            		);
		            	
	        }, function(error) {
	            alert("There was a problem signing in!  See the console for logs");
	            console.log(error);
	        });
	    };
		//This method is executed when the user press the "Login with facebook" button
		$scope.facebookSignIn = function() {
			facebookConnectPlugin.getLoginStatus(function(success){
			 if(success.status === 'connected'){
			    // the user is logged in and has authenticated your app, and response.authResponse supplies
			    // the user's ID, a valid access token, a signed request, and the time the access token
			    // and signed request each expire
			    console.log('getLoginStatus', success.status);

						/*//check if we have our user saved
						var user = UserService.getUser('facebook');

						if(!user.userID)
						{
							getFacebookProfileInfo(success.authResponse)
							.then(function(profileInfo) {

								//for the purpose of this example I will store user data on local storage
								UserService.setUser({
									authResponse: success.authResponse,
									userID: profileInfo.id,
									name: profileInfo.name,
									email: profileInfo.email,
									picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
								});

								$state.go('app.home');

							}, function(fail){
								//fail get profile info
								console.log('profile info fail', fail);
							});
						}else{
							$state.go('app.home');
						}*/

			 } else {
			    //if (success.status === 'not_authorized') the user is logged in to Facebook, but has not authenticated your app
			    //else The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
			    console.log('getLoginStatus', success.status);

				$ionicLoading.show({
			      template: 'Logging in...'
			    });

			    //ask the permissions you need. You can learn more about FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
			    facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
			  }
			});
		};
		//This is the success callback from the login method
		var fbLoginSuccess = function(response) {
		if (!response.authResponse){
		  fbLoginError("Cannot find the authResponse");
		  return;
		}

		var authResponse = response.authResponse;

		getFacebookProfileInfo(authResponse)
			.then(function(profileInfo) {
			  //for the purpose of this example I will store user data on local storage
			  /*UserService.setUser({
			    authResponse: authResponse,
						userID: profileInfo.id,
						name: profileInfo.name,
						email: profileInfo.email,
			    picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
			  });
				*/
			  $ionicLoading.hide();
			  $state.go('app.home');

			}, function(fail){
			  //fail get profile info
			  console.log('profile info fail', fail);
			});
		};


		//This is the fail callback from the login method
		var fbLoginError = function(error){
		console.log('fbLoginError', error);
		$ionicLoading.hide();
		};
	}
])