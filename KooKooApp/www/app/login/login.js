angular.module('MCMRelationshop.Login', [
	'security',
	'MCMRelationshop.Resource.ShoppingList',
	'ipCookie',
	'ngCordovaOauth'
	
])
.controller('LoginCtrl', ['$rootScope','$scope', '$state', '$stateParams','$ionicPlatform','ipCookie', 'security','$ionicLoading','$ionicPopup','MCMTracker','APP_CONFIG','$q','GuestShoppingList','UserShoppingList','User','$ionicViewService','ngFB','$cordovaOauth','$ionicNavBarDelegate','$ionicSideMenuDelegate','$timeout',
	function($rootScope, $scope, $state, $stateParams,$ionicPlatform, ipCookie, security, $ionicLoading,$ionicPopup,MCMTracker,APP_CONFIG, $q, GuestShoppingList, UserShoppingList,User, $ionicViewService,ngFB,$cordovaOauth,$ionicNavBarDelegate,$ionicSideMenuDelegate,$timeout) { 
		console.log('LoginCtrl');

		
		//console.log($ionicNavBarDelegate);
		// Disable side-menu drag so that it doesnt interfere with our tinder cards functionality
 		//$scope.drapmenu = false;

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
				$timeout(function(){
					if(!security.isGuestMode())
					{
						 $state.go('app.storelocator');
						 $ionicViewService.nextViewOptions({
			  				disableBack: true
			   			 });
					}
				}, 2500);
				

        		
     	 });
		$scope.BarClass = 'login-form';
	 
		// $rootScope.slideHeaderPrevious = 0;
		var vm = this;
		vm.showInvalid = 0;
		vm.userName = '';
		vm.password = '' ;
		var back = $stateParams.return;
		function handleCurrentStore(user){
			var deferred = $q.defer();
			var currentStore = security.getCurrentStore(),
				userStoreId = security.getCurrentUser().StoreID;
				if((currentStore && currentStore.CS_StoreID ==  userStoreId) || !currentStore){
					if(!currentStore){
						security.setCurrentStore({CS_StoreID: userStoreId});
					}
					deferred.resolve(true);
					return deferred.promise;
				}
				// case guest store != user store
				$ionicPopup.show({
					title: APP_CONFIG.AlertTitle,
					template: 'Your current selected store is different from your preferred store, please indicate which you want to view?',
					buttons: [
						{
							//text: user.StoreName,
							text: 'Preferred Store',
    						type: 'button-positive',
    						onTap: function(){
    							security.setCurrentStore({CS_StoreID: userStoreId});
    							deferred.resolve(true);
    						}
						},
						{
							//text: currentStore.StoreName + ' ' +currentStore.StoreID,
							text: 'Selected Store',
							type: 'button-positive',
							onTap: function(){
								deferred.resolve(true);
							}
						}
					]
				});
			return deferred.promise;

		}
		function mergeShoppingList(userid){
			var data = GuestShoppingList.prepareData(userid);
			if(!data && data.length ==0){
				return;
			}
			$ionicLoading.show();
			return UserShoppingList.merge(data, userid).then(function(res){
				$ionicLoading.hide();
				return res;
			});
		
		}

		/**
     	* SOCIAL LOGIN
     	* Facebook and Google
     	*/
     	$scope.facebooklogin = function () {

     		var isWebView = ionic.Platform.isWebView();
     		//console.log('isWebView');
     		//console.log(isWebView);
     		//console.log(ionic.Platform.platform());

     		if(isWebView)
     		{
     			facebookCordovaSignIn();   				
     		}
     		else
     		{     	    			
     			facebooAPILogin();  
     		}
     	} 	
	    // FB Login
	    var facebooAPILogin = function () {
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
	            FB.api('/me?fields=email,name', function (response) {
	                console.log('Facebook Login RESPONSE: ' + angular.toJson(response));
	                console.log(response);
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
	                        response.gender.toString().toLowerCase() === 'male' ? user.Sex = 1 : user.Sex = 0;
	                    } else {
	                        user.Sex = '1';
	                    }
	                    user.SocialWeb = APP_CONFIG.SocialWeb.Facebook;
	                    user.ProfilePic = picResponse.data.url;
	                    console.log("FB getUserInfo");
	                    console.log(user);
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
	    /*
		$scope.fbLogin = function () {
			alert(ionic.Platform.isAndroid());
			console.log(ionic.Platform.device());
			
		    ngFB.login({scope: 'email,read_stream,publish_actions'}).then(
		        function (response) {
		            if (response.status === 'connected') {

				            security.setCurrentUser(
				            	{
				            		SocialWeb:APP_CONFIG.SocialWeb.Facebook
				            	}
		            		);
		            	
		            	//console.log('Facebook login succeeded');
		            	//console.log(response);
						$rootScope.$broadcast('userLoggedIn',APP_CONFIG.SocialWeb.Facebook);
		                //console.log('Facebook login succeeded');
		                //$scope.closeLogin();
		            } else {
		                alert('Facebook login failed');
		            }
		        });
			
		};
		*/
		/*
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
	    */
	    //Login Google with oauth2
	    $scope.googleLogin = function() {
	    	alert('googleLogin');
	        $cordovaOauth.google(APP_CONFIG.SocialAppID.GoogleAppID,
	         ["https://www.googleapis.com/auth/urlshortener", 
	         "https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {
	            
	            console.log(JSON.stringify(result));
	        }, function(error) {
	        	console.log('Error googleLogin');
	            console.log(error);
	        });
    	}
    	
    	//Login Twitter with oauth2
	    $scope.twitterlogin = function() {
	    	//alert('twitterlogin');
	     	$cordovaOauth.twitter(APP_CONFIG.SocialAppID.TwitterAppID, 
	     		APP_CONFIG.SocialAppID.TwitterSecretKey).then(function(result) {
                  
                    oauth_token = result.oauth_token;
                    oauth_token_secret = result.oauth_token_secret;
                    user_id = result.user_id;
                    screen_name = result.screen_name;
                    
                    alert(screen_name);
                    alert(user_id);
                    alert(oauth_token);
                    alert(oauth_token_secret);
                }, function(error) {
                    alert("Error: " + error);
                });
	 	}
	    // END FB Login

	    // Google Plus Login
	    $scope.gplusLogin = function () {
	        //console.log('gplusLogin');
	        var myParams = {
	            // Replace client id with yours
	            'clientid': '1026812135759-8te78kmpleomk3ooup2k2h2k8d2orf83.apps.googleusercontent.com',
	            'cookiepolicy': 'single_host_origin',
	            'callback': loginCallback,
	            'approvalprompt': 'force',
	            'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read'
	        };
	        gapi.auth.signIn(myParams);

	        function loginCallback(result) {
	            if (result['status']['signed_in']) {
	                var request = gapi.client.plus.people.get({'userId': 'me'});
	                request.execute(function (resp) {
	                    console.log('Google+ Login RESPONSE: ' + angular.toJson(resp));
	                    var userEmail;
	                    if (resp['emails']) {
	                        for (var i = 0; i < resp['emails'].length; i++) {
	                            if (resp['emails'][i]['type'] == 'account') {
	                                userEmail = resp['emails'][i]['value'];
	                            }
	                        }
	                    }
	                    // store data to DB
	                    var user = {};
	                    user.Name = resp.displayName;
	                    user.Email = userEmail;
	                    if(resp.gender) {
	                        resp.gender.toString().toLowerCase() === 'male' ? user.Gender = 'M' : user.Gender = 'F';
	                    } else {
	                        user.gender = '';
	                    }
	                 
	                     user.SocialWeb = APP_CONFIG.SocialWeb.Google;
	                    user.ProfilePic = resp.image.url;
	                     security.setCurrentUser(user);
	                   // $cookieStore.put('userInfo', user);
	                   $rootScope.$broadcast('userLoggedIn');
	                    //$cookieStore.put('userInfo', user);
	                    //$state.go('dashboard');
	                });
	            }
	        }
	    };
	    // END Google Plus Login

		vm.login = function(form){
			if(form.$invalid){
				vm.showInvalid = true;
				return;
			}
			$ionicLoading.show();
			security.login(vm.userName, vm.password).then(function(res){
				$ionicLoading.hide();
				if(!res.data.IsSuccess){
					var msg = {
						Invalid_UserNamePassword: 'Invalid User Name or Password',
				        User_Not_Active: 'User not active',
				        User_LockedOut: 'User locked out'
					};
					$ionicPopup.alert({
						title: 'Login Fail',
						template: msg[res.data.FailCode]
					});
					return;
				}
				$rootScope.$broadcast('userLoggedIn');
				mergeShoppingList(res.data.UserName);
				$q.all([handleCurrentStore(res.data.User)]).then(function(){
					$ionicLoading.hide();
					GuestShoppingList.clear();					
					$ionicViewService.nextViewOptions({
						disableBack: true
					});
					if(back){
						$state.transitionTo(back, null,{
							reload: true,
							inderit: false,
							notify: true
						});
					}
					else {
						$state.transitionTo('app.home', null,{
							reload: true,
							inderit: false,
							notify: true
						});
					}
				});
				// success
				
			}, function(res){
				$ionicLoading.hide();
				//console.log(res);
			})
			
		}
		vm.register = function(){
			$state.go('app.register', {step: 1});
		}
		vm.goForgot = function(){
			$state.go('app.forgot');
		}
		MCMTracker.trackView('Login');
		
		
		//This method is executed when the user press the "Login with facebook" button
		var facebookCordovaSignIn = function() {

			facebookConnectPlugin.getLoginStatus(function(success){
				if(success.status === 'connected'){
					// the user is logged in and has authenticated your app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed request, and the time the access token
					// and signed request each expire
					console.log('getLoginStatus', success.status);
					$state.go('app.home');
					
						getFacebookProfileInfo(success.authResponse)
						.then(function(response) {
							/*responseof this example I will store user data on local storage
							UserService.setUser({
								authResponse: success.authResponse,
								userID: profileInfo.id,
								name: profileInfo.name,
								email: profileInfo.email,
								picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
							});
							*/
							//$state.go('app.home');

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
		                    user.ProfilePic = "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large";
		                    security.setCurrentUser(user);
		                    user.act = 19;//create account
		                    User.createUser(user);
		                   // $cookieStore.put('userInfo', user);
		                   $rootScope.$broadcast('userLoggedIn',APP_CONFIG.SocialWeb.Facebook);

						}, function(fail){
							//fail get profile info
							console.log('profile info fail', fail);
						});
					

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

		//this method is to get the user profile info from the facebook api
		var getFacebookProfileInfo = function (authResponse) {
			var info = $q.defer();

			facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
				function (response) {
					console.log(response);
				info.resolve(response);
				},
				function (response) {
					console.log(response);
					info.reject(response);
				}
			);
			return info.promise;
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
			  /*//for the purpose of this example I will store user data on local storage
			  UserService.setUser({
			    authResponse: authResponse,
						userID: profileInfo.id,
						name: profileInfo.name,
						email: profileInfo.email,
			    picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
			  });*/

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