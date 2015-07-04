angular.module('MCMRelationshop.Directive.Compile', [], function($compileProvider){
	$compileProvider.directive('compile', ['$parse', '$compile', function($parse, $compile) {
		return function(scope, element, attrs){
			scope.$watch(
				function(scope){
					return scope.$eval(attrs.compile);
				},
				function(value){
					element.html(value);
					$compile(element.contents())(scope);
				}
			);
		};//return	
	}]);
});