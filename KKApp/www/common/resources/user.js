angular.module('KooKoo.Resource.User', [
	'KooKoo.Utils',
	'angular-data.DSCacheFactory',
	'KooKoo.Config',
])
.factory('User', ['$http','HttpUtil','CacheUtil','APP_CONFIG',
	function($http, HttpUtil, CacheUtil,APP_CONFIG){
		var r = {
			getUser: function(userid, clearCache){
				if(clearCache){
					CacheUtil.clearKey(['/users?un='+userid]);
				}
				var opts = HttpUtil.opts({
					cache: true
				});
				return $http.get('/users?un='+userid, opts);
			},
			updatePassword: function(uid, opwd, npwd){
				var opts = HttpUtil.opts();
				opts.secure = true;
				return $http.put('/users/password',{
					Email: uid,
					OldPassword: opwd,
					NewPassword: npwd
				}, opts);	
			},
			updateUser: function(user){
				var opts = HttpUtil.opts({
					clearCache: ['/users/'+user.UserID,'/users?un='+user.Email]
				});
				return $http.put('/users/'+user.UserID, user, opts);
			},
			createUser: function(user){
				var opts = HttpUtil.opts();
				//opts.secure = true;
				opts.intercetorParams= {api: false};
				return $http.post( APP_CONFIG.KooKooAPI+'/bg_user.php',user, opts);	
			},
			forgotPassword: function(email, bannerid){
				var opts = HttpUtil.opts();
				return $http.post('/forgotpassword?username='+email+'&bannerid='+bannerid,{}, opts);
			},
			forgotUsername: function(email, bannerid){
				var opts = HttpUtil.opts();
				return $http.post('/forgotusername?email='+email+'&bannerid='+bannerid,{}, opts);
			}, 
			createCard: function(uid){
				var opts = HttpUtil.opts();
				return $http.post('/loyalty/enrollment/','"'+ uid+'"', opts);
			},
			checkUserExists: function(username){
				var opts = HttpUtil.opts();
				return $http.get('/users/' + username + '/exist', opts);
			},
			validateUser: function(email, phone, firstName, lastName, username){
				var opts = HttpUtil.opts();
				var body = {
					Email: email,
					Phone: phone,
					FirstName: firstName,
					LastName: lastName,
					UserName: username
				};
				return $http.post('/users/validate', body, opts);
			},
			searchUsersByField: function(field, val){
				var opts = HttpUtil.opts();
				return $http.get('/users?field=' + field + '&value=' + val, opts);
			},
			getCommunicationOpt: function(userid, type){
				var opts = HttpUtil.opts();
				return $http.get('/user/' + userid + '/status-optin?type=' + type, opts);
			}

		}
		
		return r;
	}
]);