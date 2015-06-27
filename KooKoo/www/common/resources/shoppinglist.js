angular.module('MCMRelationshop.Resource.ShoppingList', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory',
	'security'
])
.factory('GuestShoppingList', ['$q','CacheUtil','AppUtil', 'HttpUtil', '$http',
	function($q, CacheUtil, AppUtil, HttpUtil, $http){
		var r = {
			cache: CacheUtil.getGuestCache(),
			userid: 'guest',
			enableMultiShoppingLists: false,
			_getShoppingList: function(userid){
				var items = this.cache.get('/shoppinglists/'+this.userid+'/items') || [];
				return items;
			},
			getShoppingList: function(userid){			
				var deferred = $q.defer();
				var items = this._getShoppingList(userid);
				deferred.resolve({data:items});
				return deferred.promise;
			},
			getShoppingListByUSLId: function(userid, userShoppingListId){
				var opts = HttpUtil.opts();
				return $http.get('/shoppinglists/published-items?userid=' + userid + '&userShoppinglistID=' + userShoppingListId, opts);
			},
			getNotesByUSLId: function(userid, userShoppingListId){
				var opts = HttpUtil.opts();
				return $http.get('/shoppinglists/published-notes?userid=' + userid + '&userShoppingListId=' + userShoppingListId, opts);
			},
			updateShoppingList: function(shoppingList){
				this.cache.put('/shoppinglists/'+this.userid+'/items', shoppingList);			
			},
			_saleItem2ShoppingItem: function(saleitem){
				var shoppingItem = {
					CategoryName: saleitem.CategoryName,
					ImageURL: saleitem.ImageUrl,
					ItemPrice: saleitem.Price,
					ProductDesc: saleitem.Description,
					ProductId: saleitem.CS_BoxID,
					ProductName: saleitem.Name,
					Quantity: 1,
					ReferenceID: null,
					ShoppingListId: AppUtil.generateID(), // need generate id

				}
				return shoppingItem

			},
			_ingredient2ShoppingItem: function(ingredient, recipeId){
				var shoppingItem = {
					CategoryName: 'Ingredients',
					ImageURL: ingredient.ImageUrl,
					ItemPrice: '',
					ProductDesc: '',
					ProductId: '',
					ProductName: ingredient.ItemName,
					Quantity: 1,
					ReferenceID: recipeId,
					ShoppingListId: AppUtil.generateID(), // need generate id
				}
				return shoppingItem

			},
			_note2ShoppingItem: function(note){
				var note = {
					'Note': note,
					'CS_ShoppingListNoteID': AppUtil.generateID(),
					'UserName': 'guest',
					'Quantity': note.Quantity || 1
				}
				
				return note

			},
			addItem: function(item, userid){
				var deferred, shoppinglist, shoppingitem;
				deferred= $q.defer();
				shoppinglist = this._getShoppingList(userid);
				// check item is exist in shopping list
				shopingItem = _.find(shoppinglist, { 'ProductId': item.CS_BoxID});
				if(shopingItem){
					shopingItem.Quantity = ++shopingItem.Quantity;
				}
				else{
					shoppinglist.push(this._saleItem2ShoppingItem(item));
					
				}
				this.updateShoppingList(shoppinglist);
				deferred.resolve({data: true});
				return deferred.promise;
			},
			addIngredients: function(recipeId, ingredients, userid){
				var deferred, shoppinglist, shoppingitem, self;
				self = this;
				deferred= $q.defer();
				shoppinglist = this._getShoppingList(userid);
				_.forEach(ingredients, function(ingredient){
					shoppingItem = _.find(shoppinglist, { 'ProductName': ingredient.ItemName});
					if(shoppingitem){
						shoppingitem.Quantity = ++shoppingitem.Quantity;					
					}
					else{
						shoppinglist.push(self._ingredient2ShoppingItem(ingredient, recipeId));
					}
				});
				this.updateShoppingList(shoppinglist);
				deferred.resolve({data: true});
				return deferred.promise;
			},
			updateItem: function(sitem, userid){
				var deferred, shoppinglist, shoppingitem;
				deferred= $q.defer();
				shoppinglist = this._getShoppingList(this.userid);
				shoppingItem = _.find(shoppinglist, { 'ShoppingListId': sitem.ShoppingListId});
				if(!shoppingItem){
					deferred.reject({data: {message: 'Not found'}})
				}
				else{
					shoppingItem.Quantity = sitem.Quantity;
					this.updateShoppingList(shoppinglist);
					deferred.resolve({data: true});
				}
				return deferred.promise;
			},
			removeItem: function(sitem){
				var deferred, shoppinglist, shoppingitem;
				deferred= $q.defer();
				shoppinglist = this._getShoppingList(this.userid);
				shoppingItem = _.remove(shoppinglist, { 'ShoppingListId': sitem.ShoppingListId});
				this.updateShoppingList(shoppinglist);
				deferred.resolve({data: true});
				return deferred.promise;
			},
			_getNotes: function(){
				var items = this.cache.get('/shoppinglists/'+this.userid+'/notes') || [];
				return items;
			},
			updateNotes: function(notes){
				this.cache.put('/shoppinglists/'+this.userid+'/notes', notes);
			},
			getNotes: function(userid){
				var deferred = $q.defer();
				var items = this._getNotes(userid);
				deferred.resolve({data:items});
				return deferred.promise;
			},
			addNote: function(note, userid){
				var deferred, notes;
				deferred= $q.defer();
				notes = this._getNotes(userid);
				notes.push(this._note2ShoppingItem(note));
				this.updateNotes(notes);
				deferred.resolve({data: true});
				return deferred.promise;
			},
			updateNote: function(note, userid){
				var deferred, notes, note;
				deferred= $q.defer();
				notes = this._getNotes(this.userid);
				note = _.find(notes, { 'CS_ShoppingListNoteID': note.CS_ShoppingListNoteID});
				if(!note){
					deferred.reject({data: {message: 'Not found'}})
				}
				else{
					note.Quantity = note.Quantity;
					this.updateNotes(notes);
					deferred.resolve({data: true});
				}
				return deferred.promise;
			},
			removeNote: function(id, userid){
				var deferred, notes, note;
				deferred= $q.defer();
				notes = this._getNotes(this.userid);
				note = _.remove(notes, { 'CS_ShoppingListNoteID': id});
				this.updateNotes(notes);
				deferred.resolve({data: true});
				return deferred.promise;
			},
			clear: function(userid){
				var deferred;
				deferred = $q.defer();
				this.cache.remove('/shoppinglists/'+this.userid+'/items');
				this.cache.remove('/shoppinglists/'+this.userid+'/notes');
				deferred.resolve({data:true});
				return deferred.promise;
			},
			/**
			@pram type (Item, Note)
			**/
			removeItems: function(itemIds, type, userid){
				var deferred, shoppinglist, notes;
				deferred= $q.defer();
				if(type=='Note'){
					notes = this._getNotes(this.userid);
					_.forEach(itemIds, function(id){
						note = _.remove(notes, { 'CS_ShoppingListNoteID': id});
					});
					this.updateNotes(notes);
				}
				else{
					shoppinglist = this._getShoppingList(this.userid);
					_.forEach(itemIds, function(sitemId){
						 _.remove(shoppinglist, { 'ShoppingListId': sitemId});
					});
					this.updateShoppingList(shoppinglist);
				}
				
				deferred.resolve({data: true});
				return deferred.promise;
			},
			prepareData: function(userid){
				var items, notes, data;
				data = []; 
				items = this._getShoppingList();
				notes = this._getNotes();
				_.forEach(items, function(item){
					var o;
					if(item.CategoryName == 'Ingredients'){
						o = {
							Id: item.ProductName,
							Name: item.ProductName,
							MergeType: 'Ingredients',
							Quantity: item.Quantity,
							userName: userid,
							ReferenceId: item.ReferenceID
						}
					}
					else {
						o = {
							Id: item.ProductId,
							Name: item.ProductName,
							MergeType: 'SaleItems',
							Quantity: item.Quantity,
							UserName: userid
						}
					}
					data.push(o);
				});

				_.forEach(notes, function(note){
					data.push({
						Id: 0,
						MergeType: 'Notes',
						Name: note.Note,
						Quantity: note.Quantity,
						UserName: userid
					})
				})
				return data;

			}
		}
		return r;
	}

])
.factory('UserShoppingList', ['$http', 'HttpUtil', 'CacheUtil',
	function($http, HttpUtil, CacheUtil){
		var r  = {
			enableMultiShoppingLists: true,
			getShoppingList: function(userid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/shoppinglists/user-items?username='+userid, opts)
			},
			addItem: function(item, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-items?username='+userid]
				})				
				return $http.post('/shoppinglists/'+userid+'/item',{
					ProductID: item.CS_BoxID,
					ProductName: item.Name,
					UserName: userid
				}, opts);
			},
			addIngredients: function(recipeId, ingredients, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-items?username='+userid]
				});				
				return $http.post('/shoppinglists/add-ingredients?username='+userid,{
					RecipeID: recipeId,
					IngredientsList: _.map(ingredients, function(ingredient){return ingredient.ItemName;}).join('<ING>')
				},opts)
			},
			updateItem: function(sitem, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-items?username='+userid]
				});

				return $http.put('/shoppinglists/'+sitem.UserName+'/itemquantity', {
					ShoppingListId: sitem.ShoppingListId, 
					Quantity: sitem.Quantity
				}, opts)	
			},
			removeItem: function(item, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-items?username='+userid],
					data: {ItemID: item.ShoppingListId+''}
				});
				return $http.delete('/shoppinglists/remove-item?username='+userid, opts);
			},
			emailShoppingList: function(email, userid){
				var opts = HttpUtil.opts();
				return $http.post('/shoppinglists/send-email?username='+userid, '"'+email+'"', opts);
			},
			getNotes: function(userid){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/shoppinglists/user-notes?username='+userid, opts);
			},
			addNote: function(note, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-notes?username='+userid]
				});
				return $http.post('/shoppinglists/'+userid+'/note', {Note: note, Quantity: 1}, opts);
			},
			updateNote: function(note, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-notes?username='+userid]
				});
				return $http.put('/shoppinglists/update-note?username='+userid, {
					ShoppingListNoteID: note.CS_ShoppingListNoteID,
					Note: note.Note,
					Quantity: note.Quantity
				}, opts);
			},
			removeNote: function(id, userid){
				var opts = HttpUtil.opts({
					url: '/shoppinglists/remove-note?username='+userid,
					method: 'DELETE',
					clearCache: ['/shoppinglists/user-notes?username='+userid],
					data: {CS_ShoppingListNoteID: id, UserName: userid}
				});
				return $http(opts);
			},
			clear: function(userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-notes?username='+userid, '/shoppinglists/user-items?username='+userid]
				});
				return $http.delete('/shoppinglists/remove-items?username='+userid, opts);
			},
			merge: function(items,userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-notes?username='+userid, '/shoppinglists/user-items?username='+userid]
				});
				return $http.post('/shoppinglists/merge-guest?username='+userid, items, opts);
			},
			/**
			@pram type (Item, Note)
			**/
			removeItems: function(items, type, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/user-notes?username='+userid, '/shoppinglists/user-items?username='+userid],
					data: items
				});
				return $http.delete('/shoppinglists/remove-items/'+type, opts);
			},
			getAllShoppingList: function(username){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/shoppinglists/all?username='+username, opts);
			},
			createShoppingList: function(shoppinglist, userid){
				var opts = HttpUtil.opts({
					clearCache: [
						'/shoppinglists/all?username='+userid,
						'/shoppinglists/user-items?username='+userid,
						'/shoppinglists/user-notes?username='+userid,
					]
				});
				return $http.post('/shoppinglists', shoppinglist, opts);
			},
			activeShoppingList: function(shoppinglistId, userid){
				var opts = HttpUtil.opts({
					clearCache: [
						'/shoppinglists/user-items?username='+userid,
						'/shoppinglists/user-notes?username='+userid,
						'/shoppinglists/all?username=' + userid
					]
				});
				return $http.post('/shoppinglists/'+shoppinglistId+'/Active', {}, opts);
			},
			updateUserShoppingList: function(shoppinglist, userid){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/all?username=' + userid]
				});
				return $http.post('/ShoppingLists/update', shoppinglist, opts);
			},
			removeUserShoppingList: function(userShoppingListId, username){
				var opts = HttpUtil.opts({
					clearCache: ['/shoppinglists/all?username=' + username]
				});
				return $http.delete('/shoppinglists/' + userShoppingListId + '?username=' + username, opts);
			},
			sendShoppingListViaSMS: function(username, phone){
				var opts = HttpUtil.opts();
				return $http.post('/shoppinglists/send-sms?username=' + username + '&phone=' + phone, {}, opts);
			},
			getShoppingListByUSLId: function(userid, userShoppingListId){
				var opts = HttpUtil.opts();
				return $http.get('/shoppinglists/published-items?userid=' + userid + '&userShoppinglistID=' + userShoppingListId, opts);
			},
			getNotesByUSLId: function(userid, userShoppingListId){
				var opts = HttpUtil.opts();
				return $http.get('/shoppinglists/published-notes?userid=' + userid + '&userShoppingListId=' + userShoppingListId, opts);
			}
		}
		return r;
	}
])
.factory('CheckedShoppingItem', ['$q', 'CacheUtil',
	function($q, CacheUtil){
		var r  = {
			cache: CacheUtil.getOfflineHttpCache(),
			updateCheckedItems: function(checkedItems, userid){
				var key = '/shoppinglist/'+userid+'/checked';
				this.cache.put(key, checkedItems);
			},
			getCheckedItems: function(userid){
				var key = '/shoppinglist/'+userid+'/checked';
				return this.cache.get(key)||[];

			},
			check: function(item, userid){
				var checkeditems = this.getCheckedItems(userid);
				
				var checkedItem = _.find(checkeditems,function(shoppinglistId){
					return shoppinglistId == item.ShoppingListId || shoppinglistId ==  'n_'+item.CS_ShoppingListNoteID || shoppinglistId == 'c_'+item.ProductId;
				});
				item.checked = true;
				if(checkedItem){
					return true;
				}
				checkeditems.push(item.ShoppingListId || ( item.CS_ShoppingListNoteID ? 'n_'+item.CS_ShoppingListNoteID:'c_'+item.ProductId));
				var limitLength = 1000;
				if(checkeditems.length > limitLength){
					checkeditems = checkeditems.slice(checkeditems.length-limitLength, checkeditems.length);
				}
				this.updateCheckedItems(checkeditems, userid);
				return true;
			},
			uncheck: function(item, userid){
				var checkeditems = this.getCheckedItems(userid);
				_.remove(checkeditems, function(shoppinglistId){
					return shoppinglistId == item.ShoppingListId || shoppinglistId ==  'n_'+item.CS_ShoppingListNoteID || shoppinglistId == 'c_'+item.ProductId;
				});
				item.checked = false;
				this.updateCheckedItems(checkeditems, userid);
				return true;
			},
			loadCheckedProperty: function(shoppinglist, userid){
				var checkedIds = this.getCheckedItems(userid),
					newchekedIds = _.clone(checkedIds);
				// load and clean
				_.forEach(checkedIds, function(checkedId){
					var shoppingItem = _.find(shoppinglist, function(sItem){
						return sItem.ShoppingListId == checkedId || checkedId ==  'n_'+sItem.CS_ShoppingListNoteID || checkedId == 'c_'+sItem.ProductId;
					});
					if(shoppingItem){
						shoppingItem.checked = true;
					}
					// clean checked item
					else{
						_.remove(newchekedIds, function(c){
							return c == checkedId;
						})
					}
				});
				this.updateCheckedItems(newchekedIds, userid);
			}

		}
		return r;
	}
])
.factory('ShoppingList', ['security','AppUtil','UserShoppingList','GuestShoppingList', 
	function(security, AppUtil, UserShoppingList,GuestShoppingList){
		var s  = {
			getGateway: function(){
				// guest
				if(security.isGuestMode()){
					return GuestShoppingList;
				}
				return UserShoppingList;
			}
		} 
		return s;
	}
]);