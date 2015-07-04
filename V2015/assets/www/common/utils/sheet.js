angular.module('MCMRelationshop.Sheet', [])
.directive('mcmSheet', ['$document', function($document) {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    transclude: true,
    link: function($scope, $element){
      var keyUp = function(e) {
        if(e.which == 27) {
          $scope.cancel();
          $scope.$apply();
        }
      };

      var backdropClick = function(e) {
        if(e.target == $element[0]) {
          $scope.cancel();
          $scope.$apply();
        }
      };
      $scope.$on('$destroy', function() {
        $element.remove();
        $document.unbind('keyup', keyUp);
      });

      $document.bind('keyup', keyUp);
      $element.bind('click', backdropClick);
    },
    template: '<div class="mcm-sheet-backdrop">' +
                '<div class="mcm-sheet-wrapper">' +
                  '<div class="mcm-sheet">' +
                    '<div class="mcm-sheet-group" ng-transclude></div>'+
                '</div>' +
              '</div>'
  };
}])
.factory('$Sheet', ['$rootScope',
	'$compile',
	'$animate',
	'$timeout',
	'$ionicTemplateLoader',
	'$ionicPlatform',
	'$ionicBody',
	function($rootScope, $compile, $animate, $timeout, $ionicTemplateLoader, $ionicPlatform, $ionicBody) {
		extend = angular.extend,
		forEach = angular.forEach,
		isDefined = angular.isDefined,
		isString = angular.isString,
		jqLite = angular.element;
		var PLATFORM_BACK_BUTTON_PRIORITY_ACTION_SHEET = 300;
		return {
			show: sheet
		};

		function sheet(opts, templateString){
			if(!templateString && opts.templateUrl){
				return $ionicTemplateLoader.load(opts.templateUrl).then(function(templateString){
					return sheet(opts, templateString)
				});
			}
			var scope = opts.scope && opts.scope.$new() || $rootScope.$new(true);
			angular.extend(scope, {
				cancel: angular.noop,
				destructiveButtonClicked: angular.noop,
				buttonClicked: angular.noop,
				$deregisterBackButton: angular.noop,
				buttons: [],
				cancelOnStateChange: true
			}, opts || {});

			// Compile the template
			var element = scope.element = $compile('<mcm-sheet buttons="buttons">'+templateString+'</mcm-sheet>')(scope);
			// Grab the sheet element for animation
			var sheetEl = jqLite(element[0].querySelector('.mcm-sheet-wrapper'));

			var stateChangeListenDone = scope.cancelOnStateChange ?
				$rootScope.$on('$stateChangeSuccess', function() { scope.cancel(); }) :
				angular.noop;
			// removes the actionSheet from the screen
			scope.removeSheet = function(done) {
			  	if (scope.removed) return;

				scope.removed = true;
				sheetEl.removeClass('mcm-sheet-up');
				$ionicBody.removeClass('mcm-sheet-open');
				scope.$deregisterBackButton();
				stateChangeListenDone();

				$animate.removeClass(element, 'active', function() {
					scope.$destroy();
					element.remove();
					// scope.cancel.$scope is defined near the bottom
					scope.cancel.$scope = null;
					(done || angular.noop)();
				});
			};
			scope.showSheet = function(done) {
				if (scope.removed) return;

				$ionicBody.append(element)
					.addClass('mcm-sheet-open');

				$animate.addClass(element, 'active', function() {
					if (scope.removed) return;
					(done || angular.noop)();
				});
				$timeout(function() {
					if (scope.removed) return;
					sheetEl.addClass('mcm-sheet-up');
				}, 20, false);
			};
			// registerBackButtonAction returns a callback to deregister the action
			scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(
				function() {
					$timeout(scope.cancel);
				},
				PLATFORM_BACK_BUTTON_PRIORITY_ACTION_SHEET
			);

			// called when the user presses the cancel button
			scope.cancel = function() {
				// after the animation is out, call the cancel callback
				scope.removeSheet(opts.cancel);
			};

			scope.buttonClicked = function(index) {
				// Check if the button click event returned true, which means
				// we can close the action sheet
				if (opts.buttonClicked(index, opts.buttons[index]) === true) {
					scope.removeSheet();
				}
			};

			scope.destructiveButtonClicked = function() {
				// Check if the destructive button click event returned true, which means
				// we can close the action sheet
				if (opts.destructiveButtonClicked() === true) {
					scope.removeSheet();
				}
			};

			scope.showSheet();

			// Expose the scope on $ionicActionSheet's return value for the sake
			// of testing it.
			scope.cancel.$scope = scope;

			return scope.cancel;
		}// sheet
	}// root function
 ]);