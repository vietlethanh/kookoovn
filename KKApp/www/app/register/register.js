angular.module('MCMRelationshop.Register', [
	'MCMRelationshop.Resource.User',
	'MCMRelationshop.Resource.Setting',
	'MCMRelationshop.Directive.PasswordMatch',
	'MCMRelationshop.Directive.FormDirective',
	'MCMRelationshop.Directive.Compile'
])
.controller('RegisterCtrl', ['$q', '$rootScope', '$scope','$state', '$stateParams', 'AppUtil','CacheUtil','User','Setting', '$ionicLoading','$ionicPopup','APP_CONFIG','security','MCMTracker','toaster','$ionicViewService', '$ionicScrollDelegate', 'GuestShoppingList', 'UserShoppingList',
	function($q, $rootScope, $scope, $state, $stateParams ,AppUtil, CacheUtil, User, Setting, $ionicLoading,$ionicPopup, APP_CONFIG, security, MCMTracker, toaster, $ionicViewService, $ionicScrollDelegate, GuestShoppingList, UserShoppingList) {
		// private properties -------------------------------------------------------------
		var back = $stateParams.return;
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.cfg = APP_CONFIG;
		$scope.e_msges = {};
		$scope.step = $stateParams.step;
		$scope.backToconfirm = $stateParams.back;
		$scope.viewTitle = $scope.step == 4 ? 'Confirm Info' : 'Create Account';
		$scope.chooseStore = CacheUtil.getAppCache().get('/register/store');
		$scope.states = AppUtil.getStateList();
		$scope.user = CacheUtil.getAppCache().get('/register/user') || {
			isReceiveCard: true,
			Email: '',
			UserEmail: '',
			Password: '',
			FirstName: '',
			MiddleName: '',
			LastName: '',
			Address: '',
			City: '',
			State: 'TX',
			ZipCode: '',
			Phone: '',
			CellPhone: '',
			SecondaryCellPhone: '',
			StoreID: $scope.chooseStore?$scope.chooseStore.CS_StoreID:null,
			SRCardID: '',
			LoyaltyAutoEnroll: true,
			ReceiveEmail: true,
			ReceiveTextMessage: false,
			ExternalCustomerCardID: ''
		};
		$scope.logInModel = {
			UserName: '',
			Password: ''
		};
		$scope.showInvalid = true;
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
		$scope.emailRegx = /^[\w.\-]+@[a-zA-Z_.\-]+?\.[a-zA-Z]{2,3}$/;
		$scope.passwordRegx =/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,12}$/;
		
		$scope.user.StoreID = $scope.chooseStore?$scope.chooseStore.CS_StoreID:null;
		// private method -------------------------------------------------------------
		$scope.$watch('user.ZipCode', function(){
			if(!$scope.user.ZipCode) return;
			$scope.user.ZipCode = $scope.user.ZipCode.replace(/\D/gi, '');
		});
		//public method -------------------------------------------------------------
		$scope.cancel = function(){
			$scope.step = 1;
			goStep($scope.step);
		};
		$scope.goBack = function(){
			if(($scope.backToconfirm && $scope.step != 4) || ($scope.backToconfirm == 'true' && $scope.step != 4))
			{
				$scope.step = 4;
				goStep($scope.step);
				$scope.backToconfirm = false;
				return;
			}
			$scope.step -= 1;
			goStep($scope.step);			
		};
		$scope.next = function(form){
			$ionicLoading.show();
			var onSuccess = function(res){
				var data = res.data;
				var code = data.Code;
				if(data.MatchedUser == null || code == null)
				{
					var promiseEmail = User.searchUsersByField('email', $scope.UserEmail).then(function(res){
						var deferred = $q.defer();
						if(res.data.Users != null && res.data.Users.length > 0){
							deferred.resolve({ emailExists: true });
							form.email.$setValidity('server',false);
							$scope.e_msges['email'] = "This email has existed";
						}
						deferred.resolve({ emailExists: false });
						return deferred.promise;
					}, function(res){
						deferred.resolve({ emailExists: true });
						form.email.$setValidity('server',false);
						$scope.e_msges['email'] = "This email has existed";
					});
					var promisePhone = User.searchUsersByField('phone', $scope.Phone).then(function(res){
						var deferred = $q.defer();
						if(res.data.Users != null && res.data.Users.length > 0){
							deferred.resolve({ phoneExists: true });
							form.email.$setValidity('server',false);
							$scope.e_msges['phone'] = "This phone number has existed";
						}
						deferred.resolve({ phoneExists: false });
						return deferred.promise;
					}, function(res){
						deferred.resolve({ phoneExists: true });
						form.email.$setValidity('server',false);
						$scope.e_msges['phone'] = "This phone number has existed";
					});
					promiseEmail.then(function(promiseEmailRes){
						if(!promiseEmailRes.emailExists)
						{
							promisePhone.then(function(promisePhoneRes){
								if(!promiseEmailRes.emailExists)
								{
									CacheUtil.getAppCache().put('/register/user', $scope.user);
									$scope.step = 2;
									goStep($scope.step);
								}
							});
						}
					});
					$ionicLoading.hide();
					return;
				}
				$ionicLoading.hide();
				if(APP_CONFIG[code] == 0)
				{
					$scope.messages = AppUtil.convertLink(data.Message);
					$scope.logInModel.UserName = data.MatchedUser[0].Email;
					$scope.logInModel.Password = '';
					$scope.step = 6;//Go to sign in screen
					goStep($scope.step);
				}else
				if(APP_CONFIG[code] == 1)
				{
					$scope.messages = AppUtil.convertLink(data.Message);
					$scope.users = data.MatchedUser;
					$scope.step = 5;//Go to select accounts screen to sign in
					goStep($scope.step);
				}else
				if(APP_CONFIG[code] == 2){
					//
					$scope.user = data.MatchedUser[0]; //fill data to object user
					CacheUtil.getAppCache().put('/register/user', $scope.user);
					$scope.step = 2;
					goStep($scope.step);
				}
				else
				if(APP_CONFIG[code] == 3){
					//
					$scope.messages = AppUtil.convertLink(data.Message);
					$scope.users = [];
					$scope.step = 5;//
					goStep($scope.step);
				}
			};
			var onFail = function(res){
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: 'The system has an error. Please try again or click <a href="#/app/support" style="font-weight: bold; text-decoration: underline;">here<a> to contact customer support.'
				});
				$ionicLoading.hide();
			};
			User.validateUser($scope.user.UserEmail, $scope.user.Phone, $scope.user.FirstName, $scope.user.LastName, '').then(onSuccess, onFail);
		};
		$scope.saveProfile = function(form){
			$ionicLoading.show();
			User.checkUserExists($scope.user.Email).then(function(res){
				$ionicLoading.hide();
				if(res.data != null && (res.data + '') == 'true') {
					form.username.$setValidity('server',false);
					$scope.e_msges['username'] = "This User Name already has a rewards account";
					$ionicLoading.hide();
					$ionicScrollDelegate.scrollTop();
					return;
				 }//User exists.
				//User is not existed.
				CacheUtil.getAppCache().put('/register/user', $scope.user);
				$scope.step = 3;
				goStep($scope.step);	
			}, function(res){
				$ionicLoading.hide();
				// show not found error
				form.username.$setValidity('server',false);
				$scope.e_msges['username'] = "This User Name is invalid";
			});		
		};
		$scope.saveCommunications = function(){
			//
			CacheUtil.getAppCache().put('/register/user', $scope.user);
			$scope.step = 4;
			$scope.viewTitle = 'Confirm Info';
			goStep($scope.step);			
		};
		$scope.selectStore = function(){
			CacheUtil.getAppCache().put('/register/user', $scope.user);
			$state.go('app.registerstore');
		};
		$scope.create = function(form){
			$scope.showInvalid = true;
			// check password
			var pvalid = $scope.passwordRegx.test($scope.user.Password);
			if(!pvalid){
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: "Password must be 6-12 characters long and include at least one letter and one number. Passwords are case sensitive."
				});
				return;
			}
			if(form.$invalid){
				return;
			}
			// check confirm user
			$ionicLoading.show();
			var onSuccess = function(res){
				if(!res.data){
					$ionicLoading.hide();
					return;
				}
				if(!$scope.chooseStore.Loyalty){
					Setting.getSetting('STORE_MESSAGE_LOYALTY').then(function(res){
						$ionicLoading.hide();
						$ionicPopup.alert({
							title: APP_CONFIG.AlertTitle,
							template: res.data
						});
					});
				}
				// login
				$ionicLoading.show();
				toaster.pop('success','Success', 'Thank you for creating an account.')
				security.login($scope.user.Email, $scope.user.Password).then(function(res){
					$ionicLoading.hide();
					if(!res.data.IsSuccess){
						$ionicPopup.alert({
							title: APP_CONFIG.AlertTitle,
							template: res.data.FailCode
						});
					}
					// success
					$ionicViewService.nextViewOptions({
						disableBack: true
					});

					if(back){
						$state.transitionTo(back);
					}
					else {
						$state.transitionTo('app.home', null,{
							reload: true,
							inherit: false,
							notify: true
						});
					}
				}, function(res){
					$ionicLoading.hide();
				})
			};//on Success
			var onFail = function(res){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: res.data.Message
				});
			}
			if($scope.user.SRCardID != '')
			{
				$scope.user.LoyaltyAutoEnroll = false;
			}
			$scope.user.StoreID = $scope.user.StoreID+'';
			User.createUser($scope.user).then(onSuccess, onFail);
		};
		$scope.edit = function(stepNumber){
    		$ionicScrollDelegate.scrollTop();
			$state.go('app.register', {step: stepNumber, back: true}, { reload: true });
		};
		$scope.goToLogin = function(user){
			$ionicLoading.show();
			//Validation just only one for matching accounts.
			User.validateUser($scope.user.UserEmail, $scope.user.Phone, $scope.user.FirstName, $scope.user.LastName, user.Email).then(function(res){
				var data = res.data;
				$scope.messages = AppUtil.convertLink(data.Message);
				$scope.step = 6;//Go to login screen
				$scope.logInModel.UserName = user.Email;
				$scope.logInModel.Password = '';
				goStep($scope.step);
				$ionicLoading.hide();
			}, function(res){
				$ionicLoading.hide();
			});
		};
		$scope.signIn = function(form){
			if(form.$invalid){
				$scope.showInvalid = true;
				return;
			}
			$ionicLoading.show();
			security.login($scope.logInModel.UserName, $scope.logInModel.Password).then(function(res){
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
				$q.all([handleCurrentStore(res.data.User), mergeShoppingList(res.data.UserName)]).then(function(){
					$ionicLoading.hide();
					GuestShoppingList.clear();					
					// $ionicViewService.nextViewOptions({
					// 	disableBack: true
					// });
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
			})
		};
		//Private method -------------------------------------------------------------
		var goStep = function(stepNumber){
    		$ionicScrollDelegate.scrollTop();
			$state.go('app.register', {step: stepNumber}, { 
		      reload: true, inherit: false, notify: false 
		    });
		};
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
							text: user.StoreName,
    						type: 'button-positive',
    						onTap: function(){
    							security.setCurrentStore({CS_StoreID: userStoreId});
    							deferred.resolve(true);
    						}
						},
						{
							text: currentStore.StoreName + ' ' +currentStore.StoreID,
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
		// Init -------------------------------------------------------------
		MCMTracker.trackView('Register');
	}
])
.controller('RegisterCardCtrl', ['$scope','$state', '$stateParams', 'AppUtil','CacheUtil','User','$ionicLoading','$ionicPopup','APP_CONFIG','security','MCMTracker','toaster','$ionicViewService',
	function($scope, $state, $stateParams ,AppUtil, CacheUtil, User,$ionicLoading,$ionicPopup, APP_CONFIG, security, MCMTracker, toaster, $ionicViewService) {  
		// private properties -------------------------------------------------------------
		var back = $stateParams.return,
			currentUser = angular.copy(security.getCurrentUser());
		// transfer currentUSer to user m
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.states = AppUtil.getStateList();

		$scope.user = currentUser;
		
		$scope.zipcodeRegx = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

		$scope.emailRegx = /^\w+.*@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
		// private method -------------------------------------------------------------
		$scope.$watch('user.Phone', function(){
			if(!$scope.user.Phone) return;
			$scope.user.Phone = $scope.user.Phone.replace(/\D/gi, '');
			// check min length
			var form = $scope.$$childHead.registerForm;
			if(form && form['phone']){
				if( $scope.user.Phone.length != 10){
					form['phone'].$setValidity('format', false);
				}
				else {
					form['phone'].$setValidity('format', true);
				}
			}
		});
		$scope.$watch('user.CellPhone', function(newvalue, oldvalue){
			if(!$scope.user.CellPhone) return;
			$scope.user.CellPhone = $scope.user.CellPhone.replace(/\D/gi, '');
			// check min length
			var form = $scope.$$childHead.registerForm;
			if(form && form['cellphone']){
				if( $scope.user.CellPhone.length != 10){
					form['cellphone'].$setValidity('format', false);
				}
				else {
					form['cellphone'].$setValidity('format', true);
				}
			}
			
		});
		//public method -------------------------------------------------------------
		
		$scope.create = function(form){
			$scope.showInvalid = true;
			// check password
			if(form.$invalid){
				return;
			}
			// check confirm user
			$ionicLoading.show();
			var onFail = function(res){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: res.data.Message
				});
			};
			var onUpdateSuccess = function(res){
				if(!res.data){
					$ionicLoading.hide();
					return;
				}				
				return User.createCard($scope.user.Email).then(function(sres){
					if(!sres.data){
						$ionicLoading.hide();
						return;
					}
					$ionicLoading.hide();
					// success
					$ionicViewService.nextViewOptions({
						disableBack: true
					});

					if(back){
						$state.transitionTo(back, null,{
							reload: true,
							inherit: false,
							notify: true
						});
					}
					else {
						$state.transitionTo('app.home', null,{
							reload: true,
							inherit: false,
							notify: true
						});
					}

				}, onFail);			
			};//on Success
			User.updateUser($scope.user).then(onUpdateSuccess, onFail);
		}
		// Init -------------------------------------------------------------
		MCMTracker.trackView('RegisterCard');
	}
]);