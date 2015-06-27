angular.module('MCMRelationshop.Directive.PasswordMatch', [])
	.directive('pwCheck', ['$parse',
	function ($parse) {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function (scope, elem, attrs, ctrl) {
				if (!ctrl) return;
				if (!attrs['pwCheck']) return;
				var firstPassword = $parse(attrs['pwCheck']);
				var validator = function (value) {
					var temp = firstPassword(scope),v;
					value = value || '';
					temp = temp || ''; 					
					v = value === temp;
					ctrl.$setValidity('match', v);
					return value;
				}
				ctrl.$parsers.unshift(validator);
				ctrl.$formatters.push(validator);
				attrs.$observe('pwCheck', function (confirmPassword) {
					validator(ctrl.$viewValue);
				});

			}
		}
	}
]);
