var isAndroid = function() {
	var uagent = navigator.userAgent.toLowerCase();
	return uagent.search('android') > -1 ? true : false;
};
var localserver = {
	Host:'http://localhost/CS.API/api',
	DistributeHost: 'http://devapi.mcmhq.com/mcmdistribution/api',
   	SecureHost: 'http://localhost/CS.API/api',
   	ApplicationId: isAndroid()?'56dd18ee-abe1-4dae-8737-bdf0d64898a7':'f3315060-5099-41df-809a-9c11e6e36d59',
   	BlankImge: 'http://UnitedQCAdmin.MyRelationShop.com/Images/1x1.gif',
   	DefaultImage: 'http://united.myrelationshop.com/Admin/Images/CouponIcon/sr_coupon_icon.png'
}
var qcserver = {
	Host:'http://united3qcapiv2.myrelationshop.com/api',
	DistributeHost: 'http://devapi.mcmhq.com/mcmdistribution/api',
   	SecureHost: 'https://united3qcapiv2.myrelationshop.com/api',
   	ApplicationId: isAndroid()?'56dd18ee-abe1-4dae-8737-bdf0d64898a7':'f3315060-5099-41df-809a-9c11e6e36d59',
   	BlankImge: 'http://UnitedQCAdmin.MyRelationShop.com/Images/1x1.gif',
   	DefaultImage: 'http://united.myrelationshop.com/Admin/Images/CouponIcon/sr_coupon_icon.png'
}
var liveserver = {
	Host:'https://unitedapi30.myrelationshop.com/api',
 	SecureHost: 'https://unitedapi30.myrelationshop.com/api',
 	DistributeHost: 'https://gtapi.mcmhq.com/mcmdistribution/api',
 	ApplicationId: isAndroid()?'56dd18ee-abe1-4dae-8737-bdf0d64898a7':'ee8c953d-31e2-4ba5-92da-8371ed744620',
 	BlankImge: 'http://UnitedAdmin.MyRelationShop.com/Images/1x1.gif',
   	DefaultImage: 'http://united.myrelationshop.com/Admin/Images/CouponIcon/sr_coupon_icon.png'
}
var livedev = {
	Host:'http://unitedapi21.myrelationshop.com/api',
	SecureHost: 'https://unitedapi21.myrelationshop.com/api',
   	DistributeHost: 'http://gtqc2api.mcmhq.com/mcmdistribution/api',
   	ApplicationId: isAndroid()?'56dd18ee-abe1-4dae-8737-bdf0d64898a7':'f3315060-5099-41df-809a-9c11e6e36d59',
   	BlankImge: 'http://UnitedAdmin.MyRelationShop.com/Images/1x1.gif',
   	DefaultImage: 'http://united.myrelationshop.com/Admin/Images/CouponIcon/sr_coupon_icon.png'
}
var mapMode =
			{
				list:'list',
				map:'map'
			}
var socialWeb = 
			{
				Facebook : 'Facebook',
				Twitter : 'Twitter',
				Google : 'Google'
			}
var socialAppID =
				{
					//see init in index.html
					FacebookAppID:'871963922911532', //vietlethanh1988@yahoo.com
					TwitterAppID:'5Z9AGmXCunGKxt3iq3dexDGzu', //vietlethanh.dev@gmail.com
					TwitterSecretKey:"zYMfsOWXYSgSQwb1m6ybWq5cfU0h1vi0668XMl0i0d80ZVcQQO",//vietlethanh.dev@gmail.com
					//search: Google API 
					//see init in index.html
					//Web App
					//GoogleAppID:'1070103978451-pqgroa727omt4ie3p9k58thqir7irrd1.apps.googleusercontent.com', //kookoovn@gmail.com
					//Native App.
					//This config only for Navtive APP. API key for web. see in funct googleWebLogin of login.js
					GoogleAppID:'1026812135759-r2agkgj72cbjln9j7fvpf4kbqdvem161.apps.googleusercontent.com', //vietlethanh.dev@gmail.com 
				}

var enumsys = {
	TAB_FAVORITE: 'favorite',
	TAB_LUCKY: 'lucky',
	TAB_HISTORY: 'history'
};

var trackType = {
	FAVORITE: 'favorite',
	CLICK: 'click'
	
};

var unitedAppCfg = {
	ShowSmartReward : true,
	FeedBackType : 'Mobile Web',
	AlertTitle : "KooKoo",
	CustomApp : typeof(DfwOLC) != 'undefined' ? DfwOLC : '',
	//Tracker : AppTracker,
	AccountTrackerID: 'UA-23943946-15',
	TrackerCategory :'MobileApp',
	TOULink : 'http://www.unitedtexas.com/shopmoresavemore',
	FAQLink : 'http://www.unitedtexas.com/mobile/FAQs',
	PPLink : 'http://www.unitedtexas.com/privacypolicy',
	FullSiteLink : 'http://www.unitedtexas.com',
	StoreSearchDefaultKey:'',
	StoreMapCenterPointDefault:[10.771557,106.705818],//Quan 1
	StoreMapZoomDefault:14,
	EnablePushnotification : false,
	AppName:'UnitedRelationshop',
	AppVersion :'3.0.2',
	BuildVersion: 29012,
	AppTag :'dfw',
	WeeklyAdCacheTime : 3600*8, // 8 hour
	SmartRewardCacheTime: 3600,// 1 hour
	CompanyId: 'A91F6788-BBE6-4ED3-8BB9-647C10ECEECA',
	APIComsumerKey:'0E171208-DB50-4F00-AF4C-987A194DD612',
	APIUserName:'UnitedApiUser',
	APIPassword : 'United2014',
	SenderId: '1053425628001',
	RecipeImageDefault: 'http://unitedadmin.myrelationshop.com/images/RecipeDefault.jpg',
	SocialAppID: socialAppID,
	MapMode: mapMode,
	SocialWeb : socialWeb,
	EnumSys:enumsys,
	TrackType: trackType,
	//KooKooAPI: 'https://kookoo.vn'
	KooKooAPI: 'http://kookoo.local:8080'
}

var matchedCodes = {
	VALIDATE_MATCHED_ONE: 0,
	VALIDATE_MATCHED_MULTI: 1,
	VALIDATE_MATCHED_CARD: 2,
	VALIDATE_MATCHED_INVALID_MULTI: 3
};


var env = {};
env.localweb = angular.extend({}, localserver, unitedAppCfg, {IsWeb: true, enable_local: false}, matchedCodes);
env.qcweb = angular.extend({}, qcserver, unitedAppCfg, {IsWeb: true, enable_local: false}, matchedCodes);
env.liveweb = angular.extend({}, liveserver, unitedAppCfg, {IsWeb: true, enable_local: false}, matchedCodes);

env.qcapp = angular.extend({}, qcserver, unitedAppCfg, {IsWeb: false}, matchedCodes);
env.liveapp = angular.extend({}, liveserver, unitedAppCfg, {IsWeb: false}, matchedCodes);
env.liveappdev = angular.extend({}, livedev, unitedAppCfg, {IsWeb: false}, matchedCodes);

angular.module('MCMRelationshop.Config', [])
.constant('APP_CONFIG', env.localweb);
