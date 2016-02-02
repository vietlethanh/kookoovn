
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
        console.log('init BaseStoreLocatorCtrl');
           
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
       
        //$scope.nearBy = this.nearBy.bind(this);
        $scope.searchStore = function(){
          self.loadData($scope.sc.keyword);
        };
        $scope.loadCheckedInStores = function(clearCache){
          self.loadCheckedInStores(clearCache);
        };
        $scope.loadFavoriteStores = function(clearCache){
          self.loadFavoriteStores(clearCache);
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
            self.$scope.mapmode= APP_CONFIG.MapMode.list;
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
      //set market current possion
      /*
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
      */
      _sucessLoadData: function(res){
        console.log('_sucessLoadData');
        //console.log(res);
        var self = this;
        //console.log(res);
        var stores = res.data;
        if(typeof(res.data) === 'string'  && res.data.trim()=='')
        {
            this.$scope.stores = [];
            this.$scope.mapmode= APP_CONFIG.MapMode.list;
            
        }
        else
        {
            console.log(stores);         
            this.$scope.stores = stores;
            console.log(  this.$scope.stores);
        }
        $ionicLoading.hide();
      },
      onSelectStore: function(store){
        //console.log('lam gi the lam');
      },
      loadCheckedInStores: function(clearCache)
      {
          $ionicLoading.show();
          Store.getCheckedInStores(security.getCurrentUserName(),1,clearCache).then(this._sucessLoadData.bind(this));
      },
      loadFavoriteStores: function(clearCache)
      {
          $ionicLoading.show();
          Store.loadFavoriteStores(security.getCurrentUserName(),1,clearCache).then(this._sucessLoadData.bind(this));
      },


      switchMode: function(mode){
        this.$scope.mapmode = mode;
        $timeout(function(){
          $ionicScrollDelegate.scrollTop(true);
        }, 500);  
      },
      switchStoreType: function(type,clearCache){
        $ionicLoading.show();
        this.$scope.mapmode = APP_CONFIG.MapMode.list;
        this.$scope.selectedTab = type;
        if(type== APP_CONFIG.EnumSys.TAB_HISTORY || type== APP_CONFIG.EnumSys.TAB_FAVORITE)
        {  
          this.$scope.mapmode= APP_CONFIG.MapMode.list;// 'map'; /*map, list*/
          
          if(type == APP_CONFIG.EnumSys.TAB_HISTORY)
          {              
              this.$scope.loadCheckedInStores(clearCache);
          }
          //this.$scope.globalSearchStore(type);
          if(type == APP_CONFIG.EnumSys.TAB_FAVORITE)
          {                 
              this.$scope.loadFavoriteStores(clearCache);
             
          }
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
.controller('StoreLocatorCtrl', ['$scope','$rootScope','$state','$stateParams', '$ionicSideMenuDelegate', 'APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security','$ionicGesture','$compile','AppUtil','$cordovaGeolocation','$ionicHistory',
  function($scope,$rootScope, $state,$stateParams, $ionicSideMenuDelegate,APP_CONFIG, Store,BaseStoreLocatorCtrl, security, $ionicGesture,$compile,AppUtil,$cordovaGeolocation,$ionicHistory) {  
    console.log('Load StoreLocatorCtrl');
    var controllerCls = BaseStoreLocatorCtrl.extend({      
    });
     var map, markers;
    //console.log('init controllerCls');
    var controller = new controllerCls($scope,$state,$stateParams,$ionicSideMenuDelegate);
    $scope.$on('mapInitialized', function(event, evtmap) {
          map = evtmap, markers = map.markers;
        
          //console.log( 'map.getCenter()');
          
         
          $scope.map = evtmap;
          $rootScope.storeMap = evtmap;
          console.log('mapInitialized map');
          console.log($scope.map);

          //create custom control
          var searchHereCtrl = document.createElement('div');
          searchHere(searchHereCtrl, evtmap);

          searchHereCtrl.index = 1;
          map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchHereCtrl);

          if(typeof($rootScope.currentPos) == 'undefined')
          {
            navigator.geolocation.getCurrentPosition(function(position) {
              $rootScope.currentPos = position;
              setMarker(map, new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 'My Location', '');
            });  
          } 
          else
          {
            setMarker(map, new google.maps.LatLng($rootScope.currentPos.coords.latitude, $rootScope.currentPos.coords.longitude), 'My Location', '');
          }
          directionsService = new google.maps.DirectionsService();
          var rendererOptions = {
            map: map,
            suppressMarkers : true
          };
          console.log('rendererOptions map');
          directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
          function setMarker  (map, position, title, content) {
        
            //console.log('setMarker');

            //console.log(map);
            var marker;
            var markerOptions = {
                position: position,
                map: map,
                title: title,
                icon: './img/my-location.png'
            };

            marker = new google.maps.Marker(markerOptions);
            // markers.push(marker); // add marker to array
            circle = new google.maps.Circle({
                map: map,
                clickable: false,
                center: position,
                // metres
                radius: 300,
                fillColor: '#fff',
                fillOpacity: .6,
                strokeColor: '#313131',
                strokeOpacity: .4,
                strokeWeight: 0.1
            });
            // attach circle to marker
            //circle.bindTo('center', marker, 'position');
            google.maps.event.addListener(marker, 'click', function () {
              // close window if not undefined
              if (infoWindow !== void 0) {
                  infoWindow.close();
              }
              // create new window
              var infoWindowOptions = {
                  content: content
              };
              infoWindow = new google.maps.InfoWindow(infoWindowOptions);
              infoWindow.open(map, marker);
            });
          }          
    });
    //console.log($scope.mapmode);
    if($scope.mapmode == null)
    {
       $scope.mapmode= APP_CONFIG.MapMode.map;// 'map'; /*map, list*/
    }    
    //console.log($scope.mapmode);
    //var store ={};
    $scope.onSelectStore = function(storeID,type) {    
      //console.log('onSelectStore');
      //$scope.goTo('app.storeinfo', {id: storeID})
      $state.go('app.storeinfo', {id: storeID, type:type});
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: false
      });
    }
    
    $scope.swithTab = function(type) {    
     
      var clearCache = false;
      
      if(type == APP_CONFIG.EnumSys.TAB_HISTORY)
      {
          clearCache = $rootScope.refreshHistory;
      }
      else  if(type== APP_CONFIG.EnumSys.TAB_FAVORITE)
      {
          clearCache = $rootScope.refreshFavorite;
      } 

      if(typeof(clearCache) == 'undefined')
      {
        clearCache =false;
      }
      $scope.switchStoreType(type,clearCache)
      
      if(type = APP_CONFIG.EnumSys.TAB_HISTORY)
      {
          $rootScope.refreshHistory = false;
      }
      else  if(type== APP_CONFIG.EnumSys.TAB_FAVORITE)
      {
          $rootScope.refreshFavorite = false;
      } 
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
  
      infoWindow.close(map);
     
      infoWindow = new google.maps.InfoWindow({
        content:'<div id="map-infoWindo_'+this.id+'" class="MapStoreInfo"  >'      
        +'<h3>'          
        +selectStore.Name+'</h3>'+selectStore.Address+'<br/>'+selectStore.DistrictName+', '
        +selectStore.CityName+'<br/><div>'
        + ((typeof(selectStore.Content) != 'undefined' && AppUtil.trim(selectStore.Content)!= '')
          ?'Post: '+selectStore.Content+'...':'')+' <a data-ng-click="onSelectStore(\''+
          selectStore.StoreID+'\',\'info\')">More</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
          '<a style="float:right" data-ng-click="onSelectStore(\''+
          selectStore.StoreID+'\',\'direct\')">Go To</a></div></div>'     

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

      //console.log('mainContent');
      //console.log(mainContent);
      $scope.gestureMenu(mainContent);
      // $ionicGesture.on('tap', onContentTap, mainContent);
    });

    var centerCurrentPositionCordova = function(keyword,catId){
        //search by area
         if(typeof($rootScope.storeMap)!='undefined' && typeof($rootScope.storeMap.getCenter)!='undefined')
         {
            //console.log(' map.getCenter().lat()');
            //console.log(  $rootScope.storeMap.getCenter().lat());
            //console.log( $rootScope.storeMap.getCenter().lng());
            controller.loadData(keyword,catId,{lat: $rootScope.storeMap.getCenter().lat(),lng: $rootScope.storeMap.getCenter().lng()});        

         }
         else
         {
            //search current location
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation.getCurrentPosition(posOptions)
                .then(function (position) {
                  //var lat  = position.coords.latitude;
                  //var long = position.coords.longitude;
                  //console.log('cordovaGeolocation');
                  //console.log(position);

                  //var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
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
    }
    var centerCurrentPositionAPI = function(keyword,catId){
        
         //search by area
         if(typeof($rootScope.storeMap)!='undefined' && typeof($rootScope.storeMap.getCenter)!='undefined')
         {
            //console.log(' map.getCenter().lat()');
            //console.log(  $rootScope.storeMap.getCenter().lat());
            //console.log( $rootScope.storeMap.getCenter().lng());
            controller.loadData(keyword,catId,{lat: $rootScope.storeMap.getCenter().lat(),lng: $rootScope.storeMap.getCenter().lng()});        

         }
         else
         {
            //search current location
            navigator.geolocation.getCurrentPosition(function(position) {
              //console.log('getCurrentPosition');
              //console.log(position);
              //var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
              //var pos = new google.maps.LatLng(map.getCenter().lat(), map.getCenter().lng());
              //$scope.positions.push({lat: pos.k,lng: pos.B});
              //console.log('pos');
              //console.log(pos);
              controller.loadData(keyword,catId,{lat: position.coords.latitude,lng: position.coords.longitude});        
            }, function(e)
            {
              console.log(e);
            });
        }
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

    var searchHere = function (controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '1px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.style.opacity = '0.5';
        controlUI.title = 'Click to search this area';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '12px';
        controlText.style.lineHeight = '18px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Search Here';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlUI.addEventListener('click', function() {
          centerOnMe($scope.keyword,$scope.cat);
        });

    }

    //$scope.centerOnMe = centerOnMe();
    //get Paramenter
    $scope.keyword = $stateParams.keyword;
    $scope.cat = $stateParams.catId;
    $scope.selectedTab = $stateParams.type;
    $scope.page = $stateParams.page;
      
    centerOnMe($scope.keyword,$scope.cat);
        
  }

])
.controller('SelectStoreCtrl', ['$scope',
  function($scope) {  
    $scope.selectStore = function(store){
      store.selectStore(store);
    }
  }
])


.controller('StoreInfoCtrl',['$scope','$rootScope', '$state', '$stateParams', 'APP_CONFIG', 'security', 'Store','AppUtil','$ionicLoading','$ionicPopup','MCMTracker','$ionicScrollDelegate','$timeout','toaster','TrackingGPS',
  function($scope,$rootScope, $state, $stateParams,APP_CONFIG, security, Store,AppUtil,$ionicLoading,$ionicPopup, MCMTracker, $ionicScrollDelegate,$timeout,toaster,TrackingGPS){

     var map, markers;
    console.log('StoreInfoCtrl')
    // private properties -------------------------------------------------------------
    var id = $stateParams.id;
    var type = $stateParams.type;
    var logos =  {
      '13': 'img/store-logo-united.png',
      '14': 'img/store-logo-mktstreet.png',
      '22': 'img/store-logo-mktstreet.png',
      '23': 'img/store-logo-Albertsons.png',
      '15': 'img/store-logo-amigos.png'
    };
    // scope properties -------------------------------------------------------------
    $scope.map = {};
    $scope.mapcenter= {
          latitude:APP_CONFIG.StoreMapCenterPointDefault[0],
          longitude: APP_CONFIG.StoreMapCenterPointDefault[1]
    };
    $scope.mapzoom= APP_CONFIG.StoreMapZoomDefault;
    $scope.$on('mapInitialized', function(event, evtmap) {
         map = evtmap, markers = map.markers;
        $scope.map = evtmap;
         
        /*$scope.map.center= {
          latitude:APP_CONFIG.StoreMapCenterPointDefault[0],
          longitude: APP_CONFIG.StoreMapCenterPointDefault[1]
        };
        $scope.map.zoom= APP_CONFIG.StoreMapZoomDefault;
        */
        //$scope.map.bounds= {};
        
        console.log('mapInitialized map');
        console.log($scope.map);
        //map.setZoom(10);
        if(typeof($rootScope.currentPos) == 'undefined')
        {
          navigator.geolocation.getCurrentPosition(function(position) {
            $rootScope.currentPos = position;
            setMarker(map, new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 'My Location', '');
          });   
        }
        else
        {
          setMarker(map, new google.maps.LatLng($rootScope.currentPos.coords.latitude, $rootScope.currentPos.coords.longitude), 'My Location', '');
        }

        directionsService = new google.maps.DirectionsService();
        var rendererOptions = {
          map: map,
          suppressMarkers : true
        };
        console.log('rendererOptions map');
        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
        function setMarker  (map, position, title, content) {
      
          //console.log('setMarker');

          //console.log(map);
          var marker;
          var markerOptions = {
              position: position,
              map: map,
              title: title,
              icon: './img/my-location.png'
          };

          marker = new google.maps.Marker(markerOptions);
          // markers.push(marker); // add marker to array
          circle = new google.maps.Circle({
              map: map,
              clickable: false,
              center: position,
              // metres
              radius: 300,
              fillColor: '#fff',
              fillOpacity: .6,
              strokeColor: '#313131',
              strokeOpacity: .4,
              strokeWeight: 0.1
          });
          // attach circle to marker
          //circle.bindTo('center', marker, 'position');
          google.maps.event.addListener(marker, 'click', function () {
            // close window if not undefined
            if (infoWindow !== void 0) {
                infoWindow.close();
            }
            // create new window
            var infoWindowOptions = {
                content: content
            };
            infoWindow = new google.maps.InfoWindow(infoWindowOptions);
            infoWindow.open(map, marker);
          });
        }          
    });
    $scope.store = {};
    $scope.showP = false;
    $scope.showS = false;
    $scope.directed = false;
    $scope.showMap = false;
    if(type === 'direct')
    {
         $scope.showMap = true;
    }
    
    $scope.mapSize = "small-map";
  
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
        $scope.currentPos= {};
        $scope.tracked = false;

         if(typeof($rootScope.currentPos) == 'undefined')
         {
            navigator.geolocation.getCurrentPosition(function(position) {         
              var start =  new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
              var end = new google.maps.LatLng(  $scope.store.Latitude, $scope.store.Longitude);
              console.log('begin getCurrentPosition');
              console.log(position);
              $rootScope.currentPos = position
             
              if($scope.showMap)
              {
                $scope.directStore();
              }
             
            },
            function(err)
            {
                console.log('err calcRoute');
                console.log(err);
            });
        }
        else
        {
          if($scope.showMap)
          {
            $scope.directStore();
          }
        }
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
        
      });
      return req;
    };
   function calcRoute (start, end) {   
      console.log('start calcRoute');
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
      $scope.trackingGPS();
    }
    $scope.directStore = function() {    
     
      if( $scope.directed==false)
      {
        //$scope.trackingGPS();      
        var start =  new google.maps.LatLng($rootScope.currentPos.coords.latitude,$rootScope.currentPos.coords.longitude)
        var end = new google.maps.LatLng(  $scope.store.Latitude, $scope.store.Longitude);
        setTimeout(function() { calcRoute(start,end);}, 500);  
        $scope.directed = true;    
      }
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
      TrackingGPS.startTrack($scope.store,security.getCurrentUserName(), storePos,function(){
        $rootScope.refreshHistory = true;
        console.log('$rootScope.refreshHistory');
        console.log($rootScope.refreshHistory);
      });
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
    $rootScope.refreshFavorite = true;    
    toaster.pop('success','Success', 'Added this location successful.');
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
