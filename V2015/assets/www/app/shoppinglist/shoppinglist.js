angular.module('MCMRelationshop.ShoppingList', [
	'MCMRelationshop.Resource.ShoppingList',
	'MCMRelationshop.Sheet',
	'MCMRelationshop.Push'
])
.controller('ShoppingListCtrl', ['$q','$scope', 'security', 'ShoppingList','CheckedShoppingItem','$ionicLoading','$ionicPopup','APP_CONFIG','$Sheet','$ionicModal','MCMTracker','$ionicScrollDelegate','$timeout','phone', 'toaster',
	function($q,$scope, security, ShoppingList,CheckedShoppingItem , $ionicLoading,$ionicPopup, APP_CONFIG, $Sheet, $ionicModal,MCMTracker, $ionicScrollDelegate,$timeout, phone, toaster){
		var vm = this;
		// private properties -------------------------------------------------------------
		var userId = security.getCurrentUserId(),
			currentUser = security.getCurrentUser(),
			shoppinglist = [];
		var shoppinglistGateWay = ShoppingList.getGateway();
		// public properties -------------------------------------------------------------
		$scope.isGuest = security.isGuestMode();
		$scope.cats = null;
		$scope.notes = [];
		$scope.newNote = {
			note: ''
		};
		$scope.emailPopup =  {
			email: currentUser ? currentUser.UserEmail: ''
		};
		$scope.mode = "view";
		$scope.enableShoppingList = !security.isGuestMode();
		$scope.userShoppingListName = null;
		// scope properties -------------------------------------------------------------
		// private method -------------------------------------------------------------
		function loadData(){
			$ionicLoading.show();
			var itemReq, noteReq, reqs;
			//

			itemReq = ShoppingList.getGateway().getShoppingList(userId);		
			/*
			itemReq.then(function(res){
				var shoppingItems = res.data;
				CheckedShoppingItem.loadCheckedProperty(shoppingItems, userId);
				//console.log(shoppingItems);			
				var cats  = _.groupBy(shoppingItems, function(item){
					return item.CategoryName;
				});
				console.log(cats);
				$scope.cats = cats;
				$ionicLoading.hide();
				return res;
			});
			*/

			noteReq = ShoppingList.getGateway().getNotes(userId);
			reqs = [itemReq, noteReq];
			if(!$scope.isGuestMode){
				var getActiveInfoReq = shoppinglistGateWay.getAllShoppingList(userId).then(function(res){
					//Update user shopping list name when it has a default shopping list
					var data = res.data;
					if(data.length == 1 && _.isEqual(data[0].ShoppingListName, "Default"))
					{
						data[0].ShoppingListName = "Shopping List 1";
						var shoppinglist = {
							CS_UserShoppingListId: data[0].CS_UserShoppingListId,
							ShoppingListName: data[0].ShoppingListName,
							UserId: userId,
							IsActive: data[0].IsActive,
							CreatedDate: data[0].CreatedDate
						};
						shoppinglistGateWay.updateUserShoppingList(shoppinglist, userId).then(function(res){
						}, function(){
						});
					}
					//
					var activedShoppingList =_.find(data, {IsActive: true});
					$scope.userShoppingListName = activedShoppingList ? activedShoppingList.ShoppingListName : 'Shopping List';
				});
			}

			return $q.all(reqs).then(function(res_array){
				var items, notes;

				items = res_array[0].data || [];
				notes = res_array[1].data || [];
				_.forEach(notes, function(note){
					note.CategoryName = 'Notes';
				});
				Array.prototype.push.apply(items, notes);
				CheckedShoppingItem.loadCheckedProperty(items, userId);
				var cats  = _.groupBy(items, function(item){
					if(item.ReferenceID == null && item.ShoppingListId == 0){
						item.isCoupon = true;
					}
					return item.CategoryName;
				});
				if(_.isEmpty(cats)){
					cats.isEmpty = true;
				}
				$scope.cats = cats;

				$ionicLoading.hide();
				return res_array;
			});

		}
		function emailShoppingList(email){
			$ionicLoading.show();
			var req = ShoppingList.getGateway().emailShoppingList(email, userId).then(function(res){
				$ionicLoading.hide();
				if(res.data){
					var alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: 'Your shopping list has been sent.'
					});
				}

			});
			return req;
		}
		
		//public method -------------------------------------------------------------
		$scope.removeItem = function(item){		
			$ionicLoading.show();
			ShoppingList.getGateway().removeItem(item,userId).then(function(){
				$ionicLoading.hide();
				loadData();
			});
		};
		$scope.removeNote = function(item){
			$ionicLoading.show();
			ShoppingList.getGateway().removeNote(item.CS_ShoppingListNoteID,userId).then(function(){
				$ionicLoading.hide();
				loadData();
			});
		};
		$scope.toggle = function(item){
			if(item.checked){
				CheckedShoppingItem.uncheck(item, userId);
			}
			else{
				CheckedShoppingItem.check(item, userId);
			}
		};
		$scope.email = function(){
			if(security.isGuestMode()){
				var alertPopup = $ionicPopup.alert({
					title: APP_CONFIG.AlertTitle,
					template: 'Please log in to send your shopping list to your email.'
				});
				/*
				alertPopup.then(function(res) {
					console.log('Thank you for not eating my delicious ice cream cone');
				});
				*/

				return;
			}
			var emailPopup = $ionicPopup.show({
				template: '<input type="email" ng-model="emailPopup.email">',
				title: APP_CONFIG.AlertTitle,
				scope: $scope,
				buttons: [
				  { text: 'Cancel' },
				  {
					text: '<b>Send</b>',
					type: 'button-positive',
					onTap: function(e) {
					  if (!$scope.emailPopup.email) {
						//don't allow the user to close unless he enters wifi password
						e.preventDefault();
					  } else {
						return $scope.emailPopup.email;
					  }
					}
				  }
				]
  			});
			emailPopup.then(function(email){
				if(!email){
					return;
				}
				emailShoppingList(email);
			});

		};
		$scope.phoneData = {};
		$scope.shareShoppingList = function(){
			// An elaborate, custom popup
		    var sharePopup = $ionicPopup.show({
			    template: '<input type="tel" ng-model="phoneData.PhoneNumber" ui-mask="999-999-9999">',
			    title: 'Enter phone number to share',
			    subTitle: '',
			    scope: $scope,
			    buttons: [
			      { text: 'Cancel' },
			      {
			        text: '<b>Send</b>',
			        type: 'button-positive',
			        onTap: function(e) {
			          if (!$scope.phoneData.PhoneNumber) {
			            //Don't allow the user to close unless he enters phone number
			            e.preventDefault();
			          } else {
			            return $scope.phoneData.PhoneNumber;
			          }
			        }
			      }
			    ]
			  });
		  	sharePopup.then(function(res) {
		  		if(typeof(res) != "undefined"){
					$ionicLoading.show();
					$scope.phoneData.PhoneNumber = '';
		    		shoppinglistGateWay.sendShoppingListViaSMS(currentUser.Email, res).then(function(res){
						$ionicLoading.hide();
						if(res.data == true || res.data == 'true'){
							toaster.pop('success','Success', 'Sharing your shopping list is successful.');
						}else
						{

							toaster.pop('error','Error', 'Sharing your shopping list have an error.');
						}
		    		}, function(res){
						$ionicLoading.hide();
						toaster.pop('error','Error', 'Sharing your shopping list have an error.');

		    		});
		  		}
		  	});
		};
		$scope.addNote = function($event){
			if(!$scope.newNote.note){
				return;
			}
			$ionicLoading.show();
			return ShoppingList.getGateway().addNote($scope.newNote.note, userId).then(function(res){
				$scope.newNote.note = '';
				$timeout(function() {
					document.getElementById('note_txt').focus();
				}, 300);			
				return loadData();
			});
		}
		$scope.openAddForm = function(){
			//$scope.openModal();
			var hideSheet = $Sheet.show({
				scope: $scope,
				templateUrl: "add-note-form-modal.html",
				cancel: function() {
					// add cancel code..
					if(phone.isAndroid() && typeof(cordova)!='undefined'){
						cordova.plugins.Keyboard.hide();
					}
				},
				buttonClicked: function(index) {
					return true;
				}
			});
			
			$timeout(function() {
				document.getElementById('note_txt').focus();
				if(phone.isAndroid() && typeof(cordova)!='undefined'){
					cordova.plugins.Keyboard.show();
				}
			}, 300);
		}
		$scope.edit = function(){
			$scope.mode = 'edit';
		};
		$scope.doneEdit = function(){
			loadData().then(function(){
				$scope.mode="view";
			});
			
		};
		$scope.updateQuantity = function(item){
			if(!item.Quantity){
				return;
			}
			var i = parseInt(item.Quantity);
			if(i<=0){
				return;
			}
			
			ShoppingList.getGateway().updateItem(item, userId);
		};
		$scope.updateNoteQuantity = function(item){
			if(!item.Quantity){
				return;
			}
			var i = parseInt(item.Quantity);
			if(i<=0){
				return;
			}
			ShoppingList.getGateway().updateNote(item, userId);
		};
		$scope.deleteByCategory = function(items, type){
			var confirmPopup = $ionicPopup.confirm({
				title: APP_CONFIG.AlertTitle,
				template: 'Are you sure you want to delete all items from this category?'
		     });
			confirmPopup.then(function(resConfirm){
				if(resConfirm){
					var ids;
					if(type == 'Note'){
						ids = _.map(items, function(item){return item.CS_ShoppingListNoteID })
					}
					else {
						ids = _.map(items, function(item){return item.ShoppingListId })
					}
					$ionicLoading.show();
					ShoppingList.getGateway().removeItems(ids, type, userId).then(function(res){
						$ionicLoading.hide();
						loadData().then(function(){
							$ionicScrollDelegate.scrollTop(true);
						});
					}, function(){
						$ionicLoading.hide();
						loadData().then(function(){
							$ionicScrollDelegate.scrollTop(true);
						});
					});
				}
			});
		}
		$scope.clearAll = function(){
			var confirmPopup = $ionicPopup.confirm({
				title: APP_CONFIG.AlertTitle,
				template: 'Are you sure you want to delete all of items in this shopping list?'
		     });
			confirmPopup.then(function(resConfirm){
				if(resConfirm){
					$ionicLoading.show();
					ShoppingList.getGateway().clear(userId).then(function(res){
						$ionicLoading.hide();
						loadData().then(function(){
							$scope.mode = 'view';
							$ionicScrollDelegate.scrollTop(true);
						});				
					});
				}
			});
		}
		// Init -------------------------------------------------------------
		loadData();
		//loadActivedShoppingList();
		MCMTracker.trackView('ShoppingList');
		
	}
])
.controller('ShoppingListsCtrl', ['$scope', '$q', 'security', 'ShoppingList','APP_CONFIG', '$ionicLoading', '$ionicPopup', '$state', 'toaster',
	function($scope, $q, security, ShoppingList, APP_CONFIG, $ionicLoading, $ionicPopup, $state, toaster) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		var currentUser = security.getCurrentUser();
		var shoppinglistGateWay = ShoppingList.getGateway(),
			currentUserId = security.getCurrentUserId(),
			currentUserName = currentUser.Email;
		// public properties -------------------------------------------------------------
		$scope.shoppinglists = [];
		// scope properties -------------------------------------------------------------
		// private method -------------------------------------------------------------
		function loadData(){
			$ionicLoading.show();
			var req = shoppinglistGateWay.getAllShoppingList(currentUserId).then(function(res){
				$ionicLoading.hide();
				var data = res.data;
				$scope.shoppinglists = data;
			});
			return req;
		}
		//public method -------------------------------------------------------------
		$scope.activeShoppingList = function(shoppinglist){
			$ionicLoading.show();
			shoppinglistGateWay.activeShoppingList(shoppinglist.CS_UserShoppingListId, currentUserId).then(function(res){
				$scope.goTo('app.shoppinglist');
				$ionicLoading.hide();
			});
		}
		$scope.emailShoppingList = function(shoppinglist){
			var emailPopup = $ionicPopup.show({
				template: '<input type="email" ng-model="emailPopup.email">',
				title: APP_CONFIG.AlertTitle,
				scope: $scope,
				buttons: [
				  { text: 'Cancel' },
				  {
					text: '<b>Send</b>',
					type: 'button-positive',
					onTap: function(e) {
					  if (!$scope.emailPopup.email) {
						//don't allow the user to close unless he enters wifi password
						e.preventDefault();
					  } else {
						return $scope.emailPopup.email;
					  }
					}
				  }
				]
  			});
			emailPopup.then(function(email){
				if(!email){
					return;
				}
				$ionicLoading.show();
				var req = shoppinglistGateWay.emailShoppingList(email, userId, shoppinglist.CS_UserShoppingListId).then(function(res){
					$ionicLoading.hide();
					if(res.data){
						var alertPopup = $ionicPopup.alert({
							title: APP_CONFIG.AlertTitle,
							template: 'Your shopping list has been sent.'
						});
					}
				});
				return req;
			});
			
		};
		$scope.create = function(){
			$scope.goTo('app.createshoppinglist');
		}
		$scope.edit = function(userShoppingListId){
			$state.go('app.editshoppinglist', {id: userShoppingListId});
		};
		$scope.delete = function(userShoppingList){
			var confirmPopup = $ionicPopup.confirm({
				title: APP_CONFIG.AlertTitle,
				template: 'Are you sure you want to delete this shopping list?'
		     });
		     confirmPopup.then(function(res) {
		       if(res) {
					$ionicLoading.show();
					shoppinglistGateWay.removeUserShoppingList(userShoppingList.CS_UserShoppingListId, currentUserId).then(function(removeRes){
						$ionicLoading.hide();
						if(removeRes)
						{
							loadData();
							toaster.pop('success','Success', 'Delete your shopping list is successful.');
						}else
						{
							toaster.pop('error','Error', 'Delete your shopping list is an error.');
						}
					}, function(){
						$ionicLoading.hide();
						toaster.pop('error','Error', 'Delete your shopping list is an error.');
					});
		       }
		     });
		};
		// Init -------------------------------------------------------------
		if(!shoppinglistGateWay.getAllShoppingList){
			$scope.goTo('app.shoppinglist');
			return;
		}
		loadData();
	}
])
.controller('CreateShoppingListCtrl', ['$scope', '$q', 'security', 'ShoppingList','APP_CONFIG', '$ionicLoading', '$ionicPopup', 
	function($scope, $q, security, ShoppingList, APP_CONFIG, $ionicLoading, $ionicPopup) {
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		var shoppinglistGateWay = ShoppingList.getGateway(),
			currentUser = security.getCurrentUser();
		// public properties -------------------------------------------------------------
		$scope.shoppinglist = {
			UserId: currentUser.UserID,
			ShoppingListName: '',
			IsActive: true
		};
		// scope properties -------------------------------------------------------------
		$scope.showInvalid = false;
		// private method -------------------------------------------------------------
		var loadData = function(){
			$ionicLoading.show();
			var req = shoppinglistGateWay.getAllShoppingList(currentUser.Email).then(function(res){
				$ionicLoading.hide();
				$scope.shoppinglist.ShoppingListName = 'Shopping List ' + (res.data.length + 1);
			});
		};
		var createShoppinglist = function(){
			$ionicLoading.show();
			var createReq = shoppinglistGateWay.createShoppingList($scope.shoppinglist, security.getCurrentUserId());
			createReq.then(function(){
				$ionicLoading.hide();
				$scope.goTo('app.shoppinglist');
			});
			return createReq;

		};
		//public method -------------------------------------------------------------
		$scope.save = function(form){
			if(form.invalid){
				return;
			}
			createShoppinglist();
		}
		$scope.cancel = function(){
			$scope.goTo('app.shoppinglists');
		};
		// Init -------------------------------------------------------------
		if(!shoppinglistGateWay.getAllShoppingList){
			$scope.goTo('app.shoppinglist');
			return;
		}
		loadData();
	}
])
.controller('EditShoppingListCtrl', ['$scope', '$q', 'security', 'ShoppingList','APP_CONFIG', '$ionicLoading', '$ionicPopup', '$stateParams', '$state', 'toaster',
	function($scope, $q, security, ShoppingList, APP_CONFIG, $ionicLoading, $ionicPopup, $stateParams, $state, toaster) {
		$ionicLoading.show();
		// public properties -------------------------------------------------------------
		$scope.shoppinglist = {};
		// private properties -------------------------------------------------------------
		var currentUser = security.getCurrentUser();
		var id = $stateParams.id;
		var shoppinglistGateWay = ShoppingList.getGateway(),
		currentUserId = currentUser.UserID;
		currentUserName = currentUser.Email;
		shoppinglistGateWay.getAllShoppingList(currentUserName).then(function(res){
			_(res.data).forEach(function(item){
				if(item.CS_UserShoppingListId == id)
				{
					$scope.shoppinglist = item;
					return;
				}
			});
			$ionicLoading.hide();
		}, function(){
			$ionicLoading.hide();
		});
		// public methods -------------------------------------------------------------
		$scope.update = function(){
			$ionicLoading.show();
			var shoppinglist = {
				CS_UserShoppingListId: $scope.shoppinglist.CS_UserShoppingListId,
				ShoppingListName: $scope.shoppinglist.ShoppingListName,
				UserId: currentUserId,
				IsActive: $scope.shoppinglist.IsActive,
				CreatedDate: $scope.shoppinglist.CreatedDate
			};
			shoppinglistGateWay.updateUserShoppingList(shoppinglist, currentUserName).then(function(res){
				$ionicLoading.hide();
				if(res.data == true || res.data == 'true'){
					toaster.pop('success','Success', 'Save your shopping list is successful.');
					$scope.goTo('app.shoppinglists');
				}else
				{
					toaster.pop('error','Error', 'Save your shopping list have an error.');
				}
			}, function(){
				$ionicLoading.hide();
				toaster.pop('error','Error', 'Save your shopping list have an error.');
			});
		};
		$scope.cancel = function(){
			$scope.goTo('app.shoppinglists');
		};
	}
])
.controller('PublishShoppingListCtrl', ['$q','$scope', 'security', 'ShoppingList','CheckedShoppingItem','$ionicLoading','$ionicPopup','APP_CONFIG','$Sheet','$ionicModal','MCMTracker','$ionicScrollDelegate','$timeout','phone', '$stateParams', 
	function($q,$scope, security, ShoppingList,CheckedShoppingItem , $ionicLoading,$ionicPopup, APP_CONFIG, $Sheet, $ionicModal,MCMTracker, $ionicScrollDelegate,$timeout, phone, $stateParams){
		// private properties -------------------------------------------------------------
		var userShoppingListId = $stateParams.id;
		var sharedUserId = $stateParams.uid;
		var shoppinglistGateWay = ShoppingList.getGateway();
		var userId = security.getCurrentUserId();
		// public properties -------------------------------------------------------------
		$scope.cats = null;
		$scope.notes = [];
		$scope.newNote = {
			note: ''
		};
		// scope properties -------------------------------------------------------------
		// private method -------------------------------------------------------------
		function loadData(){
			$ionicLoading.show();
			var itemReq, noteReq, reqs;
			//
			itemReq = ShoppingList.getGateway().getShoppingListByUSLId(sharedUserId, userShoppingListId);
			noteReq = ShoppingList.getGateway().getNotesByUSLId(sharedUserId, userShoppingListId);
			reqs = [itemReq, noteReq];
			return $q.all(reqs).then(function(res_array){
				var items, notes;

				items = res_array[0].data || [];
				notes = res_array[1].data || [];
				_.forEach(notes, function(note){
					note.CategoryName = 'Notes';
				});
				Array.prototype.push.apply(items, notes);
				CheckedShoppingItem.loadCheckedProperty(items, userId);
				var cats  = _.groupBy(items, function(item){
					if(item.ReferenceID == null && item.ShoppingListId == 0){
						item.isCoupon = true;
					}
					return item.CategoryName;
				});
				if(_.isEmpty(cats)){
					cats.isEmpty = true;
				}
				$scope.cats = cats;

				$ionicLoading.hide();
				return res_array;
			});
		};
		//public method -------------------------------------------------------------------------------
		$scope.toggle = function(item){
			if(item.checked){
				CheckedShoppingItem.uncheck(item, userId);
			}
			else{
				CheckedShoppingItem.check(item, userId);
			}
		};
		// Init -------------------------------------------------------------
		loadData();
		//loadActivedShoppingList();
		MCMTracker.trackView('ShoppingList');
		
	}
]);