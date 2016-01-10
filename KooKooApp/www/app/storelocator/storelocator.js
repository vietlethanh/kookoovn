
angular.module('MCMRelationshop.StoreLocator', function(){
  if(isOnline()){
    return [
      'uiGmapgoogle-maps',
      'MCMRelationshop.Resource.Store',
      'MCMRelationshop.Utils',
      'MCMRelationshop.Services'
    ]
  }
  else {
    return [
      'MCMRelationshop.Resource.Store',
      'MCMRelationshop.Utils',
       'MCMRelationshop.Services'
    ]
  }
}()
/*  
[
  'google-maps',
  'MCMRelationshop.Resource.Store',
  'MCMRelationshop.Utils'
]*/)
.factory('BaseStoreLocatorCtrl',['APP_CONFIG', 'Store','AppUtil','$ionicLoading','MCMTracker','$ionicScrollDelegate','$timeout','security','$ionicViewService','$state',
  function(APP_CONFIG, Store,AppUtil,$ionicLoading,MCMTracker, $ionicScrollDelegate,$timeout,security,$ionicViewService,$state){
    var cls = Class.extend({
      logos: {
        '13': 'img/store-logo-united.png',
        '14': 'img/store-logo-mktstreet.png',
        '22': 'img/store-logo-mktstreet.png',
        '23': 'img/store-logo-Albertsons.png',
        '15': 'img/store-logo-amigos.png'
      },
      init: function($scope,$state,$stateParams,$ionicSideMenuDelegate){
        var self = this;
        this.$scope = $scope;
        $scope.mode= APP_CONFIG.MapMode.map;// 'map'; /*map, list*/
        //$scope.selectedTab='favorite'; /*map, list*/
        $scope.sc = {
          keyword: '',
        }
        $scope.map = {};

        //var myLatlng = new google.maps.LatLng( APP_CONFIG.StoreMapCenterPointDefault[0], APP_CONFIG.StoreMapCenterPointDefault[1]);
        //$scope.mapcenter= myLatlng;

        $scope.lat = APP_CONFIG.StoreMapCenterPointDefault[0], $scope.lng = APP_CONFIG.StoreMapCenterPointDefault[1]; 
        //console.log('APP_CONFIG.StoreMapZoomDefault');
        //console.log($scope.map.center);
        $scope.map.zoom = APP_CONFIG.StoreMapZoomDefault;
        //console.log('APP_CONFIG.StoreMapZoomDefault');
        //console.log(APP_CONFIG.StoreMapZoomDefault);
        //$scope.map = {center: {latitude: 51.219053, longitude: 4.404418 }, zoom: 14 };
        //  $scope.map.bounds= {};
      
        //$scope.gmap = new google.maps.Map(document.getElementById("mainGmap"));
        $scope.showHere = false;
        $scope.hereKey = 'here';
        $scope.hereTitle = 'Here i am';
        $scope.stores = null;
        
        //public methodP
        $scope.getLogo =  function(store){
          return self.logos[store.CS_BannerID+''];
        }
        $scope.goTo = function(link, params){
           $state.go(link, params);
           $ionicSideMenuDelegate.toggleLeft(false);
        }
        $scope.switchMode = this.switchMode.bind(this);
        $scope.switchStoreType = this.switchStoreType.bind(this);
       
        $scope.nearBy = this.nearBy.bind(this);
        $scope.searchStore = function(){
          self.loadData($scope.sc.keyword);
        };
        $scope.loadCheckedInStores = function(){
          self.loadCheckedInStores();
        };
        $scope.loadFavoriteStores = function(){
          self.loadFavoriteStores();
        };

        $scope.info = function(store){
          //console.log(store);
          $scope.goTo('app.storeinfo', {id: store.StoreID})
        };
        //this.loadData($scope.keyword);
        //MCMTracker.trackView('StoreLocator');
       //  alert("You have Map Instance of" + this.$scope.map.control.getGMap().toString());

      },//init
      loadData: function(keyword,cat, pos){
        console.log('loadData keyword');
        //console.log(cat);
        var self = this;
        $ionicLoading.show();
        this.$scope.showHere = false;
        var catId = cat;
        
        Store.searchStore(keyword,catId,pos).then(this._sucessLoadData.bind(this))//
        .then(function(){
          
          var sumlat = 0, 
            sumlng = 0,
            stores = self.$scope.stores,
            length = stores.length;
          if(length <=0){
            return;
          }
          console.log('load stores');
          console.log(stores);
          _.forEach(stores, function(store){
            sumlat += store.Latitude;
            sumlng += store.Longitude;
          });
          
          
        });
        
      },

      
      addMarkers : function(scope,stores) {   
            // if you got only 1 marker or all markers are on the same address map will be zoomed too much.
            if (scope.map.zoom > 15) {
                scope.map.zoom = 15;
            }
        },

      nearBy: function(){
        $ionicLoading.show();
        AppUtil.getCurrentPosition().then(function(res){
          var latlgn = res.data.latitude+','+res.data.longitude;
          this.$scope.map.center=res.data;
          this.$scope.showHere  = true;
          //$ionicLoading.show();
          Store.searchNearByStore(latlgn).then(this._sucessLoadData.bind(this));

        }.bind(this), function(error){
          $ionicLoading.hide();
          if(error){
            alert(error.message);
          }
          else {
            alert('Please enable location service.');
          }
          
        });
      },
      _sucessLoadData: function(res){
        console.log('_sucessLoadData');
        //console.log(res);
        var self = this;
        //console.log(res);
        var stores = res.data;
        /*
        _.forEach(stores, function(store){
         store.selectStore = self.onSelectStore;
          store.PharmacyHourArray = store.PharmacyHours ? store.PharmacyHours.split(',') : [];
          if(store.PharmacyPhone){
            var match = store.PharmacyPhone.match(/\d+/g);
            if(match == null){
              store.PharmacyPhone = null;
            }
          }

          //store.logo = self.[store.CS_BannerID+'']

        });
        */
        this.$scope.stores = stores;
        console.log(  this.$scope.stores);
        $ionicLoading.hide();
      },
      onSelectStore: function(store){
        //console.log('lam gi the lam');
      },
      loadCheckedInStores: function()
      {
        Store.getCheckedInStores(security.getCurrentUserName(),1).then(this._sucessLoadData.bind(this));
      },
      loadFavoriteStores: function()
      {
        Store.loadFavoriteStores(security.getCurrentUserName(),1).then(this._sucessLoadData.bind(this));
      },


      switchMode: function(mode){
        this.$scope.mode = mode;
        $timeout(function(){
          $ionicScrollDelegate.scrollTop(true);
        }, 500);  
      },
      switchStoreType: function(type){
        $ionicLoading.show();
        this.$scope.mode = APP_CONFIG.MapMode.list;
        this.$scope.selectedTab = type;
        if(type== APP_CONFIG.EnumSys.TAB_HISTORY || type== APP_CONFIG.EnumSys.TAB_FAVORITE)
        {  
          this.$scope.globalSearchStore(type);
        }       
        else
        {
          $ionicLoading.hide();
        }
        $timeout(function(){
          $ionicScrollDelegate.scrollTop(true);
        }, 500);  
        
      }
    });
    
    return cls;
  },
  
])
.controller('RegisterStoreCtrl', ['$scope','$state', '$stateParams','APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security','CacheUtil',
  function($scope, $state,$stateParams, APP_CONFIG, Store,BaseStoreLocatorCtrl, security, CacheUtil) {  
    var controllerCls = BaseStoreLocatorCtrl.extend({
      onSelectStore: function(store){
        delete store.selectStore;
        //security.setCurrentStore(store);
        CacheUtil.getAppCache().put('/register/store', store);
        $state.go('app.register', {step: 2});
      }
    });
    var controller = new controllerCls($scope);
  }
])
.controller('StoreLocatorCtrl', ['$scope','$state','$stateParams', '$ionicSideMenuDelegate', 'APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security','$ionicGesture','$compile','AppUtil','$cordovaGeolocation','$ionicViewService',
  function($scope, $state,$stateParams, $ionicSideMenuDelegate,APP_CONFIG, Store,BaseStoreLocatorCtrl, security, $ionicGesture,$compile,AppUtil,$cordovaGeolocation,$ionicViewService) {  
    console.log('Load StoreLocatorCtrl');
    var controllerCls = BaseStoreLocatorCtrl.extend({      
    });
    //console.log('init controllerCls');
    var controller = new controllerCls($scope,$state,$stateParams,$ionicSideMenuDelegate);
  
    //var store ={};
    $scope.onSelectStore = function(storeID) {    
      //console.log('onSelectStore');
      $scope.goTo('app.storeinfo', {id: storeID, reload:true})
    }
    var onload = function(markerID) {
      //console.log('onload');     
      $scope.$apply(function(){
          var element = document.getElementById("map-infoWindo_"+markerID);
        
          $compile(element)($scope)
      });
    }
    $scope.showStore = function(evt,storeID) {
     
      self = this;
      //console.log(self.id);
      //console.log(self)
      var selectStore = null;
      var stores = $scope.stores
      //console.log(stores);
      _.forEach(stores, function(store){
         if(store.StoreID == storeID)
         {
            //console.log('this showStore:'+store.StoreID);
            //console.log(store);
            selectStore = store;
            //break;
         } 
      });
      
      //console.log('showStore selectStore');
      //console.log(selectStore);
      //console.log(AppUtil.trim(selectStore.Content));
      // $scope.store = $scope.stores[0];
      // $scope.showInfoWindow.apply(this, [evt, 'bar']); 
      infoWindow.close(map);
     
      infoWindow = new google.maps.InfoWindow({
        content:'<div id="map-infoWindo_'+this.id+'" class="MapStoreInfo"  >'      
        +'<h3>'          
        +selectStore.Name+'</h3>'+selectStore.Address+'<br/>'+selectStore.DistrictName+', '
        +selectStore.CityName+'<br/><div>'
        + ((typeof(selectStore.Content) != 'undefined' && AppUtil.trim(selectStore.Content)!= '')
          ?'Post: '+selectStore.Content+'...':'')+' <a data-ng-click="onSelectStore(\''+
          selectStore.StoreID+'\')">Details</a></div></div>'     

      });
     
      // infoWindow.className = 'custom-marker';
      //console.log('addListener');
      google.maps.event.addListener(infoWindow, 'domready', function(a,b,c,d) {
             // self.className = 'custom-marker';
             //document.querySelector('#app-content');            
             angular.element( document.querySelector('.gm-style-iw').parentNode).addClass('custom-iw');
             onload(self.id);
      });
      
      //console.log(infoWindow.content);
      
      infoWindow.open(map, self);
      
    };

    var infoWindow = new google.maps.InfoWindow({      
    });

   
    ionic.Platform.ready(function(){
      // will execute when device is ready, or immediately if the device is already ready.
      //var mainContent = angular.element(document.querySelectorAll("ion-content")[1]);
      var mainContent = angular.element(document.querySelector('#app-content'));

      console.log('mainContent');
      console.log(mainContent);
      $scope.gestureMenu(mainContent);
      // $ionicGesture.on('tap', onContentTap, mainContent);
    });
   
    var map, markers;

  
    $scope.$on('mapInitialized', function(event, evtMap) {
      map = evtMap, markers = map.markers;
    });

    //console.log(' $scope.cat');
    //console.log( $stateParams);
    //console.log( $scope.cat);
    //console.log('$scope.keyword');
    //console.log($scope.keyword);

    var centerCurrentPositionCordova = function(keyword,catId){

        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions)
            .then(function (position) {
              var lat  = position.coords.latitude;
              var long = position.coords.longitude;
              //console.log('cordovaGeolocation');
              //console.log(position);

              var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              //$scope.positions.push({lat: pos.k,lng: pos.B});
              //console.log('pos');
              //console.log(pos);
              controller.loadData(keyword,catId,{lat: position.coords.latitude,lng: position.coords.longitude});

            }, 
            function(err) {
              // error
              console.log('err centerCurrentPositionCordova');
              console.log(err);
            }
          );
    }
    var centerCurrentPositionAPI = function(keyword,catId){

        navigator.geolocation.getCurrentPosition(function(position) {
          //console.log('getCurrentPosition');
          //console.log(position);
          var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          //$scope.positions.push({lat: pos.k,lng: pos.B});
          //console.log('pos');
          //console.log(pos);
          controller.loadData(keyword,catId,{lat: position.coords.latitude,lng: position.coords.longitude});        
        });
    }  
    
    var centerOnMe = function(keyword,catId){
      //var self = this;
      //console.log(self);
      $scope.positions = [];
      //console.log('centerOnMe');
      var isWebView = ionic.Platform.isWebView();
      if(isWebView)
      {
          centerCurrentPositionCordova(keyword,catId);
      }
      else
      {           
        
          centerCurrentPositionAPI(keyword,catId);   
      } 
    }
    //$scope.centerOnMe = centerOnMe();
    //get Paramenter
    $scope.keyword = $stateParams.keyword;
    $scope.cat = $stateParams.catId;
    $scope.type = $stateParams.type;
    $scope.page = $stateParams.page;
    console.log('call centerOnMe');
    if($scope.type == APP_CONFIG.EnumSys.TAB_HISTORY)
    {
        $scope.loadCheckedInStores();
    }
    else if($scope.type == APP_CONFIG.EnumSys.TAB_FAVORITE)
    {
        $scope.loadFavoriteStores();
    }
    else
    {
      centerOnMe($scope.keyword,$scope.cat);
    }    
  }
])
.controller('SelectStoreCtrl', ['$scope',
  function($scope) {  
    $scope.selectStore = function(store){
      store.selectStore(store);
    }
  }
])


.controller('StoreInfoCtrl',['$scope', '$state', '$stateParams', 'APP_CONFIG', 'security', 'Store','AppUtil','$ionicLoading','$ionicPopup','MCMTracker','$ionicScrollDelegate','$timeout','toaster','TrackingGPS',
  function($scope, $state, $stateParams,APP_CONFIG, security, Store,AppUtil,$ionicLoading,$ionicPopup, MCMTracker, $ionicScrollDelegate,$timeout,toaster,TrackingGPS){

    // private properties -------------------------------------------------------------
    var id = $stateParams.id;
    var logos =  {
      '13': 'img/store-logo-united.png',
      '14': 'img/store-logo-mktstreet.png',
      '22': 'img/store-logo-mktstreet.png',
      '23': 'img/store-logo-Albertsons.png',
      '15': 'img/store-logo-amigos.png'
    };
    // scope properties -------------------------------------------------------------
    
    $scope.map ={
        center: {
          latitude:APP_CONFIG.StoreMapCenterPointDefault[0],
          longitude: APP_CONFIG.StoreMapCenterPointDefault[1]
        },
        zoom: APP_CONFIG.StoreMapZoomDefault,
        bounds: {},
    };
    $scope.store = {};
    $scope.showP = false;
    $scope.showS = false;
    $scope.mapSize = "small-map";
    console.log('StoreInfoCtrl')
    // private method -------------------------------------------------------------
    function loadData(clearCache){

      console.log('loadData StoreInfoCtrl')
      $ionicLoading.show();
      
      
      var req = Store.getStore(id,clearCache).then(function(res){

        $ionicLoading.hide();
        var store = res.data;
        console.log(store);
        store.PharmacyHourArray = store.PharmacyHours ? store.PharmacyHours.split(',') : [];
        store.mapLink = AppUtil.mapLink(store.Latitude, store.Longitude);
        if(store.PharmacyPhone){
          var match = store.PharmacyPhone.match(/\d+/g);
          if(match == null){
            store.PharmacyPhone = null;
          }
        }
        $scope.store = store;

        $scope.map.center = {
          latitude: $scope.store.Latitude,
          longitude: $scope.store.Longitude
        }
        $scope.map.zoom = 18;
        $scope.tracked = false;
        //$scope.trackingGPS();
        var tracker = {   
          UserName:  security.getCurrentUserName(),       
          StoreID: $scope.store.StoreID,      
          act: 16 //get a tracker user
        };
        Store.getTracker(tracker).then(function(res){
         
          var trackData= res.data;
           console.log('getTracker');
          console.log(trackData);
          if(res!= null && trackData.TrackType == APP_CONFIG.TrackType.FAVORITE)
          {
            $scope.tracked = true;
          }
        });
        navigator.geolocation.getCurrentPosition(function(position) {         
          var start =  new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
          var end = new google.maps.LatLng(  $scope.store.Latitude, $scope.store.Longitude);
          
          calcRoute(start,end);
           
          /*$scope.map.center = {
            latitude: position.coords.latitude,
            longitude:  position.coords.longitude
          }
           //$scope.$safeApply();
           $scope.$apply(function(){
              var element = document.getElementById("mainGmap");
            
              $compile(element)($scope)
          });
          google.maps.event.trigger($scope.map, 'resize');
          */
        });
      });
      return req;
    };
   function calcRoute (start, end) {       
      var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING
      };
      directionsService.route(request, function(response, status) {
        console.log('route');
        console.log(status);
        console.log(directionsDisplay);
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
    }
    //public method -------------------------------------------------------------
    $scope.goLocator = function(){
      $scope.map.center = {
        latitude: $scope.store.Latitude,
        longitude: $scope.store.Longitude
      
      };
      $ionicScrollDelegate.scrollTop();
    };
    $scope.getLogo =  function(store){
      return logos[store.CS_BannerID+''];
    };
    $scope.toggle = function(field){
      $scope[field] = !$scope[field];
    };
    $scope.select = function(store){
      security.setCurrentStore(store);
      $state.go('app.weeklyad');
    }
    $scope.ratingsObject = {
      iconOn: 'ion-ios-star', //Optional
      iconOff: 'ion-ios-star-outline',  //Optional
      iconOnColor: 'rgb(200, 200, 100)',  //Optional
      iconOffColor: 'rgb(200, 100, 100)', //Optional
      rating: 5,  //Optional
      minRating: 1, //Optional
      readOnly:false, //Optional
      callback: function(rating) {  //Mandatory    
        $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    $scope.ratingsObject.rating = rating;
   // console.log('Selected rating is : ', rating);
  };
  $scope.trackingGPS = function() {   
      
      console.log('begin trackingGPS');
      var storePos = {
        latitude: $scope.store.Latitude,
        longitude: $scope.store.Longitude

      };
      TrackingGPS.startTrack($scope.store,security.getCurrentUserName(), storePos);
  };
  $scope.addFavorite = function(storeId)
  {
    var tracker = {   
      UserName:  security.getCurrentUserName(),
      TrackType: APP_CONFIG.TrackType.FAVORITE,
      Description:"Add to my favorites", 
      Value: $scope.store.StoreID,      
      act: 10 //Add a tracker
    };
    Store.addTracker(tracker);  
    $scope.tracked = true;
    toaster.pop('success','Success', 'Check-in this location successful.');
  }
  $scope.checkIn_old = function(store) {
    //console.log(store);
    $scope.rate = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="rate.message">  <ionic-ratings ratingsobj="ratingsObject"></ionic-ratings>',
      title: 'Check in with the status',
      //subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Submit</b>',
          type: 'button-positive',
          onTap: function(e) {
            //console.log(e);
            if (!$scope.rate.message) {
              //don't allow the user to close unless he enters wifi password

             toaster.pop('error','Error', 'Please enter your feedback.');
              
              e.preventDefault();
            } else {
              //console.log($scope.rate.message);
              return $scope.rate.message;

            }
          }
        }
      ]
    });
    myPopup.then(function(res) {
        if(!res){
          return;
        }
        var checkin = {
          StoreID: store.StoreID,
          UserName:  security.getCurrentUserName(),
          Message: res,
          Rate: $scope.ratingsObject.rating,
          act: 3
        };
        Store.addCheckIn(checkin);
        loadData(true);
        $scope.$safeApply();
        toaster.pop('success','Success', 'Check-in this location successful.');
        //console.log('Tapped!', res);
    });

    /*$timeout(function() {
       myPopup.close(); //close the popup after 3 seconds for some reason
    }, 3000);
    */
   };
    

    // Init -------------------------------------------------------------
    loadData();
  }
]);
