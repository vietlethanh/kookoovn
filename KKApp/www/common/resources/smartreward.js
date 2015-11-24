angular.module('KooKoo.Resource.SmartRewards', [
	'KooKoo.Utils',
	'angular-data.DSCacheFactory'
])
.factory('SmartRewards', ['$http','HttpUtil','security','CacheUtil',
	function($http, HttpUtil, security, CacheUtil){
		var r = {
			getSmartRewardsInfo:  function(clearCache){
				var opts = HttpUtil.opts(),
					user = security.getCurrentUser();
				var opts = HttpUtil.opts({
						cache: true,
						offcache: true
					}),
					user = security.getCurrentUser();
				if(clearCache){
					CacheUtil.clearKey(['/cards/'+user.SRCardID+'/rewards']);
				}
				return $http.get('/cards/'+user.SRCardID+'/rewards', opts)
			},
			redeemDigitalCoupon: function(cid){
				var user = security.getCurrentUser(), 
				userid = security.getCurrentUserId(),
				opts = HttpUtil.opts({
					clearCache: [
						'/cards/'+user.SRCardID+'/rewards',
						'/shoppinglists/user-items?username='+userid
					]
				});
				return $http.post('/SmartRewards/'+user.SRCardID+'/redeem', '"'+cid+'"', opts);
			},
			getLodgeContinuityItems: function(){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				});
				return $http.get('/coupons/LodgeContinuity', opts);
			},
			getCardDemographic: function(clearCache){
				var opts = HttpUtil.opts({
					cache: true,
					offcache: true
				}),
				user = security.getCurrentUser();

				if(clearCache){
					CacheUtil.clearKey(['/cards/'+user.SRCardID+'/demographic']);
				}
				return $http.get('/cards/'+user.SRCardID+'/demographic', opts)
			},
			enrollRx: function(username, rxForm){
				var opts = HttpUtil.opts();
				return $http.post('/loyalty/enrollclub?type=' + 'RxClub',{
					UserName: username,
					Options: {
						DOB: rxForm.dateOfBirth,
						Signature1: rxForm.agree,
						Signature2: rxForm.reciveMessage
					}
				},opts);
			},
			updateRx: function(username, isReciveMessage){
				var opts = HttpUtil.opts();
				return $http.post('/loyalty/enrollclub?type=' + 'RxClub',{
					UserName: username,
					Options: {
						Signature1: true,
						Signature2: isReciveMessage
					}
				},opts);
			},
			getKidClubFamilyMembers: function(userid){
				var opts = HttpUtil.opts();
				return $http.get('/loyalty/club/'+userid+'?type=kidclub', opts).then(function(res){
					if(!res.data.Details){
						return res;
					}
					res.data.Details = angular.fromJson(res.data.Details);
					return res;
				});
			},
			updateKidClub: function(username, isRecivedLetter, children){
				var opts = HttpUtil.opts();
				return $http.post('/loyalty/enrollclub?type=kidclub',{
					username: username,
					Options: {
						IsReceivedLetter: isRecivedLetter,
						FamilyMembers: angular.toJson(children)
					}
				}, opts)
			},
			unEnrollKidClub: function(username, isRecivedLetter, children){
				var opts = HttpUtil.opts();
				return $http.post('/loyalty/enrollclub?type=kidclub',{
					username: username,
					Options: {
						IsReceivedLetter: isRecivedLetter,
						FamilyMembers: angular.toJson(children),
						IsDeleted: true
					}
				}, opts)
			}


		}
		return r;
	}
]);