angular.module('MCMRelationshop.Directive.FormDirective',[
])
.directive('match', ['$parse',
	function ($parse) {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function (scope, elem, attrs, ctrl) {
				if(!ctrl) {
					if(console && console.warn){
						console.warn('Match validation requires ngModel to be on the element');
					}
					return;
				}

				var matchGetter = $parse(attrs.match);
				var modelSetter = $parse(attrs.ngModel).assign;

				scope.$watch(attrs.match, function(){
					modelSetter(scope, parser(ctrl.$viewValue));
				});

				ctrl.$parsers.unshift(parser);
				ctrl.$formatters.unshift(formatter);

				function parser(viewValue){
					var oriViewValue = viewValue;				
					var unmask = function(val){
						val = ''+val;
						
						// just cheat for card mask
						if(attrs.card == 'true' && val && val.length>2){
							val = val.replace('440', '');
						}
						return val.replace(/_/g, '');
					}
					viewValue = attrs['uiMask'] ? unmask(viewValue): viewValue;
					if((ctrl.$pristine && ctrl.$isEmpty(viewValue)) || viewValue === matchGetter(scope)){
						ctrl.$setValidity('match', true);
						return oriViewValue;
					}else{
						if(_.isEmpty(viewValue) || viewValue == 'undefined' || (ctrl.$error && ctrl.$error.required)){
							ctrl.$setValidity('match', true);
						}
						else {
							ctrl.$setValidity('match', false);
						}
						return oriViewValue;
					}
				}

				function formatter(modelValue){
					return modelValue === undefined? ctrl.$isEmpty(ctrl.$viewValue)? undefined : ctrl.$viewValue : modelValue;
				}
			}// link
		};
	}
])
.directive('serverValidate',[
	function(){
		return {
			restrict: 'A',
			require:'?ngModel',
			link: function(scope, element, attrs, ctrl){
				var fn = function(){
					scope.$apply(function(){
						ctrl.$setValidity('server', true);
					});
				};
				element.on('keydown', fn);
				element.on('change', fn);
			}	
		}
	}
]);