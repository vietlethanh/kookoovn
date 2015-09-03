
angular.module('MCMRelationshop.StoreLocator', function(){
  if(isOnline()){
    return [
      'uiGmapgoogle-maps',
      'MCMRelationshop.Resource.Store',
      'MCMRelationshop.Utils'
    ]
  }
  else {
    return [
      'MCMRelationshop.Resource.Store',
      'MCMRelationshop.Utils'
    ]
  }
}()
/*  
[
  'google-maps',
  'MCMRelationshop.Resource.Store',
  'MCMRelationshop.Utils'
]*/)
.factory('BaseStoreLocatorCtrl',['APP_CONFIG', 'Store','AppUtil','$ionicLoading','MCMTracker','$ionicScrollDelegate','$timeout',
  function(APP_CONFIG, Store,AppUtil,$ionicLoading,MCMTracker, $ionicScrollDelegate,$timeout){
    var cls = Class.extend({
      logos: {
        '13': 'img/store-logo-united.png',
        '14': 'img/store-logo-mktstreet.png',
        '22': 'img/store-logo-mktstreet.png',
        '23': 'img/store-logo-Albertsons.png',
        '15': 'img/store-logo-amigos.png'
      },
      init: function($scope){
        var self = this;
        this.$scope = $scope;
        $scope.mode= APP_CONFIG.MapMode.map;// 'map'; /*map, list*/
        $scope.selectedTab='favorite'; /*map, list*/
        $scope.sc = {
          keyword: '',
        }
        $scope.map ={
          center: {
            latitude:APP_CONFIG.StoreMapCenterPointDefault[0],
            longitude: APP_CONFIG.StoreMapCenterPointDefault[1]
          },
          zoom: APP_CONFIG.StoreMapZoomDefault,
          bounds: {},
        };
        //$scope.gmap = new google.maps.Map(document.getElementById("mainGmap"));
        $scope.showHere = false;
        $scope.hereKey = 'here';
        $scope.hereTitle = 'Here i am';
        $scope.stores = null;
        //public methodP
        $scope.getLogo =  function(store){
          return self.logos[store.CS_BannerID+''];
        }
        $scope.switchMode = this.switchMode.bind(this);
        $scope.switchStoreType = this.switchStoreType.bind(this);
        $scope.onMarkerClicked = this.onMarkerClicked;
        $scope.nearBy = this.nearBy.bind(this);
        $scope.searchStore = function(){
          self.loadData($scope.sc.keyword);
        };
        $scope.info = function(store){
          $scope.goTo('app.storeinfo', {id: store.CS_StoreID})
        };
        this.loadData();
        //MCMTracker.trackView('StoreLocator');
       //  alert("You have Map Instance of" + this.$scope.map.control.getGMap().toString());

      },//init
      loadData: function(keyword){
        //console.log('loadData keyword');
        var self = this;
        $ionicLoading.show();
        this.$scope.showHere = false;
        Store.searchStore(keyword).then(this._sucessLoadData.bind(this))//
        .then(function(){
          
          var sumlat = 0, 
            sumlng = 0,
            stores = self.$scope.stores,
            length = stores.length;
          if(length <=0){
            return;
          }
          console.log(stores);
          _.forEach(stores, function(store){
            sumlat += store.Latitude;
            sumlng += store.Longitude;
          });
          // cal map center
          self.$scope.map.center = {
            latitude: sumlat/length,
            longitude: sumlng/length,
          }
          
          // self.addMarkers(self.$scope,stores);

        });
        
      },
      onMarkerClicked : function(marker) {   
          console.log('onMarkerClicked');
          marker.showWindow = true;
          $scope.$apply();
      },
      
      addMarkers : function(scope,stores) {   
           
        //console.log(map);
            var bounds = new google.maps.LatLngBounds();

            for (var i = 0; i < stores.length; i++) {
              //console.log(stores[i]);
               var latlng = new google.maps.LatLng(stores[i].Latitude, stores[i].Longitude);
                bounds.extend(latlng);
                //map.bounds.push(bounds);
            }
            //map.bounds = bounds;
          
        
        /*scope.$on('mapInitialized', function(event, map) {
          console.log(map);
                map.setCenter(bounds.getCenter());
                map.fitBounds(bounds);
          });
        */
           // map.bounds = bounds;

            //console.log(map.bounds);
            
            //console.log( bounds.getCenter());
           // console.log(google.maps);
           // var amap = new google.maps.Map(document.getElementById('mainGmap'));
            //amap.fitBounds(bounds);
           // map.center = bounds.getCenter();
            //map.fitBounds(bounds);
            //remove one zoom level to ensure no marker is on the edge.
           //map.zoom = (map.zoom - 1);

            // set a minimum zoom
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
        //console.log(res);
        var self = this;
        console.log(res);
        var stores = res.data;
        //console.log(stores);
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

        this.$scope.stores = stores;
        $ionicLoading.hide();
      },
      onSelectStore: function(store){
        //console.log('lam gi the lam');
      },
      switchMode: function(mode){
        this.$scope.mode = mode;
        $timeout(function(){
          $ionicScrollDelegate.scrollTop(true);
        }, 500);  
      },
      switchStoreType: function(type){
        this.$scope.mode = APP_CONFIG.MapMode.list;
        this.$scope.selectedTab = type;
        $timeout(function(){
          $ionicScrollDelegate.scrollTop(true);
        }, 500);  
      }
    });
    
    return cls;
  },
  
])
.controller('RegisterStoreCtrl', ['$scope','$state', 'APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security','CacheUtil',
  function($scope, $state, APP_CONFIG, Store,BaseStoreLocatorCtrl, security, CacheUtil) {  
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
.controller('StoreLocatorCtrl', ['$scope','$state', 'APP_CONFIG','Store', 'BaseStoreLocatorCtrl','security',
  function($scope, $state, APP_CONFIG, Store,BaseStoreLocatorCtrl, security) {  
    var controllerCls = BaseStoreLocatorCtrl.extend({
      onSelectStore: function(store){
        delete store.selectStore;
        security.setCurrentStore(store);
        $state.go('app.weeklyad');
      }
    });
    var controller = new controllerCls($scope);
  }
])
.controller('SelectStoreCtrl', ['$scope',
  function($scope) {  
    $scope.selectStore = function(store){
      store.selectStore(store);
    }
  }
])


.controller('StoreInfoCtrl',['$scope', '$state', '$stateParams', 'APP_CONFIG', 'security', 'Store','AppUtil','$ionicLoading','MCMTracker','$ionicScrollDelegate','$timeout',
  function($scope, $state, $stateParams,APP_CONFIG, security, Store,AppUtil,$ionicLoading,MCMTracker, $ionicScrollDelegate,$timeout){

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
      zoom: APP_CONFIG.StoreMapZoomDefault
    };
    $scope.store = {};
    $scope.showP = false;
    $scope.showS = false;

    // private method -------------------------------------------------------------
    function loadData(){
      $ionicLoading.show();
      var req = Store.getStore(id).then(function(res){
        $ionicLoading.hide();
        var store = res.data;
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
        $scope.map.zoom = 10;
      });
      return req;
    };
    //public method -------------------------------------------------------------
    $scope.goLocator = function(){
      $scope.map.center = {
        latitude: $scope.store.Latitude,
        longitude: $scope.store.Longitude
      }
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
    // Init -------------------------------------------------------------
    loadData();
  }
]);
