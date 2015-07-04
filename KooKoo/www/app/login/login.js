angular.module('MCMRelationshop.Login', [
	'security',
	'MCMRelationshop.Resource.ShoppingList',
	'ipCookie',
	'ngCordovaOauth'
	
])
.controller('LoginCtrl', ['$rootScope','$scope', '$state', '$stateParams','ipCookie', 'security','$ionicLoading','$ionicPopup','MCMTracker','APP_CONFIG','$q','GuestShoppingList','UserShoppingList','$ionicViewService','ngFB','$cordovaOauth',
	function($rootScope, $scope, $state, $stateParams, ipCookie, security, $ionicLoading,$ionicPopup,MCMTracker,APP_CONFIG, $q, GuestShoppingList, UserShoppingList, $ionicViewService,ngFB,$cordovaOauth) { 

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
	                    user.name = response.name;
	                    user.email = response.email;
	                    if(response.gender) {
	                        response.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
	                    } else {
	                        user.gender = '';
	                    }
	                    user.profilePic = picResponse.data.url;
	                    $cookieStore.put('userInfo', user);
	                    $state.go('dashboard');

	                });
	            });
	        }
	    };
	    $scope.googleLogin = function() {
	        $cordovaOauth.google("1026812135759-eikn3a5n8qut3du9ujov51onc3p8h68a.apps.googleusercontent.com", ["https://www.googleapis.com/auth/urlshortener", "https://www.googleapis.com/auth/userinfo.email"]).then(function(result) {
	            console.log(JSON.stringify(result));
	        }, function(error) {
	        	console.log('Error googleLogin');
	            console.log(error);
	        });
    	}
    	$scope.facebooklogin = function() {
	        $cordovaOauth.facebook("117244345278368", ["email", "read_stream", "user_website", "user_location", "user_relationships"]).then(function(result) {
	            //$localStorage.accessToken = result.access_token;
	            //$location.path("/profile");
	             console.log(JSON.stringify(result));
	        }, function(error) {
	            alert("There was a problem signing in!  See the console for logs");
	            console.log(error);
	        });
	    };
	    $scope.twitterlogin = function() {
	    	alert("Click twitterlogin");
	    	try
	    	{
				$cordovaOauth.twitter("5Z9AGmXCunGKxt3iq3dexDGzu", "zYMfsOWXYSgSQwb1m6ybWq5cfU0h1vi0668XMl0i0d80ZVcQQO").then(function(result) {
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
	    	}
	    	catch
	    	{
				alert("catch Click twitterlogin");
	    	}
	     
	    // END FB Login

	    // Google Plus Login
	    $scope.gplusLogin = function () {

	        console.log('gplusLogin');
	        var myParams = {
	            // Replace client id with yours
	            'clientid': '18301237550-3vlqoed2en4lvq6uuhh88o2h1l9m70tr.apps.googleusercontent.com',
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
	                    user.name = resp.displayName;
	                    user.email = userEmail;
	                    if(resp.gender) {
	                        resp.gender.toString().toLowerCase() === 'male' ? user.gender = 'M' : user.gender = 'F';
	                    } else {
	                        user.gender = '';
	                    }
	                    user.profilePic = resp.image.url;
	                    $cookieStore.put('userInfo', user);
	                    $state.go('dashboard');
	                });
	            }
	        }
	    };
	    // END Google Plus Login

		$scope.fbLogin = function () {
		    ngFB.login({scope: 'email,read_stream,publish_actions'}).then(
		        function (response) {
		            if (response.status === 'connected') {

				            security.setCurrentUser(
				            	{
				            		SocialWeb:APP_CONFIG.SocialWeb.Facebook
				            	}
		            		);
		            	
		            	console.log('Facebook login succeeded');
		            	console.log(response);
						$rootScope.$broadcast('userLoggedIn',APP_CONFIG.SocialWeb.Facebook);
		                //console.log('Facebook login succeeded');
		                //$scope.closeLogin();
		            } else {
		                alert('Facebook login failed');
		            }
		        });
		};
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
	}
])