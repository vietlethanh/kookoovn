angular.module('KooKoo.Push', [
	'toaster',
	'KooKoo.Utils'
])
.service('phone', function() {
	this.isAndroid = function() {
		var uagent = navigator.userAgent.toLowerCase();
		return uagent.search('android') > -1 ? true : false;
	};
})
.factory('push', ['$rootScope','$state','$location', 'AppUtil', 'phone','$http','APP_CONFIG','$ionicPopup','toaster','$timeout',
function($rootScope, $state, $location, AppUtil, phone, $http, APP_CONFIG,$ionicPopup, toaster, $timeout){
	var r = {
		registerPush: function(fn) {
			if(!window.plugins || !window.plugins.pushNotification){
				return;				
			}
			var
				pushNotification = window.plugins.pushNotification,
				successHandler = function(result) {},
				errorHandler = function(error) {alert(error);},
				tokenHandler = function(result) {

					return fn({
						'type': 'registration',
						'id': result,
						'device': 'ios'
					});
				};
			var handleUrl = function(url){
				if(!url){
					return;
				}
				if(url.indexOf('app://') >=0){
					$location.url(url.replace('app://',''));
				}
				else {
					AppUtil.openNewWindow(url);
				}
			};
			window.onNotificationAPN = function(event) {
				if(event.foreground == "1"){
					if(event.alert){						
						$timeout(function(){
							toaster.pop('success','Notification',event.alert , null, null, function(){
								handleUrl(event.url);
							});
						},0);
					}
					
				}
				else{
					$timeout(function(){
						handleUrl(event.url);
					},0);
				}

				if (event.sound) {
					var snd = new Media(event.sound);
					snd.play();
				}

				if (event.badge) {
					pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
				}
			};
			window.onNotificationGCM = function(event) {
				//alert('onNotificationGCM');
				//alert(event.event);
				switch (event.event) {
					case 'registered':
						//alert(event.regid);
						if (event.regid.length > 0) {
							return fn({
								'type': 'registration',
								'id': event.regid,
								'device': 'android'
							});
						}
						break;

					case 'message':
						if (event.foreground) {
							//alert('foreground');
							//navigator.notification.alert(event.payload.message);
							//alert(event.payload.message);	
							if(event.payload.url)
							{						
								$timeout(function(){
									toaster.pop('success','Notification', event.payload.message , null, null, function(){
										handleUrl(event.payload.url);
									});
								},0);
							}
							var soundfile = event.soundname || event.payload.sound;
				            // if the notification contains a soundname, play it.
				            var my_media = new Media("/android_asset/www/"+ soundfile);
				            my_media.play();
						} else {
							if(event.payload.url){
								$timeout(function(){
									handleUrl(event.payload.url);
								},0);
							}
							
							if (event.coldstart) {
							} else {}
						}
						break;

					case 'error':
						break;

					default:
						break;
				}
			};
			
			if (phone.isAndroid()) {
				pushNotification.register(successHandler, errorHandler, {
					'senderID': APP_CONFIG.SenderId,
					'ecb': 'onNotificationGCM'
				});
			} else {
				//console.log('register ios');
				pushNotification.register(tokenHandler, errorHandler, {
					'badge': 'true',
					'sound': 'true',
					'alert': 'true',
					'ecb': 'onNotificationAPN'
				});
			}

		}// register push
	};// end r
	return r;
}]);