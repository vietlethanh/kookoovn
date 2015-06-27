angular.module('MCMRelationshop.Resource.DigitalCoupon', [
	'MCMRelationshop.Utils',
	'angular-data.DSCacheFactory'
])
.factory('DigitalCoupon', ['$http','HttpUtil','security',
	function($http, HttpUtil, security){
		var r = {
			getDigitalCoupons:  function(){
				var opts = HttpUtil.opts(),
					user = security.getCurrentUser(),
					userid = security.getCurrentUserId(),
					params = {
						cpn: 'DigitalCoupon',
						cardid: user.SRCardID,
						user: userid
					};
				return $http.get('/srcoupons?'+HttpUtil.encodeUrl(params), opts);
			},
			redeemDigitalCoupon: function(cId){
				var user = security.getCurrentUser(),
					userid = security.getCurrentUserId(),
					opts = HttpUtil.opts({
						clearCache: ['/shoppinglists/user-items?username='+userid]
					});
				return $http.post('/SmartRewards/'+user.SRCardID+'/redeem', '"'+cId+'"', opts);
			},
			getCouponCategories: function(keyword){
				var opts = HttpUtil.opts(),
					params = {
						cpn: 'DigitalCoupon',
						keyword: keyword
					};
				return $http.get('/srcoupons/categories?'+HttpUtil.encodeUrl(params), opts);
			}
		};
		return r;
	}
]);