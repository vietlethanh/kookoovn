angular.module('MCMRelationshop.RewardsProgram', [
	'MCMRelationshop.Resource.SmartRewards',
	'MCMRelationshop.Utils',
	'MCMRelationshop.Resource.Setting',
	'MCMRelationshop.BarcodeDirective'
])
.controller('RewardsProgramCtrl', ['$scope','$stateParams','$q', 'security', 'SmartRewards','Store', 'Setting', '$ionicLoading','$ionicPopup','$ionicScrollDelegate','$filter','APP_CONFIG','MCMTracker','toaster','$timeout',
	function($scope,$stateParams, $q, security, SmartRewards, Store, Setting, $ionicLoading, $ionicPopup, $ionicScrollDelegate, $filter, APP_CONFIG,MCMTracker,toaster, $timeout ) {  
		//console.log('dang thu trang')
		// private properties -------------------------------------------------------------
		var open = $stateParams.open;
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.isGuest = security.isGuestMode();
		$scope.currentUser = security.getCurrentUser();
		$scope.currentStore  = security.getCurrentStore();
		//console.log($scope.currentUser);
		$scope.cardInfo = {};
		$scope.enableLodge = false;
		$scope.rxClub = {
			showPart: '',
			joined: false,
			startDate: false,
			reciveMessage: false,
			
		},
		$scope.rxForm = {
			dateOfBirth: '',
			agree: false,
			reciveMessage: false,
		};
		$scope.kidClub = {
			Children: []
		};

		$scope.switchs = {
			dcShow: false,
			rxShow: false,
			lodgeShow: false,
			cfShow: false,
			kcShow: false,
			anShow: false,
			lodgePart: 'intro'
		}
		$scope.lodgeItems  =[];
		// private method -------------------------------------------------------------
		function loadData(clearCache){
			var rewardReq, demographicReq, lodgeItemsReq, checkSRActive, checkEnableLodgeProgram;
			if($scope.currentStore && !$scope.currentStore.Loyalty){
				$scope.showUnactive = true;
				$ionicLoading.show();
				Setting.getSetting('STORE_MESSAGE_LOYALTY').then(function(res){
					$ionicLoading.hide();
					$scope.lmessage = res.data;
				});
				return;
			}
			rewardReq =  SmartRewards.getSmartRewardsInfo(clearCache).then(function(res){
				var cardInfo = res.data;
				cardInfo.LodgeContinuity = 0;
				if(angular.isArray(cardInfo.ContinuityPromotions)){
					var promotions = cardInfo.ContinuityPromotions;
					for(var i=0; i<promotions.length; i++){
						if(promotions[i].AccountId == '11'){
							cardInfo.LodgeContinuity = promotions[i].Balance;
							break;
						}
					}
				}
				// coffee
				cardInfo.CoffeePoints = parseInt(cardInfo.CoffeeBalance%10);
				cardInfo.CoffeeNeedPoints = 10 - cardInfo.CoffeePoints;

				// check pilot point
				var point = _.find(cardInfo.RewardEarned, function(re){
					return re.Type=="MyPoints";
				});
				if(point){
					cardInfo.PilotPoint = point.RewardBal;
				}
				$scope.cardInfo = cardInfo;				
				return res;
			}, function(res){
				$ionicLoading.hide();
				if(res.status === 404){
					$scope.showWatingCardView = true;
				}
			});
			checkEnableLodgeProgram = Setting.getSetting('LODGE_CONTINUITY').then(function(res){
				$scope.enableLodge = res.data && res.data.indexOf('true') >=0;
			});

			demographicReq = SmartRewards.getCardDemographic(clearCache).then(function(res){
				var demographic = res.data;
				//console.log(demographic);
				$scope.kidClub.isReciveLetter = res.data.IsClubReceiveNewLetter;
				$scope.kidClub.isJoin = res.data.IsClubEnrollment;

				if(demographic && demographic.Segments){
					var segments = demographic.Segments;
					var joined = _.find(segments, {SegmentId: 9});
					if(joined){
						$scope.rxClub.joined = true;
						$scope.rxClub.showPart="paid";
					}
					else {
						$scope.rxClub.showPart="intro";
						$scope.rxClub.joined = false;
					}
					//$scope.rxClub.showPart="paid";
					var reciveMessage = _.find(segments, {SegmentId: 10})
					if(reciveMessage){
						$scope.rxClub.reciveMessage = reciveMessage;
						$scope.rxClub.isReciveMessage = true;
					}

					var seg = _.find(segments, {SegmentId: 11});
					//var endData = _.find*()
					if(seg){
						$scope.rxClub.showPart="paid";
						$scope.rxClub.joined = true;
						/*
						var sD =  new Date(seg.StartDate);
						$scope.rxClub.startDate = sD.getYear()>0? seg.StartDate: null;
						*/
						$scope.rxClub.startDate = seg.StartDate;
						var eD = new Date(seg.EndDate);
						$scope.rxClub.endDate = eD.getYear()>0 ?seg.EndDate: null;
					}
					/*
					if(!$scope.rxClub.startDate && joined){
						$scope.rxClub.startDate = joined.StartDate;
					}
					*/
					
				}
				
				return res;
			});

			lodgeItemsReq = SmartRewards.getLodgeContinuityItems();

			kidClubFamilyMembersReq = SmartRewards.getKidClubFamilyMembers($scope.currentUser.UserID).then(function(res){
				$scope.kidClub.Children =  res.data.Details;
				return res;
			});
			$ionicLoading.show();
			return $q.all([rewardReq, demographicReq,lodgeItemsReq, kidClubFamilyMembersReq, checkEnableLodgeProgram]).then(function(res){
				$ionicLoading.hide();
				var lodgeData = res[2].data,
					point = $scope.cardInfo.LodgeContinuity;
				function calStatus(item, point){
					if(point>=item.ticket){
						return 'enough'
					}
					else if(item.pticket>0 && point>=item.pticket){
						return 'justenough'
					}
					else {
						return 'notenough'
					}
				} 
				$scope.lodgeItems = _.map(lodgeData, function(item){

					var citem = {
						name: item.Title,
						code: item.RefID,
						description:item.Description,
						ticket: item.RdmCost,
						image: item.ImgFile,
						pticket: item.NumSaving,
						purchase: _.isEmpty(item.TextSaving)? null: angular.fromJson(item.TextSaving),
						status: calStatus(item, point)
					}
					citem.status = calStatus(citem, point);
					return citem;
				});  
				return res;
			});

		}

		//public method -------------------------------------------------------------
		$scope.refresh = function(){
			loadData(true);
		};
		$scope.toggle = function(tgl){
			$scope.switchs[tgl] = !$scope.switchs[tgl];
		};
		$scope.showEnrollForm = function(){
			$scope.rxClub.showPart="enroll";
		};
		
		
		$scope.enrollRx = function(form){
			if(form.$invalid){
				return;
			}
			$ionicLoading.show();
			var rxForm = angular.copy($scope.rxForm);
			rxForm.dateOfBirth = $filter('date')(rxForm.dateOfBirth,'MM/dd/yyyy');
			SmartRewards.enrollRx($scope.currentUser.Email, rxForm).then(function(res){
				var data = res.data;
				$ionicLoading.hide();
				// fail
				if(!data.CardHolderId || _.isEmpty(data.CardHolderId)|| data.RejectCode){
				//if(!data.CardHolderId || data.RejectCode){
					var alertPopup = $ionicPopup.alert({
						title: APP_CONFIG.AlertTitle,
						template: data.RejectMessage
					});
					return;
				}			
				// success
				$scope.rxClub.showPart = 'success';
			});
			
		
		};
		$scope.updateRx = function(form){
			$ionicLoading.show();
			SmartRewards.updateRx($scope.currentUser.Email, $scope.rxClub.isReciveMessage).then(function(res){
				var data = res.data;
				$ionicLoading.hide();
				toaster.pop('success','Success', 'Update success.');
			});

		};
		
		$scope.showPaid = function(){
			loadData(true);	
			$scope.rxClub.showPart = 'paid';
		};
		$scope.showLogdePart = function(part){
			$scope.switchs.lodgePart = part;
			$ionicScrollDelegate.anchorScroll('lodge_section');
			
		};
		$scope.rsNothanks = function(){
			$scope.toggle('rxShow');
			$timeout(function(){
				$ionicScrollDelegate.scrollTop(true);
			}, 500);			
		};
		$scope.addChild = function(){
			$scope.goTo('app.kidclubaddchild');
		};
		$scope.editChild = function(child){
			$scope.goTo('app.kidclubeditchild', {id: child.SR_FamilyMemberId});
		}
		$scope.showFruitMessage = function(){
			$ionicPopup.alert({
				title: "",
				template: 'Kids choose a free piece of fruit each time you shop. Choose from snack size apple, banana or orange. Show this message at check out. Cashier use <strong>PLU 8710</strong>.'
			});
		}
		$scope.saveKidClub = function(){
			$ionicLoading.show();
			SmartRewards.updateKidClub($scope.currentUser.Email, $scope.kidClub.isReciveLetter, $scope.kidClub.Children).then(function(res){
				$ionicLoading.hide();
			});
		};
		$scope.range = _.range
		
		// Init -------------------------------------------------------------
		if($scope.currentStore && !$scope.currentStore.Loyalty){
			$scope.showUnactive = true;
			$ionicLoading.show();
			Setting.getSetting('STORE_MESSAGE_LOYALTY').then(function(res){
				$ionicLoading.hide();
				$scope.lmessage = res.data;
			});
			return;
		}
		else{
			if($scope.currentUser && $scope.currentUser.SRCardID){
				if(open){
					$scope.switchs[open] = true;
					$ionicScrollDelegate.anchorScroll('kidclub_section');
				}
				loadData(true);
			}
		}
		MCMTracker.trackView('RewardsProgram');
	}
])
.controller('KidClubAddChildCtrl', ['$stateParams','$scope','$q', 'security','$filter', 'SmartRewards','Store', 'Setting', '$ionicLoading','$ionicPopup','APP_CONFIG','MCMTracker','toaster','$timeout',
	function($stateParams,$scope, $q, security, $filter, SmartRewards, Store, Setting, $ionicLoading, $ionicPopup, APP_CONFIG,MCMTracker,toaster, $timeout ) {  
		// private properties -------------------------------------------------------------
		var currentUser = security.getCurrentUser(),
			children = [],
			isReciveLetter = false,
			id = null, kid;
		// public properties -------------------------------------------------------------
		// scope properties -------------------------------------------------------------
		$scope.children = [];
		$scope.child ={
			FirstName: null,
			DOB: null,
			SR_FamilyMemberId: null,
		};
		var fmPromise = null;
		// private method -------------------------------------------------------------
		function loadData () {
			$ionicLoading.show();
			demographicReq = SmartRewards.getCardDemographic();
			kidClubFamilyMembersReq = SmartRewards.getKidClubFamilyMembers($scope.currentUser.UserID);
			var deferred = $q.defer();
			fmPromise = $q.all([demographicReq, kidClubFamilyMembersReq]).then(function(res){
				$ionicLoading.hide();
				var demographic = res[0].data,
					kidclubInfo = res[1].data;
				isReciveLetter = demographic.IsClubReceiveNewLetter;
				children = kidclubInfo.Details;
				$scope.children = children;
				deferred.resolve({ children: children });

				// is Edit mode
				if(!_.isEmpty(id)){return;}	
				kid =_.find(children, {SR_FamilyMemberId: id});
				if(kid){
					$scope.child.FirstName = kid.FirstName;
					$scope.child.DOB = parseInt($filter('date')(kid.DOB,'M'));
					$scope.child.SR_FamilyMemberId = id;
				}
						return deferred.promise;
			});
		}
		function back(){
			return $scope.goTo('app.rewardsprogram', {open: 'kcShow'}, {reload: true});
		}
		//public method -------------------------------------------------------------
		$scope.save = function(form){
			if(form.invalid){
				return;
			}
			var child = angular.copy($scope.child);
			var DOB = new Date();
			DOB.setMonth($scope.child.DOB -1);
			child.DOB = $filter('date')(DOB,'MM/dd/yyyy');
			if(child.SR_FamilyMemberId == null){
				delete child.SR_FamilyMemberId;
			}
			children.push(child);
			$ionicLoading.show();
			SmartRewards.updateKidClub(currentUser.Email, isReciveLetter, children).then(function(res){
				$ionicLoading.hide();
				back();
			})
		};
		$scope.update = function(form){
			if(form.invalid){
				return;
			}
			var DOB = new Date();
			DOB.setMonth($scope.child.DOB -1);
			kid.DOB = $filter('date')(DOB,'MM/dd/yyyy');
			kid.FirstName = $scope.child.FirstName;
			$ionicLoading.show();
			SmartRewards.updateKidClub(currentUser.Email, isReciveLetter, children).then(function(res){
				$ionicLoading.hide();
				back();
			});

		}
		$scope.unEnroll = function(){
			var confirmPopup = $ionicPopup.confirm({
				title: APP_CONFIG.AlertTitle,
				template: 'Are you sure you want to unenroll this child?'
		     });
		     confirmPopup.then(function(resConfirm) {
		       if(resConfirm) {
					fmPromise.then(function(childrenRes){
						if(childrenRes.children.length == 1){
							_.remove(children, {SR_FamilyMemberId: id});
							$ionicLoading.show();
							//Unenroll kid's club when the family remaining 1 child.
							SmartRewards.unEnrollKidClub(currentUser.Email, isReciveLetter, children).then(function(){
								$ionicLoading.hide();
								back();
							});
						}else{
							_.remove(children, {SR_FamilyMemberId: id});
							$ionicLoading.show();
							SmartRewards.updateKidClub(currentUser.Email, isReciveLetter, children).then(function(){
								$ionicLoading.hide();
								back();
							});
						}
					});
		       }
		     });
		}
		$scope.cancel = function(){
			back();
		}
		// Init -------------------------------------------------------------
		if($stateParams.id){
			id = parseInt($stateParams.id);
		}
		loadData();
	}
]);