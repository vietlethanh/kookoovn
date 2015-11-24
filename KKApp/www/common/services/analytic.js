angular.module('KooKoo.Analytics', [
	'KooKoo.Utils'
])
.factory('MCMAnalytics', ['$rootScope','security','$http','APP_CONFIG','AppUtil','toaster',
	function($rootScope, security, $http, APP_CONFIG, AppUtil,toaster){
		var r = {
			_send: function(obj){
				//alert('_send');
				return $http.post(APP_CONFIG.DistributeHost+'/mobiles', obj).then(function(res){
					//toaster.pop('success','Success', 'register device success')
				}, 
					function(res){
						toaster.pop('error','Error', res.data.message);
					}
				);
			},
			send: function(obj){
				window.device = window.device || {};
				var self = this,
					defaultObj = {
						Udid: window.device.uuid,
						UserName: security.getCurrentUserId(),
						AppName: APP_CONFIG.AppName,
						AppVersion: APP_CONFIG.AppVersion,
						CompanyId: APP_CONFIG.CompanyId,
						Platform: device.platform,
						PlatformVersion: device.version,
						Device: device.model,
						LastModified: '01/01/2000',
						Notification: false,
						ApplicationId:APP_CONFIG.ApplicationId

					};
				angular.extend(defaultObj, obj);

				//alert('send');
				//self._send(defaultObj);
				AppUtil.getCurrentPosition().then(function(res){
					defaultObj.Latitude = res.data.latitude;
					defaultObj.Longtitude = res.data.longitude;
					self._send(defaultObj);				
				}, function(){
					self._send(defaultObj);
				})
			}
		}
		return r;
	}// factory
])
.factory('MCMTracker',['APP_CONFIG', 'AppUtil',
	function(APP_CONFIG, AppUtil){
		var t;
		if(AppUtil.isOffline()){
			t={
				startTrackerWithId: function(){},
				trackView:function(){},
				trackEvent:function(){}
			}
			return t;
		}
		// WebTracker
		if(APP_CONFIG.IsWeb ){
			t = {
				startTrackerWithId: function(id){
					(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
					(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
					m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
					})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

					ga('create', id, {
					  'cookieDomain': 'none'
					});
					//ga('send', 'pageview');
				},
				trackView: function(pageTitle){
					ga('send', pageTitle);
				},
				trackEvent: function(category, action, label, value){

				}
			}// end t
		}
		// End Web Tracker
		// App Tracker
		else {
			t = {
				startTrackerWithId: function(id){
					window.analytics.startTrackerWithId(id);
				},
				trackView: function(pageTitle){
					window.analytics.trackView(pageTitle);
				},
				trackEvent: function(category, action, label, value){
					window.analytics.trackEvent(category, action, label, value);
				}
			}// endd

		}
		return t;

	}
])